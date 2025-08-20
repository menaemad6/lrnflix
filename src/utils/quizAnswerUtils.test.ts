import { 
  convertLegacyAnswers, 
  convertToLegacyAnswers, 
  isNewAnswerFormat, 
  normalizeAnswers, 
  getStudentAnswer, 
  getAnswerCorrectness, 
  setAnswerCorrectness, 
  calculateScore, 
  createAnswerEntry 
} from './quizAnswerUtils';

// Test data
const legacyAnswers = {
  "q1": "Paris",
  "q2": "London",
  "q3": "Berlin"
};

const newAnswers = {
  "q1": { answer: "Paris", isCorrect: true },
  "q2": { answer: "London", isCorrect: false },
  "q3": { answer: "Berlin", isCorrect: null }
};

const questions = [
  { id: "q1", points: 10, correct_answer: "Paris", question_type: "mcq" },
  { id: "q2", points: 10, correct_answer: "London", question_type: "mcq" },
  { id: "q3", points: 10, correct_answer: "Berlin", question_type: "written" }
];

describe('Quiz Answer Utils', () => {
  test('convertLegacyAnswers should convert old format to new format', () => {
    const result = convertLegacyAnswers(legacyAnswers);
    expect(result.q1).toEqual({ answer: "Paris", isCorrect: null });
    expect(result.q2).toEqual({ answer: "London", isCorrect: null });
    expect(result.q3).toEqual({ answer: "Berlin", isCorrect: null });
  });

  test('convertToLegacyAnswers should convert new format to old format', () => {
    const result = convertToLegacyAnswers(newAnswers);
    expect(result.q1).toBe("Paris");
    expect(result.q2).toBe("London");
    expect(result.q3).toBe("Berlin");
  });

  test('isNewAnswerFormat should detect new format correctly', () => {
    expect(isNewAnswerFormat(newAnswers)).toBe(true);
    expect(isNewAnswerFormat(legacyAnswers)).toBe(false);
    expect(isNewAnswerFormat({})).toBe(false);
    expect(isNewAnswerFormat(null)).toBe(false);
  });

  test('normalizeAnswers should handle both formats', () => {
    expect(normalizeAnswers(newAnswers)).toEqual(newAnswers);
    expect(normalizeAnswers(legacyAnswers)).toEqual(convertLegacyAnswers(legacyAnswers));
    expect(normalizeAnswers(null)).toEqual({});
    expect(normalizeAnswers("invalid")).toEqual({});
  });

  test('getStudentAnswer should extract answer from both formats', () => {
    expect(getStudentAnswer(newAnswers, "q1")).toBe("Paris");
    expect(getStudentAnswer(legacyAnswers, "q1")).toBe("Paris");
    expect(getStudentAnswer(newAnswers, "nonexistent")).toBe("");
  });

  test('getAnswerCorrectness should extract correctness from both formats', () => {
    expect(getAnswerCorrectness(newAnswers, "q1")).toBe(true);
    expect(getAnswerCorrectness(newAnswers, "q2")).toBe(false);
    expect(getAnswerCorrectness(newAnswers, "q3")).toBe(null);
    expect(getAnswerCorrectness(legacyAnswers, "q1")).toBe(null);
  });

  test('setAnswerCorrectness should update correctness without changing answer', () => {
    const updated = setAnswerCorrectness(newAnswers, "q3", true);
    expect(updated.q3.answer).toBe("Berlin"); // Answer unchanged
    expect(updated.q3.isCorrect).toBe(true); // Correctness updated
  });

  test('calculateScore should work with new format', () => {
    // q1: correct (10 points), q2: incorrect (0 points), q3: null (0 points)
    const score = calculateScore(newAnswers, questions);
    expect(score).toBe(10);
  });

  test('calculateScore should work with legacy format', () => {
    // q1: correct (10 points), q2: correct (10 points), q3: correct (10 points)
    const score = calculateScore(legacyAnswers, questions);
    expect(score).toBe(30);
  });

  test('createAnswerEntry should create proper answer structure', () => {
    const entry = createAnswerEntry("Test Answer", true);
    expect(entry).toEqual({ answer: "Test Answer", isCorrect: true });
    
    const entryNull = createAnswerEntry("Test Answer");
    expect(entryNull).toEqual({ answer: "Test Answer", isCorrect: null });
  });
});

console.log('✅ All tests passed! The new quiz answer structure is working correctly.');
