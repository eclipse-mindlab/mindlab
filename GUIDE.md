# 이클립스 마인드랩 개발 가이드

## 🚨 중요: 원칙 저장 시스템

### 원칙 저장 방식
- **문자열로 저장**: `profile.principles.push(p.name)` (이름만)
- **도감 매칭**: dex.html의 ALL_PRINCIPLES 배열의 name과 매칭

### 주의사항 (버그 방지)
1. **mergeProfiles()** (index.html): 문자열/객체 모두 처리해야 함
```javascript
if (typeof p === 'string') {
  principleSet.add(p);
} else if (p && p.name) {
  principleSet.add(p.name);
}
```

2. **getDiscoveredNames()** (dex.html): 문자열/객체 모두 처리
```javascript
return profile.principles.map(p => {
  if (typeof p === 'string') return p;
  return p.name;
});
```

3. **새 프로필 생성 시**: `version: 5` 필수!
```javascript
profile = { version: 5, name: '익명 탐험가', level: 1, exp: 0, completedSims: [], principles: [] };
```

---

## 📁 파일 구조

```
mindlab/
├── index.html          # 메인 화면
├── dex.html            # 원칙 도감 (ALL_PRINCIPLES 배열)
├── daily.html          # 오늘의 딜레마
├── sim-template.css    # 시뮬레이터 공통 스타일
├── sim-template.js     # 시뮬레이터 공통 로직
├── sim-trolley.html    # 트롤리 딜레마 (템플릿 사용)
├── sim-clone.html      # 복제인간 (커스텀)
├── sim-survival-test.html  # 생존자의 선택 (템플릿 사용)
├── sim-experience-machine.html  # 경험 기계 (커스텀)
├── sim-idea-thief.html # 아이디어 도둑 (커스텀)
├── sim-money-friend.html # 돈 안 갚는 친구 (커스텀)
├── read-me.html        # 나를 읽어봐 (바이럴)
├── sw.js               # 서비스 워커
└── og-image.png        # OG 이미지
```

---

## 🎮 새 시뮬레이터 만들기 (템플릿 사용)

### 1. HTML 파일 생성
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>시뮬레이터 제목 - 이클립스 마인드랩</title>
  <link rel="stylesheet" href="sim-template.css">
  <style>
    /* 색상 커스텀 */
    :root {
      --sim-primary: #a855f7;
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
        <div class="sim-result-label" id="resultLabel">결과</div>
        <div class="sim-result-title" id="resultTitle"></div>
        <div class="sim-result-desc" id="resultDesc"></div>
      </div>
      <div class="sim-principles-list hidden" id="principlesList"></div>
      <div class="sim-actions">
        <button class="sim-action-btn primary" id="shareBtn">결과 공유하기</button>
        <a href="index.html" class="sim-action-btn secondary">홈으로 돌아가기</a>
      </div>
      <!-- 프로모션 섹션 -->
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
          badge: 'STAGE 1: 시작',
          title: '상황 제목',
          desc: '상황 설명\n\n줄바꿈 가능',
          highlight: '강조 텍스트 (빨간색)',  // 선택적
          quote: '인용구 (보라색)',  // 선택적
          choices: [
            {
              id: 'choice_a',
              text: '선택지 A',
              subtext: '부가 설명',  // 선택적
              meaning: '이 선택의 심리학적/철학적 의미 해설',
              principle: {  // 선택적 - 없으면 원칙 발견 안 함
                name: '원칙 이름',  // dex.html ALL_PRINCIPLES와 매칭!
                desc: '원칙 설명',
                icon: '💡'
              },
              quote: '관련 인용구'  // 선택적
            },
            {
              id: 'choice_b',
              text: '선택지 B',
              // ...
            }
          ]
        },
        // 더 많은 스테이지...
      ],
      
      calculateResult(choices, principles) {
        // choices: [{stage, choiceId, choiceText}, ...]
        // principles: [{name, desc, icon}, ...]
        
        return {
          icon: '🎯',
          label: '결과 라벨',
          title: '결과 제목',
          desc: '결과 설명'
        };
      }
    };

    SimTemplate.init(CONFIG);
  </script>
</body>
</html>
```

### 2. 도감에 원칙 등록 (dex.html)
```javascript
// ALL_PRINCIPLES 배열에 추가
{ name: '원칙 이름', desc: '원칙 설명', icon: '💡', source: '시뮬레이터 이름', category: '철학' },
```

### 3. index.html에 시뮬레이터 등록
```javascript
// SIMULATIONS 객체에 추가
psych: [
  // ...기존 것들
  { id: 'sim_id', title: '시뮬레이터 제목', desc: '설명', url: 'sim-xxx.html' }
]
```

### 4. DEX_TOTAL 업데이트 (index.html)
```javascript
const DEX_TOTAL = 106;  // 원칙 추가한 만큼 증가
```

### 5. sw.js 캐시 목록에 추가
```javascript
const urlsToCache = [
  // ...기존 것들
  './sim-xxx.html',
];
```

### 6. 버전 업데이트 (sw.js)
```javascript
const CACHE_NAME = 'mindlab-vXX';
```

---

## 🎨 카테고리 구조

```
📖 마인드 스토리 (story) - 소설형
   └ 복제인간

💭 철학 시뮬레이터 (philosophy)
   └ 트롤리 딜레마
   └ 경험 기계

🧠 심리 시뮬레이터 (psych)
   └ 아이디어 도둑 동료
   └ 돈 안 갚는 친구
   └ 생존자의 선택
```

---

## 📊 현재 버전: v71

- 총 원칙: 106개
- 서비스 워커: mindlab-v71

---

## 🐛 자주 발생하는 버그

1. **원칙이 저장 안 됨**: mergeProfiles에서 문자열 처리 확인
2. **원칙 개수 불일치**: 프로필 vs 도감 카운트 로직 확인
3. **서비스 워커 캐시**: 배포 후 버전 올리고 강력 새로고침
4. **POST 캐시 에러**: sw.js에서 GET만 캐시하도록 필터링
