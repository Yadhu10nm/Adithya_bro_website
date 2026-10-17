import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function answersApiPlugin(): Plugin {
  return {
    name: 'answers-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const answersFilePath = path.resolve(process.cwd(), 'answer/answer.json');
        const publicAnswersPath = path.resolve(process.cwd(), 'public/answer/answer.json');
        const publicConfigPath = path.resolve(process.cwd(), 'public/config.json');
        const srcConfigPath = path.resolve(process.cwd(), 'src/config/proposalConfig.json');

        if (req.url === '/api/save-answer' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              let currentData: any = {
                lastUpdated: null,
                partnerName: 'Aparna',
                senderName: 'Adithya',
                proposalDecision: 'pending',
                totalAnswered: 0,
                responses: [],
              };

              if (fs.existsSync(answersFilePath)) {
                currentData = JSON.parse(fs.readFileSync(answersFilePath, 'utf-8'));
              }

              currentData.lastUpdated = new Date().toISOString();
              if (payload.partnerName) currentData.partnerName = payload.partnerName;
              if (payload.senderName) currentData.senderName = payload.senderName;
              if (payload.proposalDecision) currentData.proposalDecision = payload.proposalDecision;

              if (payload.questionId && payload.question && payload.answer) {
                const existingIdx = currentData.responses.findIndex(
                  (r: any) => r.questionId === payload.questionId
                );
                const record = {
                  questionId: payload.questionId,
                  question: payload.question,
                  answerId: payload.answerId || null,
                  answer: payload.answer,
                  timestamp: new Date().toISOString(),
                };

                if (existingIdx >= 0) {
                  currentData.responses[existingIdx] = record;
                } else {
                  currentData.responses.push(record);
                }
              }

              currentData.totalAnswered = currentData.responses.length;
              const jsonStr = JSON.stringify(currentData, null, 2);

              const answerDir = path.dirname(answersFilePath);
              if (!fs.existsSync(answerDir)) fs.mkdirSync(answerDir, { recursive: true });
              fs.writeFileSync(answersFilePath, jsonStr, 'utf-8');

              const pubAnsDir = path.dirname(publicAnswersPath);
              if (!fs.existsSync(pubAnsDir)) fs.mkdirSync(pubAnsDir, { recursive: true });
              fs.writeFileSync(publicAnswersPath, jsonStr, 'utf-8');

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: currentData }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/answers' && req.method === 'GET') {
          let currentData = { responses: [] };
          if (fs.existsSync(answersFilePath)) {
            currentData = JSON.parse(fs.readFileSync(answersFilePath, 'utf-8'));
          }
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(currentData));
          return;
        }

        if (req.url === '/api/answers/download' && req.method === 'GET') {
          if (fs.existsSync(answersFilePath)) {
            res.setHeader(
              'Content-Disposition',
              'attachment; filename="answer.json"'
            );
            res.setHeader('Content-Type', 'application/json');
            res.end(fs.readFileSync(answersFilePath));
          } else {
            res.statusCode = 404;
            res.end('Not found');
          }
          return;
        }

        if (req.url === '/api/update-config' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const newConfig = JSON.parse(body || '{}');
              const jsonStr = JSON.stringify(newConfig, null, 2);
              fs.writeFileSync(publicConfigPath, jsonStr, 'utf-8');
              fs.writeFileSync(srcConfigPath, jsonStr, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), answersApiPlugin()],
});
