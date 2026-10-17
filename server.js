import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const answersFilePath = path.join(__dirname, 'answer', 'answer.json');
const publicAnswersPath = path.join(__dirname, 'public', 'answer', 'answer.json');
const distAnswersPath = path.join(__dirname, 'dist', 'answer', 'answer.json');

const configFilePath = path.join(__dirname, 'src', 'config', 'proposalConfig.json');
const publicConfigPath = path.join(__dirname, 'public', 'config.json');
const distConfigPath = path.join(__dirname, 'dist', 'config.json');

// Helper to read answers
function getStoredAnswers() {
  try {
    if (fs.existsSync(answersFilePath)) {
      const data = fs.readFileSync(answersFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading answer/answer.json:', err);
  }
  return {
    lastUpdated: null,
    partnerName: 'Aparna',
    senderName: 'Adithya',
    proposalDecision: 'pending',
    totalAnswered: 0,
    responses: [],
  };
}

// Helper to write answers to all relevant target locations
function saveStoredAnswers(data) {
  const jsonStr = JSON.stringify(data, null, 2);

  // Ensure answer/ directory exists
  const answerDir = path.dirname(answersFilePath);
  if (!fs.existsSync(answerDir)) fs.mkdirSync(answerDir, { recursive: true });
  fs.writeFileSync(answersFilePath, jsonStr, 'utf-8');

  // Also sync to public/answer/answer.json
  try {
    const pubDir = path.dirname(publicAnswersPath);
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
    fs.writeFileSync(publicAnswersPath, jsonStr, 'utf-8');
  } catch (e) {
    console.warn('Could not sync to public/answer/answer.json:', e);
  }

  // Also sync to dist/answer/answer.json if built
  try {
    const distDir = path.dirname(distAnswersPath);
    if (fs.existsSync(path.join(__dirname, 'dist'))) {
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(distAnswersPath, jsonStr, 'utf-8');
    }
  } catch (e) {
    console.warn('Could not sync to dist/answer/answer.json:', e);
  }
}

// API: Save or update an answer
app.post('/api/save-answer', (req, res) => {
  try {
    const {
      partnerName = 'Aparna',
      senderName = 'Adithya',
      questionId,
      question,
      answerId,
      answer,
      proposalDecision,
      allResponses,
    } = req.body;

    const currentData = getStoredAnswers();
    currentData.lastUpdated = new Date().toISOString();
    currentData.partnerName = partnerName;
    currentData.senderName = senderName;

    if (proposalDecision) {
      currentData.proposalDecision = proposalDecision;
    }

    if (Array.isArray(allResponses) && allResponses.length > 0) {
      currentData.responses = allResponses;
    } else if (questionId && question && answer) {
      const existingIdx = currentData.responses.findIndex((r) => r.questionId === questionId);
      const record = {
        questionId,
        question,
        answerId: answerId || null,
        answer,
        timestamp: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        currentData.responses[existingIdx] = record;
      } else {
        currentData.responses.push(record);
      }
    }

    currentData.totalAnswered = currentData.responses.length;
    saveStoredAnswers(currentData);

    console.log(`[ANSWERS] Saved answer for "${question}" -> "${answer}". Total: ${currentData.totalAnswered}`);
    return res.json({
      success: true,
      message: 'Answer saved successfully to answers.json',
      data: currentData,
    });
  } catch (error) {
    console.error('Error saving answer:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get all stored answers
app.get('/api/answers', (req, res) => {
  const data = getStoredAnswers();
  res.json(data);
});

// API: Download answer.json directly
app.get('/api/answers/download', (req, res) => {
  if (fs.existsSync(answersFilePath)) {
    res.download(answersFilePath, 'answer.json');
  } else {
    res.status(404).json({ error: 'No answers file found yet.' });
  }
});

// API: Update questions and config in production
app.post('/api/update-config', (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || !newConfig.questions || !newConfig.proposal) {
      return res.status(400).json({ success: false, error: 'Invalid configuration format' });
    }

    const jsonStr = JSON.stringify(newConfig, null, 2);
    // Write to public/config.json
    fs.writeFileSync(publicConfigPath, jsonStr, 'utf-8');

    // Also write to src/config/proposalConfig.json if src directory exists
    try {
      if (fs.existsSync(path.dirname(configFilePath))) {
        fs.writeFileSync(configFilePath, jsonStr, 'utf-8');
      }
    } catch {
      // Ignored in minimal production container
    }

    // Also write to dist/config.json if dist exists
    try {
      if (fs.existsSync(distConfigPath)) {
        fs.writeFileSync(distConfigPath, jsonStr, 'utf-8');
      }
    } catch {
      // Ignored
    }

    console.log('[CONFIG] Successfully updated questions configuration in production.');
    return res.json({ success: true, message: 'Configuration updated successfully' });
  } catch (err) {
    console.error('Error updating config:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Serve production static assets from dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.send('Project running in API mode. Run "npm run build" to generate the frontend dist.');
  });
}

app.listen(PORT, () => {
  console.log(`💖 Romantic Proposal Server running on http://localhost:${PORT}`);
  console.log(`📁 Answers will be saved to: ${answersFilePath}`);
});
