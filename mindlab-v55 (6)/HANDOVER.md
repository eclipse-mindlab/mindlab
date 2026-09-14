# Eclipse Mindlab 인수인계 문서

> 마지막 업데이트: 2026-02-21
> 버전: v48
> 시뮬레이터: 18개 | 원칙 도감: 350개

---

## 🚨 새 Claude에게: 먼저 읽어주세요

이 프로젝트를 이어받았다면:
1. 이 문서를 끝까지 읽으세요
2. 특히 **"절대 규칙"**과 **"자주 하는 실수"** 섹션 주의
3. 사용자(DONGMINLEE)는 디테일에 민감하고 UX 감각이 좋습니다
4. 말투는 간결하게, 작업은 빠르게, 결과물은 꼼꼼하게

---

## 1. 프로젝트 개요

### 핵심 컨셉
**"심리학을 게임처럼 배우는 웹 플랫폼"**

- 이름: Eclipse Mindlab (이클립스의 딜렘)
- 타겟: 모바일 사용자 (80% 이상)
- 목적: 심리학/철학 원칙을 시뮬레이션을 통해 자연스럽게 학습
- 핵심 가치: **발견 기반 학습** - 명시적 교육이 아닌 경험을 통한 깨달음

### 사용자 특성 (DONGMINLEE)
- 제품 감각이 뛰어남 - UX/마케팅 관점에서 피드백
- 빠른 작업 선호 - 긴 설명보다 바로 결과물
- 디테일 중시 - 말투, 색상, 애니메이션 하나하나 신경씀
- 모바일 우선 - 항상 모바일에서 테스트

### 마케팅 포지셔닝
- "분기 스토리" 언급 금지 → 유저가 직접 발견하게
- "심리 테스트"보다 "시뮬레이터" 용어 선호
- 가벼운 진입 → 깊은 몰입 구조
- 기능 나열 금지 → 호기심 유발

---

## 2. 기술 스택

### 프론트엔드
- **Pure HTML/CSS/JS** (프레임워크 없음)
- PWA 지원 (manifest.json, sw.js)
- 모바일 퍼스트 디자인

### 백엔드
- **Firebase** (project: eclipse-mindlab)
  - Authentication: 익명 로그인 + Google 연동
  - Firestore: 프로필 클라우드 동기화
- LocalStorage: 오프라인 데이터

### 호스팅
- GitHub Pages
- URL: https://eclipse-mindlab.github.io/mindlab/

---

## 3. 파일 구조

```
mindlab/
├── index.html          # 메인 페이지 (프로필, 시뮬레이터 목록)
├── daily.html          # 오늘의 딜레마
├── dex.html            # 원칙 도감 (350개)
├── my-challenges.html  # 마이 챌린지
├── read-me.html        # 나를 읽어줘 테스트
│
├── sim-template.css    # 시뮬레이터 공통 CSS ⭐
├── sim-template.js     # 시뮬레이터 공통 JS ⭐
├── sim-*.html          # 개별 시뮬레이터들
│
├── manifest.json       # PWA 설정
├── sw.js               # Service Worker
├── sitemap.xml         # SEO
│
├── book-psychology.png # 책 이미지
├── book-philosophy.png
├── tier-*.png          # 티어 뱃지 이미지
├── og-image.png        # 소셜 미리보기
│
├── GUIDE.md            # 기존 가이드
└── HANDOVER.md         # 이 문서
```

---

## 4. 시뮬레이터 현황

### 카테고리별 목록

**철학 (7개)**
| ID | 제목 | 핵심 주제 |
|----|------|----------|
| god | 신이 된다면 | 전지전능의 역설 |
| immortality | 영생 | 영원한 삶의 의미 |
| awakening | 깨어남 | 시뮬레이션 가설 |
| last-human | 마지막 인류 | 실존적 의미 |
| death | 죽음을 앞둔 선택 | 유한성과 선택 |
| trolley | 트롤리 딜레마 | 도덕적 판단 |
| experience_machine | 경험 기계 | 진정성 vs 행복 |

**심리 (10개)**
| ID | 제목 | 핵심 주제 |
|----|------|----------|
| breakup | 이별 시뮬레이터 | 관계 종료 |
| shadow | 내면의 그림자 | 융의 그림자 |
| replacement | 완벽한 대체자 | 비교와 자존감 |
| left-on-read | 읽씹 시뮬레이터 | 불확실성 대처 |
| revenge | 복수 시뮬레이터 | 정의와 용서 |
| gossip | 뒷담화 현장 | 사회적 갈등 |
| idea_thief | 아이디어 도둑 | 직장 갈등 |
| money_friend | 돈 안 갚는 친구 | 관계와 돈 |
| survival_test | 생존자의 선택 | 극한 상황 |
| truth | 거짓말 없는 하루 | 정직과 관계 |

**전략 (1개)**
| ID | 제목 | 핵심 주제 |
|----|------|----------|
| brinkmanship | 벼랑 끝 협상 | 협상 전략 |

**스토리 (1개)**
| ID | 제목 | 핵심 주제 |
|----|------|----------|
| clone | 복제인간 | 정체성 |

---

## 5. 시뮬레이터 템플릿 사용법

### 필수 파일
```html
<link rel="stylesheet" href="sim-template.css">
<script src="sim-template.js"></script>
```

### CONFIG 구조
```javascript
const CONFIG = {
  id: 'simulator-id',        // 고유 ID (프로필 저장용)
  title: '시뮬레이터 제목',
  shareIcon: '🎭',
  shareUrl: 'https://...',
  
  stages: [
    {
      badge: 'STAGE 1',      // 상단 뱃지
      title: '상황 제목',
      desc: '상황 설명\n\n줄바꿈 가능',
      highlight: '강조 문구 (선택)',
      quote: '인용구 (선택)',
      choices: [
        {
          id: 'choice1',
          text: '선택지 텍스트',
          subtext: '부가 설명 (선택)',
          meaning: '선택의 의미 해설',
          principle: {
            name: '원칙 이름',
            desc: '원칙 설명',
            icon: '💡'
          },
          quote: '관련 인용구 (선택)'
        }
      ]
    }
  ],
  
  calculateResult(choices, principles) {
    // 결과 계산 로직
    return {
      icon: '✨',
      label: '결과 유형',
      title: '결과 제목',
      desc: '결과 설명',
      stats: [
        { value: 3, label: '라벨' }
      ]
    };
  },
  
  getShareText(resultTitle, choices, principles) {
    return `공유 텍스트`;
  }
};

SimTemplate.init(CONFIG);
```

### 🔴 새 시뮬레이터 추가 체크리스트
1. ✅ `sim-{id}.html` 생성 (템플릿 사용)
2. ✅ `index.html` SIMULATIONS에 추가
3. ✅ `index.html` VALID_PRINCIPLES에 원칙 추가
4. ✅ `dex.html` allPrinciples에 원칙 추가
5. ✅ `DEX_TOTAL` 숫자 업데이트
6. ✅ `sitemap.xml`에 URL 추가

**이거 하나라도 빠뜨리면 버그 발생!**

---

## 6. 데이터 구조

### 프로필 (eclipse_mindlab_profile)
```javascript
{
  version: 5,              // 현재 버전
  name: '사용자 이름',
  level: 1,
  exp: 0,
  completedSims: ['trolley', 'clone'],  // 완료한 시뮬레이터 ID
  principles: ['원칙1', '원칙2'],        // 발견한 원칙 (문자열로 저장!)
  maxStreak: 7             // 오늘의 딜레마 최대 연속
}
```

### 오늘의 딜레마 (eclipse_mindlab_daily)
```javascript
{
  streak: 3,               // 현재 연속
  maxStreak: 7,            // 최대 연속
  lastDate: '2026-02-21',
  history: {
    '2026-02-21': 0,       // 날짜: 선택 인덱스
    '2026-02-20': 1
  }
}
```

### ⚠️ 중요: 원칙 저장 규칙
```javascript
// 반드시 문자열로 저장 (객체 아님!)
profile.principles.push(principle.name);  // ✅
profile.principles.push(principle);       // ❌

// mergeProfiles에서는 문자열/객체 모두 처리
const name = typeof p === 'string' ? p : p.name;
```

---

## 7. 디자인 시스템

### 색상 팔레트 (토스 스타일)
```css
/* 배경 */
--bg-primary: #09090b;
--bg-secondary: #141417;
--bg-tertiary: #1a1a1e;

/* 텍스트 */
--text-primary: #ffffff;
--text-secondary: #a1a1aa;
--text-tertiary: #8b8b92;

/* 브랜드 */
--brand-purple: #9580ff;
--brand-purple-dark: #6d5dbc;

/* 상태 */
--success: #5cb88a;
--error: #f87171;
```

### 모바일 터치 피드백 (v48에서 전체 적용됨)
```css
.interactive-element {
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.interactive-element:active {
  transform: scale(0.97);
  opacity: 0.9;
}
```

### 순차 등장 애니메이션
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.choice:nth-child(1) { animation-delay: 0.05s; }
.choice:nth-child(2) { animation-delay: 0.1s; }
.choice:nth-child(3) { animation-delay: 0.15s; }
```

### 디자인 원칙
1. **모바일 퍼스트** - 호버보다 터치 피드백 우선
2. **다크 테마** - 눈의 피로 감소
3. **미니멀** - 불필요한 장식 배제
4. **부드러운 전환** - 0.15s~0.3s 트랜지션
5. **카드 기반** - 정보 그룹핑

---

## 8. 콘텐츠 작성 원칙

### 시나리오 말투 - 매우 중요!
```
❌ BAD (딱딱하고 설명적)
"당신은 회사에 다니고 있다. 어느 날 동료가 말을 걸었다."
"당신은 과거로 갈 수 있다. 단, 조건이 있다."

✅ GOOD (몰입감 있고 간결)
"회의 중 동료가 발표를 망쳤다. 버벅거리고, 자료도 틀렸다."
"타임머신이 발명되었다. 과거로 갈 수 있다. 단, 조건이 있다."
```

**원칙:**
- "당신은" 최소화 → 바로 상황 진입
- 짧은 문장 → 리듬감
- 구체적 디테일 → 몰입감 (팀장 얼굴이 굳어간다)
- 긴장감/반전 → 흥미 유발
- 설명조 금지 → 스토리텔링

### 오늘의 딜레마 구조
```javascript
{
  category: '철학 · 윤리',          // 카테고리
  situation: '상황 설명...',        // \n\n으로 문단 구분
  question: '질문?',
  choices: [
    {
      text: '선택지 텍스트',
      percent: 42,                  // 가상의 선택 비율
      type: '유형 이름',
      typeDesc: '유형 설명',
      philosopher: '관련 철학자',
      philoEmoji: '🧠',
      philoQuote: '"인용구"'
    }
  ],
  principle: '발견할 원칙',
  explanation: '해설',
  source: '출처'
}
```

---

## 9. 오늘의 딜레마 현황

### 현재 딜레마 목록 (19개, v48에서 전면 교체됨)
1. 타임머신 정체성 - 정체성의 연속성
2. 미끼 효과 - 상대적 비교
3. 안락사 딜레마 - 자율성 vs 생명
4. 귀인 오류 - 타인 vs 자신 평가
5. 화학적 자아 - 약과 정체성
6. 손실 회피 - 위험 추구
7. 의식의 어려운 문제 - 의식 증명
8. 집단사고 - 반대 의견
9. 힐베르트 호텔 - 무한의 역설
10. 자기 핸디캡 - 변명 만들기
11. 소리테스 역설 - 경계의 모호함
12. 헤도닉 적응 - 행복의 적응
13. 뉴컴의 역설 - 예측과 선택
14. 이중 효과 - 레버 vs 밀기
15. 피크-엔드 법칙 - 기억과 경험
16. 자율주행차 윤리 - AI의 도덕
17. 맥락 효과 - 상황과 가치
18. 안면 피드백 - 가짜 행복
19. 과잉정당화 - 보상과 동기

### 사이클
```javascript
getDayOfYear() % dilemmas.length  // 19일마다 반복
```

### 책 프로모션
- 모든 딜레마 결과 화면 하단에 표시
- "훔친 심리학", "훔친 철학" 책 링크

---

## 10. 프로필 시스템

### 레벨 시스템
```javascript
expNeeded = level * 100;  // 레벨업 필요 경험치
// Lv.1 → 100 exp
// Lv.2 → 200 exp
// ...
```

### 경험치 획득
- 시뮬레이터 최초 클리어: +30 exp
- 오늘의 딜레마 참여: +10 exp

### 티어 시스템
| 티어 | 조건 | 색상 |
|------|------|------|
| Bronze | Lv.1-4 | #CD7F32 |
| Silver | Lv.5-9 | #C0C0C0 |
| Gold | Lv.10-14 | #FFD700 |
| Amethyst | Lv.15-19 | #9966CC |
| Sapphire | Lv.20-24 | #0F52BA |
| Ruby | Lv.25-29 | #E0115F |
| Emerald | Lv.30-39 | #50C878 |
| Obsidian | Lv.40+ | #0B0B0B |

### 프로필 통계
- 클리어한 시뮬레이터 수
- 발견한 원칙 수 (VALID_PRINCIPLES 기준)
- 최대 연속 참여일수 (maxStreak)

---

## 11. 주요 기능 상세

### 프로필 이미지 저장
- html2canvas 라이브러리 사용
- 프로필 카드를 PNG로 저장

### Google 계정 연동
- 익명 → Google 전환 시 프로필 병합
- principles 병합 시 문자열 처리 주의

### 오늘의 딜레마 스트릭
```javascript
// maxStreak 마이그레이션 (기존 사용자 대응)
// daily.html의 loadDailyData()
if (!dailyData.maxStreak && dailyData.streak > 0) {
  dailyData.maxStreak = dailyData.streak;
}

// index.html 표시 시 세 값 중 최대값 사용
maxStreak = Math.max(
  profile.maxStreak || 0,
  dailyData.maxStreak || 0,
  dailyData.streak || 0
);
```

### PWA
- 홈 화면 추가 가능
- 오프라인 기본 지원

---

## 12. 🔴 절대 규칙

1. **원칙은 문자열로 저장** (p.name, not p)
2. **version: 5** 유지 (새 프로필 생성 시)
3. **VALID_PRINCIPLES 동기화** (index.html ↔ dex.html)
4. **DEX_TOTAL 업데이트** 잊지 않기
5. **작은따옴표 안에 작은따옴표 금지** (JS 구문 에러)

---

## 13. 🔴 자주 하는 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| 시뮬레이터 추가 후 SIMULATIONS 누락 | 목록에 안 보임 | index.html 확인 |
| 원칙 추가 후 VALID_PRINCIPLES 누락 | 도감에서 카운트 안 됨 | index.html 확인 |
| 원칙을 객체로 저장 | 도감 매칭 실패 | 문자열로 저장 |
| DEX_TOTAL 업데이트 누락 | 도감 진행률 오류 | 숫자 맞추기 |
| 작은따옴표 이스케이프 누락 | JS 에러, 페이지 안 뜸 | 따옴표 확인 |
| sitemap.xml 누락 | SEO 영향 | 새 URL 추가 |

---

## 14. 향후 추천 주제

### 시뮬레이터 후보
| 주제 | 컨셉 | 우선순위 |
|------|------|----------|
| 텔레포터 | 순간이동 = 원본 사망? | 높음 |
| 내부고발 | 회사 비리 발견 | 높음 |
| 용서 | 용서할 수 없는 것 | 중간 |
| SNS의 나 | 온라인 페르소나 | 중간 |
| 기억 조작 | 고통스러운 기억 삭제 | 중간 |
| 최후통첩 게임 | 불공정한 제안 | 전략 확장 |
| 공유지의 비극 | 개인 vs 공동체 | 전략 확장 |

### 기능 개선 후보
- 친구 비교 기능
- 주간/월간 통계
- 성향 분석 리포트
- 시뮬레이터 난이도 표시

---

## 15. 테스트 체크리스트

새 기능 추가 후:
- [ ] 시뮬레이터 전체 플로우 (시작→끝)
- [ ] 원칙 저장 확인 (도감에서 카운트)
- [ ] 프로필 경험치/레벨업
- [ ] 모바일 터치 피드백
- [ ] 공유 기능
- [ ] 이미 완료한 경우 재방문

---

## 16. 연락처 & 리소스

### 외부 링크
- 유튜브: https://www.youtube.com/@dilemchannel
- 책 링크: https://litt.ly/eclipse.thinker

### Firebase 프로젝트
- Project ID: eclipse-mindlab
- Console: https://console.firebase.google.com/

---

## 17. 버전 히스토리

| 버전 | 날짜 | 주요 변경 |
|------|------|----------|
| v48 | 2026-02-21 | 거짓말 없는 하루, 딜레마 19개 교체, maxStreak, 터치 피드백, 책 프로모션 상시화 |
| v47 | 2026-02-21 | 깨어남, 벼랑 끝 협상, 전략 카테고리 |
| v46 | 2026-02-21 | 완벽한 대체자, 복수 시뮬레이터 |

---

## 18. 작업 패턴 (Claude 참고용)

### 새 시뮬레이터 만들 때
1. sim-template.css/js 확인
2. 기존 시뮬레이터 참고 (sim-truth.html 추천)
3. CONFIG 작성 (id, stages, calculateResult)
4. 체크리스트 따라 index.html, dex.html 업데이트

### 오늘의 딜레마 수정할 때
1. daily.html의 dilemmas 배열 찾기
2. 말투 원칙 지키기 (짧게, 몰입감 있게)
3. 작은따옴표 충돌 주의
4. JS 구문 검사 필수

### 디자인 수정할 때
1. 모바일에서 먼저 테스트
2. 터치 피드백 확인
3. 다크 테마 색상 체계 유지

---

*이 문서는 새로운 Claude 세션에서 프로젝트를 이어받을 때 참고하세요.*
*질문이 있으면 DONGMINLEE에게 물어보세요.*
