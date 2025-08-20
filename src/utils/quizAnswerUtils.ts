import { QuizAnswer, QuizAttemptAnswers, LegacyQuizAnswers } from '@/integrations/supabase/types';

/**
 * Converts legacy answer format to new format
 * Legacy: { "question_id": "answer" }
 * New: { "question_id": { "answer": "answer", "isCorrect": null } }
 */
export function convertLegacyAnswers(legacyAnswers: LegacyQuizAnswers): QuizAttemptAnswers {
  const newAnswers: QuizAttemptAnswers = {};
  
  for (const [questionId, answer] of Object.entries(legacyAnswers)) {
    newAnswers[questionId] = {
      answer: answer || '',
      isCorrect: null
    };
  }
  
  return newAnswers;
}

/**
 * Converts new answer format to legacy format for backward compatibility
 */
export function convertToLegacyAnswers(newAnswers: QuizAttemptAnswers): LegacyQuizAnswers {
  const legacyAnswers: LegacyQuizAnswers = {};
  
  for (const [questionId, answerData] of Object.entries(newAnswers)) {
    legacyAnswers[questionId] = answerData.answer;
  }
  
  return legacyAnswers;
}

/**
 * Checks if answers are in the new format
 */
export function isNewAnswerFormat(answers: any): answers is QuizAttemptAnswers {
  if (!answers || typeof answers !== 'object') return false;
  
  // Debug logging
  console.log('isNewAnswerFormat check:', {
    answers,
    keys: Object.keys(answers),
    firstValue: Object.values(answers)[0],
    hasAnswer: Object.values(answers)[0] && typeof Object.values(answers)[0] === 'object' && 'answer' in Object.values(answers)[0],
    hasIsCorrect: Object.values(answers)[0] && typeof Object.values(answers)[0] === 'object' && 'isCorrect' in Object.values(answers)[0]
  });
  
  // Check if any key has the new structure
  for (const value of Object.values(answers)) {
    if (value && typeof value === 'object' && 'answer' in value && 'isCorrect' in value) {
      return true;
    }
  }
  
  return false;
}

/**
 * Normalizes answers to always use the new format
 */
export function normalizeAnswers(answers: any): QuizAttemptAnswers {
  if (!answers) return {};
  
  if (isNewAnswerFormat(answers)) {
    return answers;
  }
  
  // Convert legacy format
  if (typeof answers === 'object') {
    return convertLegacyAnswers(answers);
  }
  
  // Handle string format (JSON)
  if (typeof answers === 'string') {
    try {
      const parsed = JSON.parse(answers);
      return normalizeAnswers(parsed);
    } catch {
      return {};
    }
  }
  
  return {};
}

/**
 * Gets the student's answer from either format
 */
export function getStudentAnswer(answers: any, questionId: string): string {
  const normalized = normalizeAnswers(answers);
  return normalized[questionId]?.answer || '';
}

/**
 * Gets the correctness status from either format
 */
export function getAnswerCorrectness(answers: any, questionId: string): boolean | null {
  const normalized = normalizeAnswers(answers);
  return normalized[questionId]?.isCorrect ?? null;
}

/**
 * Sets the correctness status for a question
 */
export function setAnswerCorrectness(
  answers: any, 
  questionId: string, 
  isCorrect: boolean
): QuizAttemptAnswers {
  const normalized = normalizeAnswers(answers);
  
  return {
    ...normalized,
    [questionId]: {
      ...normalized[questionId],
      isCorrect
    }
  };
}

/**
 * Calculates score based on answers and questions
 */
export function calculateScore(
  answers: any, 
  questions: Array<{ id: string; points: number; correct_answer?: string; question_type: string }>
): number {
  const normalized = normalizeAnswers(answers);
  let score = 0;
  
  for (const question of questions) {
    const answerData = normalized[question.id];
    if (!answerData) continue;
    
    if (question.question_type === 'mcq') {
      // For MCQ, check if answer matches correct_answer
      if (answerData.isCorrect === true || 
          (answerData.isCorrect === null && answerData.answer === question.correct_answer)) {
        score += question.points || 0;
      }
    } else if (question.question_type === 'written') {
      // For written questions, check the isCorrect flag
      if (answerData.isCorrect === true) {
        score += question.points || 0;
      }
    }
  }
  
  return score;
}

/**
 * Creates a new answer entry
 */
export function createAnswerEntry(answer: string, isCorrect: boolean | null = null): QuizAnswer {
  return {
    answer: answer || '',
    isCorrect
  };
}
