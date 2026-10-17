export interface SavedAnswerRecord {
  questionId: string;
  question: string;
  answerId: string | null;
  answer: string;
  timestamp: string;
}

export interface AnswersFileData {
  lastUpdated: string | null;
  partnerName: string;
  senderName: string;
  proposalDecision: 'pending' | 'yes' | 'no';
  totalAnswered: number;
  responses: SavedAnswerRecord[];
}

const LOCAL_STORAGE_KEY = 'aparna_adithya_answers';

/**
 * Saves or updates an answer both on the project server (answers.json) and in localStorage.
 */
export async function saveAnswerToServer(params: {
  partnerName?: string;
  senderName?: string;
  questionId: string;
  question: string;
  answerId?: string;
  answer: string;
  proposalDecision?: 'pending' | 'yes' | 'no';
}): Promise<{ success: boolean; data?: AnswersFileData }> {
  const {
    partnerName = 'Aparna',
    senderName = 'Adithya',
    questionId,
    question,
    answerId,
    answer,
    proposalDecision,
  } = params;

  // 1. Update localStorage cache
  let localData: AnswersFileData = {
    lastUpdated: new Date().toISOString(),
    partnerName,
    senderName,
    proposalDecision: proposalDecision || 'pending',
    totalAnswered: 0,
    responses: [],
  };

  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existing) {
      localData = JSON.parse(existing);
    }
  } catch (err) {
    console.warn('Could not read from localStorage:', err);
  }

  localData.lastUpdated = new Date().toISOString();
  localData.partnerName = partnerName;
  localData.senderName = senderName;
  if (proposalDecision) localData.proposalDecision = proposalDecision;

  const existingIdx = localData.responses.findIndex((r) => r.questionId === questionId);
  const record: SavedAnswerRecord = {
    questionId,
    question,
    answerId: answerId || null,
    answer,
    timestamp: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    localData.responses[existingIdx] = record;
  } else {
    localData.responses.push(record);
  }

  localData.totalAnswered = localData.responses.length;

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localData, null, 2));
  } catch (err) {
    console.warn('Could not write to localStorage:', err);
  }

  // 2. Send POST request to backend API to write to answers.json in project
  try {
    const response = await fetch('/api/save-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        partnerName,
        senderName,
        questionId,
        question,
        answerId,
        answer,
        proposalDecision,
        allResponses: localData.responses,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Answer saved to project answers.json:', result);
      return { success: true, data: result.data };
    }
  } catch (apiError) {
    console.warn('Server API unavailable, saved to localStorage fallback:', apiError);
  }

  return { success: true, data: localData };
}

/**
 * Download the answers.json directly from frontend
 */
export function downloadAnswersAsJson(data?: AnswersFileData) {
  let content = '';
  if (data) {
    content = JSON.stringify(data, null, 2);
  } else {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    content = local || JSON.stringify({ responses: [] }, null, 2);
  }

  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aparna_adithya_answers.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
