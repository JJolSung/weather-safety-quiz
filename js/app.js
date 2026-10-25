// Screen flow and state: Home → Question → Feedback → Result.
// Content comes from content/quiz.json; quiz rules live in quiz.js.

import {
  createQuiz,
  answerQuestion,
  nextQuestion,
  restartQuiz,
  currentQuestion,
  isCorrect,
  resultMessage,
  validateContent,
} from './quiz.js';
import { mountScenes } from './scenes.js';

const main = document.getElementById('main');
const brand = document.getElementById('brand');
const demoNotice = document.getElementById('demo-notice');

let content = null;
let quiz = null;

const LETTERS = 'ABCDEFGHIJ';

// --- helpers ----------------------------------------------------------------

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const ICON_CHECK =
  '<svg class="icon icon-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_CROSS =
  '<svg class="icon icon-cross" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';

// Replace the main view and move focus to its heading so keyboard and
// screen-reader users land in the right place after each screen change.
function showView(html, { focus = 'h1' } = {}) {
  main.innerHTML = `<div class="view">${html}</div>`;
  mountScenes(main);
  const target = main.querySelector(focus);
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0 });
}

// --- loading ----------------------------------------------------------------

async function init() {
  try {
    const res = await fetch('content/quiz.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`The server answered with status ${res.status}.`);
    content = await res.json();
  } catch (err) {
    renderError('Could not load the quiz content.', [
      err.message,
      'If you opened index.html directly as a file, please start a local web server instead (see README).',
    ]);
    return;
  }

  const check = validateContent(content);
  if (!check.ok) {
    renderError('The quiz content file (content/quiz.json) has errors:', check.errors);
    return;
  }

  document.title = content.appTitle;
  brand.textContent = content.appTitle;
  demoNotice.textContent = content.demoNotice ?? '';

  window.addEventListener('hashchange', route);
  route();
}

function renderError(title, details) {
  showView(`
    <section class="card error-card" role="alert">
      <h1>${esc(title)}</h1>
      <ul>${details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
    </section>
  `);
}

// --- routing ----------------------------------------------------------------

function route() {
  const match = location.hash.match(/^#\/scenario\/([\w-]+)$/);
  const scenario = match && content.scenarios.find((s) => s.id === match[1]);

  if (scenario) {
    // A fresh visit to a scenario (from Home or a direct link) starts over.
    if (!quiz || quiz.scenario !== scenario) quiz = createQuiz(scenario);
    renderQuiz();
    return;
  }

  quiz = null;
  if (location.hash && location.hash !== '#/') {
    history.replaceState(null, '', '#/');
  }
  renderHome();
}

// --- Home -------------------------------------------------------------------

function renderHome() {
  const cards = content.scenarios
    .map((s) => {
      const n = s.questions.length;
      return `
        <li>
          <a class="scenario-card theme-${esc(s.theme)}" href="#/scenario/${esc(s.id)}">
            <div class="scene-slot" data-theme="${esc(s.theme)}"></div>
            <div class="card-body">
              <h3>${esc(s.title)}</h3>
              <p>${esc(s.intro)}</p>
              <span class="card-cta">Start quiz · ${n} question${n === 1 ? '' : 's'}</span>
            </div>
          </a>
        </li>`;
    })
    .join('');

  showView(`
    <section class="home">
      <div class="hero">
        <div class="hero-inner">
          <h1>${esc(content.appTitle)}</h1>
          <p class="lead">${esc(content.appIntro ?? '')}</p>
        </div>
      </div>
      <h2 class="section-title">Choose a scenario</h2>
      <ul class="scenario-grid">${cards}</ul>
    </section>
  `);
}

// --- Question / Feedback ----------------------------------------------------

function renderQuiz() {
  const s = quiz.scenario;
  showView(`
    <section class="quiz theme-${esc(s.theme)}">
      <div class="quiz-banner">
        <div class="scene-slot" data-theme="${esc(s.theme)}"></div>
        <div class="banner-text">
          <a class="back-link" href="#/">← All scenarios</a>
          <h1>${esc(s.title)}</h1>
        </div>
      </div>
      <div id="quiz-card" class="card quiz-card"></div>
    </section>
  `, { focus: 'h1' });
  renderQuizCard();
}

function renderQuizCard() {
  const card = document.getElementById('quiz-card');
  if (quiz.finished) {
    renderResult();
    return;
  }

  const q = currentQuestion(quiz);
  const chosen = quiz.answers[quiz.index];
  const answered = chosen !== null;
  const number = quiz.index + 1;
  const percent = Math.round((number / quiz.total) * 100);

  const options = q.options
    .map((label, i) => {
      const classes = ['option'];
      let mark = '';
      let sr = '';
      if (answered) {
        if (i === q.correctIndex) {
          classes.push('is-correct');
          mark = ICON_CHECK;
          sr = 'Correct answer';
        }
        if (i === chosen && i !== q.correctIndex) {
          classes.push('is-wrong');
          mark = ICON_CROSS;
          sr = 'Your answer';
        }
        if (i === chosen) classes.push('is-chosen');
      }
      return `
        <li>
          <button type="button" class="${classes.join(' ')}" data-index="${i}" ${answered ? 'disabled' : ''}>
            <span class="option-letter" aria-hidden="true">${LETTERS[i] ?? i + 1}</span>
            <span class="option-label">${esc(label)}</span>
            <span class="option-mark">${mark}</span>
            ${sr ? `<span class="sr-only"> — ${sr}</span>` : ''}
          </button>
        </li>`;
    })
    .join('');

  let feedback = '';
  if (answered) {
    const correct = isCorrect(q, chosen);
    const isLast = quiz.index + 1 >= quiz.total;
    const prefix = content.learnMoreLabel ?? 'Learn more';
    feedback = `
      <div class="feedback ${correct ? 'is-correct' : 'is-wrong'}">
        <p class="feedback-title">
          ${correct ? ICON_CHECK : ICON_CROSS}
          <span>${correct ? 'Correct!' : `Not quite — the safe choice is ${LETTERS[q.correctIndex]}.`}</span>
        </p>
        <p class="feedback-text">${esc(q.explanation)}</p>
        ${q.learnMoreUrl ? `
          <p class="learn-more">${esc(prefix)}:
            <a href="${esc(q.learnMoreUrl)}" target="_blank" rel="noopener noreferrer">${esc(q.learnMoreLabel ?? q.learnMoreUrl)}<span class="sr-only"> (opens in a new tab)</span> ↗</a>
          </p>` : ''}
        <button type="button" class="btn btn-primary" id="next-btn">
          ${isLast ? 'See results' : 'Next question'} →
        </button>
      </div>`;
  }

  card.innerHTML = `
    <div class="progress">
      <p class="progress-text">Question ${number} of ${quiz.total}</p>
      <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${quiz.total}" aria-valuenow="${number}" aria-label="Quiz progress">
        <span style="width:${percent}%"></span>
      </div>
    </div>
    <h2 class="question-text" id="question-text">${esc(q.question)}</h2>
    <ul class="options" aria-labelledby="question-text">${options}</ul>
    <div class="feedback-slot" aria-live="polite">${feedback}</div>
  `;

  if (!answered) {
    card.querySelectorAll('.option').forEach((btn) => {
      btn.addEventListener('click', () => {
        quiz = answerQuestion(quiz, Number(btn.dataset.index));
        renderQuizCard();
        document.getElementById('next-btn')?.focus();
      });
    });
  } else {
    document.getElementById('next-btn').addEventListener('click', () => {
      quiz = nextQuestion(quiz);
      renderQuizCard();
      const heading = document.getElementById('question-text') ?? document.querySelector('.result-card h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// --- Result -----------------------------------------------------------------

function renderResult() {
  const card = document.getElementById('quiz-card');
  const s = quiz.scenario;
  const prefix = content.learnMoreLabel ?? 'Learn more';

  const review = s.questions
    .map((q, i) => {
      const ok = isCorrect(q, quiz.answers[i]);
      return `
        <li class="${ok ? 'is-correct' : 'is-wrong'}">
          ${ok ? ICON_CHECK : ICON_CROSS}
          <div>
            <p class="review-question">${esc(q.question)}</p>
            <p class="review-answer">Safe choice: ${esc(q.options[q.correctIndex])}</p>
            ${q.learnMoreUrl ? `<a class="review-link" href="${esc(q.learnMoreUrl)}" target="_blank" rel="noopener noreferrer">${esc(prefix)}: ${esc(q.learnMoreLabel ?? q.learnMoreUrl)}<span class="sr-only"> (opens in a new tab)</span> ↗</a>` : ''}
          </div>
        </li>`;
    })
    .join('');

  card.className = 'card quiz-card result-card';
  card.innerHTML = `
    <p class="eyebrow">${esc(s.title)} · Results</p>
    <p class="score"><span class="score-value" id="score-value">${quiz.score}</span><span class="score-total"> / ${quiz.total}</span></p>
    <h2 class="result-message">${esc(resultMessage(quiz.score, quiz.total))}</h2>

    <h3>Key takeaways</h3>
    <p class="summary">${esc(s.summary ?? '')}</p>

    <h3>Your answers</h3>
    <ol class="review">${review}</ol>

    <div class="actions">
      <button type="button" class="btn btn-primary" id="retry-btn">Try again</button>
      <a class="btn btn-secondary" href="#/">Choose another scenario</a>
    </div>
  `;

  document.getElementById('retry-btn').addEventListener('click', () => {
    quiz = restartQuiz(quiz);
    card.className = 'card quiz-card';
    renderQuizCard();
    document.getElementById('question-text')?.focus();
  });
}

init();
