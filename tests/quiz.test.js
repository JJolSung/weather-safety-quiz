import { test, assert, assertEqual, run, loadJson } from './runner.js';
import {
  createQuiz,
  answerQuestion,
  nextQuestion,
  restartQuiz,
  currentQuestion,
  isCorrect,
  resultMessage,
  validateContent,
} from '../js/quiz.js';

// --- fixtures ---------------------------------------------------------------

function makeScenario(questionCount = 3) {
  const questions = [];
  for (let i = 0; i < questionCount; i++) {
    questions.push({
      question: `Question ${i + 1}?`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: i % 4,
      explanation: `Because ${i + 1}.`,
      learnMoreLabel: 'MeteoSwiss',
      learnMoreUrl: 'https://www.meteoswiss.admin.ch',
    });
  }
  return {
    id: 'test',
    title: 'Test scenario',
    intro: 'Intro.',
    theme: 'flood',
    questions,
    summary: 'Summary.',
  };
}

// --- createQuiz -------------------------------------------------------------

test('createQuiz starts at the first question with no score', () => {
  const state = createQuiz(makeScenario());
  assertEqual(state.index, 0);
  assertEqual(state.score, 0);
  assertEqual(state.finished, false);
  assertEqual(state.answers, [null, null, null]);
});

test('createQuiz works for any number of questions', () => {
  const state = createQuiz(makeScenario(5));
  assertEqual(state.answers.length, 5);
  assertEqual(state.total, 5);
});

test('currentQuestion returns the question at the current index', () => {
  const scenario = makeScenario();
  const state = createQuiz(scenario);
  assertEqual(currentQuestion(state), scenario.questions[0]);
});

// --- answerQuestion ---------------------------------------------------------

test('answering correctly records the answer and adds one point', () => {
  const state = answerQuestion(createQuiz(makeScenario()), 0); // Q1 correct = 0
  assertEqual(state.answers[0], 0);
  assertEqual(state.score, 1);
});

test('answering incorrectly records the answer and adds no points', () => {
  const state = answerQuestion(createQuiz(makeScenario()), 3);
  assertEqual(state.answers[0], 3);
  assertEqual(state.score, 0);
});

test('a question is locked after the first answer', () => {
  let state = answerQuestion(createQuiz(makeScenario()), 3); // wrong
  state = answerQuestion(state, 0); // try to switch to the correct one
  assertEqual(state.answers[0], 3, 'first answer must be kept');
  assertEqual(state.score, 0);
});

test('answerQuestion does not mutate the previous state', () => {
  const before = createQuiz(makeScenario());
  const snapshot = JSON.stringify(before);
  answerQuestion(before, 0);
  assertEqual(JSON.stringify(before), snapshot);
});

test('answerQuestion ignores out-of-range option indexes', () => {
  const start = createQuiz(makeScenario());
  assertEqual(answerQuestion(start, -1), start);
  assertEqual(answerQuestion(start, 4), start);
});

// --- nextQuestion -----------------------------------------------------------

test('nextQuestion moves to the following question after answering', () => {
  let state = answerQuestion(createQuiz(makeScenario()), 0);
  state = nextQuestion(state);
  assertEqual(state.index, 1);
  assertEqual(state.finished, false);
});

test('nextQuestion does nothing while the current question is unanswered', () => {
  const start = createQuiz(makeScenario());
  assertEqual(nextQuestion(start), start);
});

test('nextQuestion after the last question marks the quiz finished', () => {
  let state = createQuiz(makeScenario(2));
  state = nextQuestion(answerQuestion(state, 0));
  state = nextQuestion(answerQuestion(state, 1));
  assertEqual(state.finished, true);
  assertEqual(state.score, 2);
});

test('answerQuestion is ignored once the quiz is finished', () => {
  let state = createQuiz(makeScenario(1));
  state = nextQuestion(answerQuestion(state, 3)); // wrong, then finish
  const after = answerQuestion(state, 0);
  assertEqual(after, state);
});

// --- restartQuiz ------------------------------------------------------------

test('restartQuiz returns to a fresh state for the same scenario', () => {
  const scenario = makeScenario();
  let state = createQuiz(scenario);
  state = nextQuestion(answerQuestion(state, 0));
  state = nextQuestion(answerQuestion(state, 1));
  state = nextQuestion(answerQuestion(state, 2));
  assertEqual(state.finished, true);

  const fresh = restartQuiz(state);
  assertEqual(fresh, createQuiz(scenario));
});

// --- helpers ----------------------------------------------------------------

test('isCorrect compares an option index with the correct one', () => {
  const q = makeScenario().questions[1]; // correctIndex 1
  assertEqual(isCorrect(q, 1), true);
  assertEqual(isCorrect(q, 0), false);
});

test('resultMessage gives a different message for full, partial and zero scores', () => {
  const full = resultMessage(3, 3);
  const partial = resultMessage(2, 3);
  const zero = resultMessage(0, 3);
  assert(typeof full === 'string' && full.length > 0, 'full message is a string');
  assert(full !== partial, 'full differs from partial');
  assert(partial !== zero, 'partial differs from zero');
  assert(full !== zero, 'full differs from zero');
});

// --- validateContent --------------------------------------------------------

test('validateContent accepts a well-formed content file', () => {
  const result = validateContent({ appTitle: 'T', scenarios: [makeScenario()] });
  assertEqual(result, { ok: true, errors: [] });
});

test('validateContent rejects content without scenarios', () => {
  const result = validateContent({ appTitle: 'T' });
  assertEqual(result.ok, false);
  assert(result.errors.length > 0);
});

test('validateContent rejects a correctIndex outside the options', () => {
  const scenario = makeScenario(1);
  scenario.questions[0].correctIndex = 4;
  const result = validateContent({ appTitle: 'T', scenarios: [scenario] });
  assertEqual(result.ok, false);
  assert(result.errors[0].includes('correctIndex'), result.errors[0]);
});

test('validateContent rejects a scenario with no questions', () => {
  const scenario = makeScenario(0);
  const result = validateContent({ appTitle: 'T', scenarios: [scenario] });
  assertEqual(result.ok, false);
});

test('the shipped content/quiz.json passes validation', async () => {
  const data = await loadJson('content/quiz.json');
  const result = validateContent(data);
  assertEqual(result, { ok: true, errors: [] });
});

run();
