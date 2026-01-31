# 이클립스의 딜렘 개발 가이드

## 📋 목차
1. [시뮬레이터 유형 구분](#시뮬레이터-유형-구분)
2. [유형제 시뮬레이터](#유형제-시뮬레이터)
3. [점수제 시뮬레이터](#점수제-시뮬레이터)
4. [공통 규칙](#공통-규칙)
5. [파일 구조](#파일-구조)
6. [체크리스트](#체크리스트)

---

## 🎮 시뮬레이터 유형 구분

### 두 가지 시스템

| 구분 | 유형제 (Type) | 점수제 (Score) |
|------|---------------|----------------|
| **결과** | "당신은 OO 유형입니다" | "당신의 점수: 5/6점" |
| **목적** | 성향/가치관 탐구 | 최적의 선택 찾기 |
| **정답** | 없음 (모든 선택이 의미 있음) | 있음 (최적/중립/최악) |
| **템플릿** | sim-template.css + js 사용 | 커스텀 HTML (독립) |
| **예시** | 트롤리, 복제인간, 생존자의 선택 | 뒷담화 현장 |

### 현재 시뮬레이터 목록

```
📖 마인드 스토리 (story) - 유형제
   └ 복제인간 (sim-clone.html) - 커스텀

💭 철학 시뮬레이터 (philosophy) - 유형제
   └ 트롤리 딜레마 (sim-trolley.html) - 템플릿
   └ 경험 기계 (sim-experience-machine.html) - 커스텀

🧠 심리 시뮬레이터 (psych) - 유형제/점수제 혼합
   └ 아이디어 도둑 동료 (sim-idea-thief.html) - 유형제, 커스텀
   └ 돈 안 갚는 친구 (sim-money-friend.html) - 유형제, 커스텀
   └ 생존자의 선택 (sim-survival-test.html) - 유형제, 템플릿
   └ 뒷담화 현장 (sim-gossip.html) - 점수제, 커스텀
```

---

## 🏷️ 유형제 시뮬레이터

### 특징
- 선택에 따라 **유형/성향** 결과 도출
- 정답이 없음 - 모든 선택이 의미 있음
- 선택마다 원칙 발견
- 결과: "당신은 [유형명]입니다" + 설명

### 템플릿 사용 (권장)
**파일**: sim-template.css + sim-template.js

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>시뮬레이터 제목 - 이클립스의 딜렘</title>
  <link rel="stylesheet" href="sim-template.css">
  <style>
    :root {
      --sim-primary: #a855f7;        /* 메인 색상 */
      --sim-primary-light: #c084fc;
      --sim-primary-bg: rgba(168, 85, 247, 0.1);
      --sim-primary-border: rgba(168, 85, 247, 0.3);
    }
  </style>
</head>
<body>
  <div class="sim-container">
    <!-- 헤더 -->
    <div class="sim-header">
      <a href="index.html" class="sim-back-btn">←</a>
      <div class="sim-header-title">시뮬레이터 제목</div>
    </div>

    <!-- 게임 화면 -->
    <div id="gameScreen">
      <div class="sim-progress">
        <div class="sim-progress-label">
          <span id="stageLabel">STAGE 1</span>
          <span id="stageCount">1/3</span>
        </div>
        <div class="sim-progress-bar">
          <div class="sim-progress-fill" id="progressFill"></div>
        </div>
      </div>
      <div class="sim-stage-badge" id="stageBadge">STAGE 1</div>
      <div class="sim-situation">
        <div class="sim-situation-title" id="situationTitle"></div>
        <div class="sim-situation-desc" id="situationDesc"></div>
        <div class="sim-situation-highlight hidden" id="situationHighlight"></div>
        <div class="sim-situation-quote hidden" id="situationQuote"></div>
      </div>
      <div class="sim-choices" id="choices"></div>
    </div>

    <!-- 해설 화면 -->
    <div id="explanationScreen" class="hidden">
      <div class="sim-explanation-card">
        <div class="sim-explanation-label">당신의 선택</div>
        <div class="sim-explanation-title" id="yourChoice"></div>
      </div>
      <div class="sim-explanation-card hidden" id="meaningCard">
        <div class="sim-explanation-label">이 선택이 의미하는 것</div>
        <div class="sim-explanation-desc" id="choiceMeaning"></div>
      </div>
      <div class="sim-principle-card hidden" id="principleCard">
        <div class="sim-principle-header">
          <span class="sim-principle-icon">💡</span>
          <span>발견한 원칙</span>
        </div>
        <div class="sim-principle-name" id="principleName"></div>
        <div class="sim-principle-desc" id="principleDesc"></div>
      </div>
      <div class="sim-quote-card hidden" id="quoteCard">
        <span class="sim-quote-icon">💬</span>
        <span class="sim-quote-text" id="quoteText"></span>
      </div>
      <button class="sim-next-btn" id="nextBtn">다음으로</button>
    </div>

    <!-- 결과 화면 -->
    <div id="resultScreen" class="hidden">
      <div class="sim-result-card">
        <div class="sim-result-icon" id="resultIcon">🎯</div>
        <div class="sim-result-label" id="resultLabel">당신의 유형</div>
        <div class="sim-result-title" id="resultTitle"></div>
        <div class="sim-result-desc" id="resultDesc"></div>
      </div>
      <div class="sim-principles-list hidden" id="principlesList"></div>
      <div class="sim-actions">
        <button class="sim-action-btn primary" id="shareBtn">결과 공유하기</button>
        <a href="index.html" class="sim-action-btn secondary">홈으로 돌아가기</a>
      </div>
      
      <!-- 프로모션 섹션 (필수) -->
      <div class="sim-promo">
        <div class="sim-promo-title">이클립스 더 알아보기</div>
        <a href="https://www.youtube.com/@Eclipse-g4e" target="_blank" class="sim-youtube-btn">
          <span class="sim-youtube-icon">▶</span>
          <span>유튜브 채널</span>
        </a>
        <div class="sim-books">
          <div class="sim-books-title">이클립스의 책</div>
          <div class="sim-books-grid">
            <a href="https://litt.ly/eclipse.thinker" target="_blank" class="sim-book-item">
              <img src="book-philosophy.png" alt="훔친 철학 편" class="sim-book-cover">
              <div class="sim-book-title">훔친 철학 편</div>
            </a>
            <a href="https://litt.ly/eclipse.thinker" target="_blank" class="sim-book-item">
              <img src="book-psychology.png" alt="훔친 심리학 편" class="sim-book-cover">
              <div class="sim-book-title">훔친 심리학 편</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script src="sim-template.js"></script>
  <script>
    const CONFIG = {
      id: 'sim_id',  // 고유 ID (completedSims에 저장됨)
      title: '시뮬레이터 제목',
      shareIcon: '🎯',
      shareUrl: 'https://eclipse-mindlab.github.io/mindlab/sim-xxx.html',
      
      stages: [
        {
          badge: 'STAGE 1',
          title: '상황 제목',
          desc: '상황 설명',
          highlight: '강조 텍스트',  // 선택적
          quote: '인용구',  // 선택적
          choices: [
            {
              id: 'choice_a',
              text: '선택지 텍스트',
              subtext: '부가 설명',  // 선택적
              meaning: '이 선택의 의미 해설',
              principle: {
                name: '원칙 이름',  // dex.html과 매칭 필수!
                desc: '원칙 설명',
                icon: '💡'
              },
              quote: '철학자 인용구'  // 선택적
            }
          ]
        }
      ],
      
      // 유형 결정 로직
      calculateResult(choices, principles) {
        // choices: [{stage, choiceId, choiceText}, ...]
        return {
          icon: '🎯',
          label: '당신의 유형',
          title: '유형명',
          desc: '유형 설명'
        };
      }
    };

    SimTemplate.init(CONFIG);
  </script>
</body>
</html>
```

### 색상 프리셋
```css
/* 철학 - 보라색 */
--sim-primary: #a855f7;

/* 심리 - 파란색 */
--sim-primary: #3b82f6;

/* 생존/자연 - 초록색 */
--sim-primary: #10b981;

/* 관계/갈등 - 빨간색 */
--sim-primary: #f87171;
```

---

## 📊 점수제 시뮬레이터

### 특징
- 선택마다 **점수** 부여 (최적 2점, 중립 1점, 최악 0점)
- **정답이 있음** - 최적의 수를 찾는 게임
- 각 선택마다 평가 뱃지 표시 (초록/노랑/빨강)
- 결과: "당신의 점수: X/Y점" + 등급 메시지
- **분기형 스토리** 가능 (선택에 따라 다음 상황 달라짐)

### 커스텀 HTML 구조 (sim-gossip.html 참고)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>시뮬레이터 제목 - 이클립스의 딜렘</title>
  
  <!-- PWA -->
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#f87171">
  
  <style>
    /* 전체 스타일 직접 작성 */
    /* sim-gossip.html 참고 */
  </style>
</head>
<body>
  <div class="container">
    <!-- 헤더 -->
    <div class="header">
      <a href="index.html" class="back-btn">← 돌아가기</a>
      <div class="header-content">
        <div class="header-category">심리 · 관계</div>
        <h1>시뮬레이터 제목</h1>
        <p>당신의 선택 뒤에 숨겨진 원칙을 발견하세요</p>
      </div>
    </div>
    
    <!-- 진행 바 -->
    <div class="progress" id="progress"></div>
    
    <!-- 게임 화면 -->
    <div id="game-screen">
      <div class="scenario-card">
        <div class="stage-label" id="stage-label">상황 1</div>
        <div class="context" id="context"></div>
        <div class="situation" id="situation"></div>
      </div>
      <div class="choices" id="choices"></div>
      
      <!-- 결과 섹션 -->
      <div class="result-section" id="result-section">
        <div class="selected-choice">
          <div class="selected-header">
            <span class="selected-label">선택한 답변</span>
            <span class="selected-badge" id="selected-badge">최적의 수</span>
          </div>
          <div class="selected-text" id="selected-text"></div>
        </div>
        
        <div class="outcome-card">
          <div class="outcome-label">결과</div>
          <div class="outcome-text" id="outcome-text"></div>
        </div>
        
        <div class="principle-card">
          <div class="principle-header">
            <span class="principle-icon">💡</span>
            <span class="principle-label">발견한 원칙</span>
          </div>
          <div class="principle-name" id="principle-name"></div>
          <div class="principle-explanation" id="principle-explanation"></div>
        </div>

        <div class="evaluation-card" id="evaluation-card">
          <div class="evaluation-icon" id="evaluation-icon">⚠️</div>
          <div class="evaluation-text" id="evaluation-text"></div>
        </div>

        <!-- 다른 선택지 토글 -->
        <div class="other-choices-section">
          <button class="other-choices-toggle" id="other-toggle">
            <span>다른 선택은?</span>
          </button>
          <div class="other-choices-content hidden" id="other-choices-content"></div>
        </div>
        
        <button class="next-btn" id="next-btn">다음 상황</button>
      </div>
    </div>
    
    <!-- 최종 결과 화면 -->
    <div class="final-screen" id="final-screen">
      <div class="score-card">
        <div class="score-display">
          <span class="score-number" id="score-number">0</span>
          <span class="score-total">/6</span>
        </div>
        <div class="score-label">당신의 심리전 점수</div>
        <div class="score-message" id="score-message">메시지</div>
        <div class="score-exp">+30 EXP 획득!</div>
      </div>

      <div class="principles-collected">
        <div class="principles-title">🔓 발견한 원칙들</div>
        <div id="principles-list"></div>
      </div>

      <!-- 공유 버튼 -->
      <div class="share-section">
        <div class="share-label">친구에게 공유하기</div>
        <div class="share-buttons">
          <button class="share-btn" id="native-share-btn">공유하기</button>
          <button class="share-btn" id="copy-btn">링크 복사</button>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="action-buttons">
        <a href="index.html" class="home-btn">홈으로 돌아가기</a>
        <button class="restart-btn" id="restart-btn">다시 도전하기</button>
      </div>

      <!-- 프로모션 섹션 (필수) -->
      <div class="promo-section">
        <div class="eclipse-section">
          <div class="eclipse-section-title">이클립스 더 알아보기</div>
          <a href="https://www.youtube.com/@Eclipse-g4e" target="_blank" class="youtube-btn">
            <span class="youtube-icon">▶</span>
            <span>유튜브 채널</span>
          </a>
        </div>
        <div class="books-section">
          <div class="books-section-title">이클립스의 책</div>
          <div class="books-grid">
            <a href="https://litt.ly/eclipse.thinker" target="_blank" class="book-item">
              <img src="book-philosophy.png" alt="훔친 철학 편">
              <div class="book-item-title">훔친 철학 편</div>
            </a>
            <a href="https://litt.ly/eclipse.thinker" target="_blank" class="book-item">
              <img src="book-psychology.png" alt="훔친 심리학 편">
              <div class="book-item-title">훔친 심리학 편</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // 시나리오 데이터 구조
    const scenarios = [
      {
        id: "start",  // 스테이지 ID
        context: "배경 설명",
        situation: "상황 질문",
        choices: [
          {
            text: "선택지 텍스트",
            outcome: "선택 결과 설명",
            principle: "원칙 이름",
            principleDesc: "원칙 설명",
            evaluation: "positive",  // positive/neutral/negative
            evalText: "평가 텍스트",
            score: 2,  // 2=최적, 1=중립, 0=최악
            nextStage: "next_stage_id"  // 다음 스테이지 ID 또는 "end"
          }
        ]
      }
    ];
    
    // 뱃지 표시
    // score 2 → "최적의 수" (초록)
    // score 1 → "중립" (노랑)  
    // score 0 → "최악의 수" (빨강)
    
    // 결과 메시지 (점수 비율에 따라)
    // 80%+ : 뛰어난 감각
    // 50%+ : 괜찮은 감각
    // 50%- : 아직 감이 덜 잡힘
  </script>
</body>
</html>
```

### 점수제 핵심 규칙
1. **점수 배분**: 최적 2점, 중립 1점, 최악 0점
2. **뱃지 색상**: 초록(positive), 노랑(neutral), 빨강(negative)
3. **분기 스토리**: `nextStage`로 다음 시나리오 ID 지정
4. **다른 선택지 보기**: 선택 안 한 것들의 원칙도 볼 수 있게

### 공유 문구 형식
```javascript
const text = `심리전 시뮬레이터 - 🎯 나의 심리전 점수: ${score}/${maxScore}점
당신의 심리전 감각을 테스트해보세요!
https://eclipse-mindlab.github.io/mindlab/sim-xxx.html`;
```

---

## 📌 공통 규칙

### 원칙 저장 시스템
```javascript
// 저장: 문자열로만 저장
profile.principles.push(p.name);  // ✅
profile.principles.push(p);       // ❌

// 도감 매칭: dex.html의 ALL_PRINCIPLES 배열 name과 일치해야 함
```

### 프로필 생성 시 필수
```javascript
profile = { 
  version: 5,  // 필수!
  name: '익명 탐험가', 
  level: 1, 
  exp: 0, 
  completedSims: [], 
  principles: [] 
};
```

### 경험치 규칙
- **첫 완료 시에만** +30 EXP 지급
- 점수와 무관하게 완료만 하면 지급
```javascript
if (!profile.completedSims.includes('sim_id')) {
  profile.completedSims.push('sim_id');
  profile.exp = (profile.exp || 0) + 30;
}
```

### 유튜브 버튼 (통일)
```html
<a href="https://www.youtube.com/@Eclipse-g4e" target="_blank" class="youtube-btn">
  <span class="youtube-icon">▶</span>
  <span>유튜브 채널</span>
</a>
```

```css
.youtube-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  color: #fff;
  text-decoration: none;
}

.youtube-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #ef4444;
  border-radius: 6px;
  font-size: 12px;
}

.youtube-btn:hover {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
```

### 홈 버튼 문구 (통일)
```html
<a href="index.html" class="home-btn">홈으로 돌아가기</a>
```
- ❌ "탐험 지도로 돌아가기" 사용 금지

---

## 📁 파일 구조

```
mindlab/
├── index.html              # 메인 화면
├── dex.html                # 원칙 도감
├── daily.html              # 오늘의 딜레마
├── GUIDE.md                # 이 문서
│
├── sim-template.css        # 유형제 템플릿 스타일
├── sim-template.js         # 유형제 템플릿 로직
│
├── sim-trolley.html        # 트롤리 딜레마 (유형제, 템플릿)
├── sim-survival-test.html  # 생존자의 선택 (유형제, 템플릿)
├── sim-clone.html          # 복제인간 (유형제, 커스텀)
├── sim-experience-machine.html  # 경험 기계 (유형제, 커스텀)
├── sim-idea-thief.html     # 아이디어 도둑 (유형제, 커스텀)
├── sim-money-friend.html   # 돈 안 갚는 친구 (유형제, 커스텀)
├── sim-gossip.html         # 뒷담화 현장 (점수제, 커스텀)
│
├── read-me.html            # 나를 읽어봐 (바이럴)
├── read-me-challenge.html  # 챌린지 모드
├── read-me-results.html    # 결과 화면
├── my-challenges.html      # 내 챌린지 목록
│
├── sw.js                   # 서비스 워커
├── manifest.json           # PWA 매니페스트
├── og-image.png            # OG 이미지
├── book-philosophy.png     # 책 이미지
├── book-psychology.png     # 책 이미지
└── logo.png                # 로고
```

---

## ✅ 체크리스트

### 새 시뮬레이터 추가 시

- [ ] 유형제/점수제 결정
- [ ] HTML 파일 생성 (템플릿 또는 커스텀)
- [ ] 원칙들 dex.html ALL_PRINCIPLES에 추가
- [ ] index.html SIMULATIONS에 추가
- [ ] index.html DEX_TOTAL 숫자 업데이트
- [ ] 공유 문구 확인
- [ ] 유튜브 버튼 스타일 확인
- [ ] "홈으로 돌아가기" 문구 확인
- [ ] sw.js 버전 업데이트

### 원칙 추가 시
- [ ] dex.html ALL_PRINCIPLES에 추가
- [ ] name이 시뮬레이터에서 저장하는 문자열과 정확히 일치하는지 확인
- [ ] category 설정 (철학/심리/스토리)
- [ ] source 설정 (시뮬레이터 이름)
- [ ] index.html DEX_TOTAL 숫자 업데이트

---

## 📊 현재 버전

- **서비스 워커**: dilem-v27
- **총 원칙 수**: dex.html ALL_PRINCIPLES 배열 길이 확인

---

## 🐛 자주 발생하는 버그

1. **원칙이 저장 안 됨**
   - 원인: 문자열이 아닌 객체로 저장
   - 해결: `profile.principles.push(p.name)`

2. **원칙이 도감에서 안 보임**
   - 원인: dex.html ALL_PRINCIPLES name과 불일치
   - 해결: 정확히 같은 문자열인지 확인

3. **서비스 워커 캐시**
   - 해결: sw.js CACHE_NAME 버전 올리고 강력 새로고침

4. **홈 버튼 문구 불일치**
   - 해결: 모두 "홈으로 돌아가기"로 통일
