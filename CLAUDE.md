# Extreme Weather Safety Quiz — 프로젝트 맥락

## 목적

Upwork 공고 지원용 **데모 앱**. (1) 지원서에 넣을 실제 동작하는 GitHub Pages 데모 링크, (2) 수주 시 Sprint 1 기반 코드로 그대로 사용.

클라이언트가 첫 10초 안에 느껴야 하는 것:
1. 요구사항을 정확히 읽었다 — 홈에 시나리오 3개(Flooding / Heatwaves / Severe thunderstorms)가 바로 보이고 클릭 한 번에 퀴즈 시작
2. 이미 거의 완성됐다 — 과제 제출용으로 보일 만큼 깔끔한 레이아웃, 모바일에서도 자연스러움
3. 다른 지원자와 다르다 — 시나리오 카드의 날씨 애니메이션(비·아지랑이·번개)이 은은하게 움직임. 화려함보다 **차분하고 신뢰감 있는 교육용 톤**

과하게 꾸미지 않는다. 학생들이 교수님께 보여줘도 자랑스러울 결과물이 핵심.

## 클라이언트 요구사항 (반드시 준수)

- 클라이언트: 스위스 대학생 3명, Information Management 과제
- 스위스 학생용 극한 기상 안전 수칙 교육 퀴즈 웹앱 프로토타입
- 홈: 시나리오 3개 — Flooding / Heatwaves / Severe thunderstorms
- 시나리오당 객관식 3문항, 답변 후 피드백(설명 + 공식 가이드 링크), 마지막에 점수 + 요약, 다시 하기 / 다른 시나리오 선택
- 콘텐츠는 편집 가능한 JSON에 저장. 시나리오·문항 수가 바뀌어도 코드 수정 없이 동작
- 모바일·데스크톱 반응형. UI 언어 영어
- 범위 밖: 계정, 결제, 실시간 경보, DB, 앱스토어
- 납품물: 소스, README(로컬 설치·실행), LICENSES.md(의존성·에셋·라이선스), AI_DISCLOSURE.md(생성형 AI 사용 내역 + 사람의 검증 방법)
- 일정: Sprint 1(10/27~11/1) 시나리오 1개 / Sprint 2(11/2~11/6) 나머지 + 피드백 반영

## 콘텐츠 원칙

- 실제 콘텐츠는 클라이언트 제공. 데모는 샘플 문항 + 화면 하단·README에 `Sample content for demo purposes — will be replaced with client-supplied content.`
- 일반적이고 검증 가능한 안전 수칙만. 확실하지 않은 수치·주장 금지
- 가이드 링크는 최상위 도메인만: `https://www.meteoswiss.admin.ch`, `https://www.alertswiss.ch`, `https://www.natural-hazards.ch`. 하위 경로 추측 금지
- **내 이름·이메일·연락처·회사명을 넣지 않는다** (Upwork 정책)

## 기술 스택

- 순수 HTML + CSS + Vanilla JS (ES modules). 프레임워크·npm 의존성·빌드 도구 없음
- 콘텐츠 `content/quiz.json`을 `fetch`로 로드. 로드 실패 시 친절한 오류 메시지
- 로컬 실행 `python -m http.server 8000` (또는 `npx serve`). `file://`로는 fetch가 막힌다는 점 README에 명시
- 배포: GitHub Pages (main 루트). 폰트: 시스템 폰트 스택

```
index.html
css/styles.css
js/app.js        # 화면 전환·상태 관리
js/quiz.js       # 문항 진행·채점 (DOM과 분리, 순수 함수)
js/scenes.js     # 시나리오별 애니메이션 씬
content/quiz.json
assets/video/    # (선택) Higgsfield 영상
tests/quiz.test.html
README.md / LICENSES.md / AI_DISCLOSURE.md
```

## JSON 스키마

`appTitle`, `appIntro`, `demoNotice`, `learnMoreLabel`("Learn more" 접두어), `scenarios[]` — 각 시나리오: `id`, `title`, `intro`, `theme`(flood|heat|storm), `questions[]`, `summary`.
각 문항: `question`, `options[]`, `correctIndex`, `explanation`, `learnMoreLabel`, `learnMoreUrl`.
링크 문구는 "Source:"가 아니라 "Learn more:" — 기관 문서를 직접 인용한 것이 아니므로. 기관 고정: Flooding → Natural Hazards Portal(경보 문항만 Alertswiss), Heatwaves/Thunderstorms → MeteoSwiss.

## 화면 흐름

Home(제목·소개·시나리오 카드 3개, 카드마다 미니 씬) → Question(진행 표시, 문항, 보기 → 선택 즉시 잠금) → Feedback(정답/오답, 정답 하이라이트, 설명, 가이드 링크 새 탭 `rel="noopener"`, Next) → Result(점수, 요약, Try again / Choose another scenario).
라우팅은 해시(`#/scenario/flooding`) 또는 단순 상태 전환. 뒤로가기가 이상하게 동작하지 않게.

## 애니메이션 (외부 라이브러리 없음, CSS + 인라인 SVG)

- Flood: 빗방울, 하단에서 출렁이며 차오르는 물결(SVG wave path)
- Heatwave: 맥동하는 태양, 지면 아지랑이, 따뜻한 그라데이션
- Thunderstorm: 흘러가는 구름, 불규칙한 번개 플래시(짧은 밝기 변화), 사선 빗줄기
- 전환: 페이드 + 약간 슬라이드(200~300ms). 정답: 초록 + 체크 그리기(stroke-dashoffset). 오답: 빨강 + shake, 정답 함께 강조. 결과: 점수 카운트업

접근성·성능(필수): `prefers-reduced-motion`이면 모든 움직임 끔. 번개 플래시 초당 3회 미만, 큰 면적 고대비 깜빡임 금지(WCAG 2.3.1). `transform`/`opacity` 위주. 장식 SVG `aria-hidden`. 키보드만으로 전체 진행, 포커스 명확. 색만으로 정답/오답 구분 금지(아이콘+텍스트). 대비 WCAG AA.

## (선택) Higgsfield 영상

`assets/video/hero.mp4` 있으면 홈 히어로에 `<video autoplay muted loop playsinline>`, 없으면 CSS 씬. 영상 위 반투명 오버레이. reduced-motion이면 포스터/정적 그라데이션. 모바일(`max-width: 640px`)은 CSS 씬. 영상은 코드가 없어도 완벽히 동작해야 함. 사용 시 LICENSES.md·AI_DISCLOSURE.md에 기록.

## 완료 조건

- 3 시나리오 × 3 문항 전체 흐름 동작
- JSON만 수정해서 콘텐츠 변경 가능
- 360px~1440px 레이아웃 깨짐 없음, 콘솔 에러 0
- `tests/quiz.test.html` 통과 (정답/오답 집계, 재시작 초기화, 문항 수 가변)
- reduced-motion 정상 동작
- README / LICENSES.md / AI_DISCLOSURE.md 작성 (사람이 직접 한 검증 내용 포함)
- 의미 있는 단위로 git 커밋

## 작업 순서

1. 폴더 구조 + quiz.json 샘플 → 사용자 검토
2. quiz.js + 테스트
3. 화면 흐름
4. 반응형 스타일
5. 애니메이션
6. 영상 슬롯(선택)
7. README / LICENSES / AI_DISCLOSURE
8. 완료 조건 자체 점검 후 보고

각 단계 후 짧게 보고. 콘텐츠·디자인 판단이 필요하면 멈추고 질문.
