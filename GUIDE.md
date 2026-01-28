# 이클립스 마인드랩 - 시뮬레이터 추가 가이드

## 시스템 구조

```
eclipse-mindlab/
├── index.html          # 메인 탐험 지도
├── sim-idea-thief.html # 아이디어 도둑 동료
├── sim-money-friend.html # (추가 예정)
├── sim-dating.html     # (추가 예정)
└── 이미지 파일들
```

## 시뮬레이터 ID 규칙

**중요: ID는 절대 바꾸지 않는다!**

이미 정해진 ID:
- `idea_thief` - 아이디어 도둑 동료
- `money_friend` - 돈 안 갚는 친구
- `dating_progress` - 썸 진전시키기
- `free_rider` - 무임승차 팀원
- `parent_nagging` - 부모님 잔소리

ID를 바꾸면 기존 유저가 같은 시뮬레이터를 다시 해도 새 시뮬레이터로 인식 → 경험치 중복 지급됨

## 새 시뮬레이터 추가 방법

### 1. index.html의 SIMULATIONS 배열에 추가

```javascript
const SIMULATIONS = {
  psych: [
    { id: 'idea_thief', title: '아이디어 도둑 동료', desc: '...', url: 'sim-idea-thief.html' },
    { id: 'money_friend', title: '돈 안 갚는 친구', desc: '...', url: 'sim-money-friend.html' }, // url 추가
    // ...
  ],
  philosophy: [
    { id: 'trolley', title: '트롤리 딜레마', desc: '...', url: 'sim-trolley.html' },
  ],
  social: [
    { id: 'prisoner', title: '죄수의 딜레마', desc: '...', url: 'sim-prisoner.html' },
  ]
};
```

### 2. 시뮬레이터 HTML 파일 생성

`sim-idea-thief.html`을 복사해서 수정:

1. 상단의 `SIM_ID` 변경
```javascript
const SIM_ID = 'money_friend'; // 고유 ID
```

2. `stages` 배열 수정 (시나리오 내용)

3. 제목, 설명 등 텍스트 수정

### 3. 스테이지 구조

```javascript
const stages = [
  {
    id: 1,  // 첫 스테이지는 숫자 1
    context: "상황 설명",
    situation: "질문",
    choices: [
      {
        text: "선택지 텍스트",
        outcome: "결과 텍스트",
        principle: "원칙 이름",
        principleDesc: "원칙 설명",
        evaluation: "positive" | "neutral" | "negative",
        evalText: "평가 코멘트",
        nextStage: "stage2_path_a"  // 다음 스테이지 ID
      },
      // ...
    ]
  },
  {
    id: "stage2_path_a",  // 분기 스테이지는 문자열 ID
    // ...
    choices: [
      {
        // ...
        nextStage: "end"  // 마지막이면 "end"
      }
    ]
  }
];
```

### 4. 평가 기준

- `positive`: 효과적인 선택 (초록색 ✓)
- `neutral`: 상황에 따라 다름 (노란색 ⚠️)
- `negative`: 리스크 있는 선택 (빨간색 ✗)

## 프로필 데이터 구조

```javascript
{
  version: 5,
  name: "닉네임",
  level: 1,
  exp: 0,
  completedSims: ["idea_thief", "money_friend"],  // 완료한 시뮬 ID
  principles: [
    { name: "전략적 관용", desc: "..." },
    { name: "질문형 압박", desc: "..." }
  ]
}
```

## 경험치 규칙

- 시뮬레이터 최초 클리어: +30 EXP
- 재도전: 경험치 없음 (원칙만 추가 가능)
- 레벨업: 현재레벨 × 100 EXP 필요

## 티어 시스템

| 티어 | 레벨 |
|------|------|
| 루비 | 1-5 |
| 자수정 | 6-10 |
| 사파이어 | 11-15 |
| 에메랄드 | 16-20 |
| 옵시디언 | 21-25 |
| 골드 | 26+ |

## 칭호 시스템

| 칭호 | 레벨 |
|------|------|
| 🌱 초보 탐험가 | 1-4 |
| 🌿 호기심 많은 관찰자 | 5-9 |
| 🌳 깊이 있는 사색가 | 10-19 |
| 🌟 통찰의 대가 | 20+ |

## 체크리스트

새 시뮬레이터 추가 시:
- [ ] ID가 기존과 중복되지 않는지 확인
- [ ] index.html의 SIMULATIONS에 추가
- [ ] url을 null에서 실제 파일명으로 변경
- [ ] 시뮬레이터 HTML 파일 생성
- [ ] SIM_ID 설정
- [ ] stages 배열 작성
- [ ] 테스트: 클리어 → 경험치 지급 → 재도전 시 경험치 안 줌
