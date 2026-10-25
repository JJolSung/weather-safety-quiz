// Quiz logic: pure functions, no DOM. Every function returns a new state
// object and leaves the one it was given untouched.

export function createQuiz(scenario) {
  return {
    scenario,
    total: scenario.questions.length,
    index: 0,
    answers: scenario.questions.map(() => null),
    score: 0,
    finished: false,
  };
}

export function currentQuestion(state) {
  return state.scenario.questions[state.index];
}

export function isCorrect(question, optionIndex) {
  return question.correctIndex === optionIndex;
}

export function answerQuestion(state, optionIndex) {
  if (state.finished) return state;
  if (state.answers[state.index] !== null) return state;

  const question = currentQuestion(state);
  if (optionIndex < 0 || optionIndex >= question.options.length) return state;

  const answers = state.answers.slice();
  answers[state.index] = optionIndex;

  return {
    ...state,
    answers,
    score: state.score + (isCorrect(question, optionIndex) ? 1 : 0),
  };
}

export function nextQuestion(state) {
  if (state.finished) return state;
  if (state.answers[state.index] === null) return state;

  if (state.index + 1 >= state.total) {
    return { ...state, finished: true };
  }
  return { ...state, index: state.index + 1 };
}

export function restartQuiz(state) {
  return createQuiz(state.scenario);
}

export function resultMessage(score, total) {
  if (total > 0 && score === total) return 'Excellent — you know how to stay safe.';
  if (score === 0) return 'A tough one. Read the tips below and try again.';
  return 'Good work — review the tips below to close the gaps.';
}

// Checks the shape of content/quiz.json so that a typo in the file gives a
// readable message instead of a broken screen.
export function validateContent(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { ok: false, errors: ['Content must be a JSON object.'] };
  }
  if (!Array.isArray(data.scenarios) || data.scenarios.length === 0) {
    return { ok: false, errors: ['"scenarios" must be a non-empty list.'] };
  }

  data.scenarios.forEach((scenario, s) => {
    const where = `scenarios[${s}]`;
    for (const field of ['id', 'title', 'questions']) {
      if (scenario[field] === undefined) errors.push(`${where}: missing "${field}".`);
    }
    if (!Array.isArray(scenario.questions) || scenario.questions.length === 0) {
      errors.push(`${where}: "questions" must be a non-empty list.`);
      return;
    }
    scenario.questions.forEach((q, i) => {
      const qWhere = `${where}.questions[${i}]`;
      if (typeof q.question !== 'string') errors.push(`${qWhere}: missing "question".`);
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`${qWhere}: "options" needs at least two entries.`);
      } else if (
        !Number.isInteger(q.correctIndex) ||
        q.correctIndex < 0 ||
        q.correctIndex >= q.options.length
      ) {
        errors.push(
          `${qWhere}: "correctIndex" must be between 0 and ${q.options.length - 1}.`,
        );
      }
    });
  });

  return { ok: errors.length === 0, errors };
}
