# 이클립스의 딜렘 (eclipse-mindlab/mindlab)

GitHub Pages로 배포되는 정적 사이트(HTML/CSS/JS + Firebase). main 브랜치가 곧 실서비스다.

## 절대 규칙
- 사용자 데이터를 지우는 코드를 넣지 않는다. 목록에 없는 원칙도 저장소에서 삭제하지 말고 집계에서만 뺀다.
- 바꾸면 안 되는 것: `sim-*.html` 파일명, 시뮬레이터 id(`completedSims` 값), localStorage 키, 원칙 이름 문자열, `read-me-challenge.html?id=` / `read-me-results.html?id=` 링크 형식, `.well-known/assetlinks.json`, 검색엔진 인증 파일.
- 원칙 추가 시 index.html `VALID_PRINCIPLES`와 dex.html `ALL_PRINCIPLES`를 같이 고친다. `DEX_TOTAL`은 고유 이름 수.
- 캐시되는 파일을 바꾸면 sw.js `CACHE_NAME`을 올리고 `urlsToCache` 경로가 실제로 있는지 확인한다.
- 작업은 브랜치에서 하고, 올리기 전에 반드시 검사를 돌린다.

## 검사
```
python3 tools/check.py          # 전 페이지 검사 + tools/out/ 스크린샷
python3 tools/check.py --no-shots
```
기존 사용자 데이터로 모든 페이지를 열어 JS 오류, 데이터 유실, 홈/도감 집계, 템플릿 시뮬레이터 완주 저장을 확인한다. Firebase는 tools/firebase-stub 로 대체된다.

## 디자인 시스템
- `eclipse.css`: 공통 토큰(색은 logo.png에서 추출: 보라 밤, 달빛 흰색, 마젠타 코로나), 폰트(Song Myung + IBM Plex Sans KR), 버튼, 일식 마크(`.ecl-mark`), 하단 탭(`.ecl-tabbar`).
- 코로나(마젠타)는 화면당 한 곳만 강조에 쓴다. 이모지 아이콘, 대문자 라벨, 무지개색 배지는 쓰지 않는다.
- 책 표지 썸네일은 `img/book-*.webp`(검은 여백을 잘라낸 360px). 원본 png는 다른 페이지가 쓰므로 유지.
- 오늘의 딜레마 데이터는 `daily-data.js` 하나. 새 딜레마는 배열 맨 뒤에만 추가한다.
