# 꼬마 철학자의 정원 앱

화면과 게임은 `../garden/` 하나예요. 웹으로는 `https://eclipse-mindlab.github.io/mindlab/garden/` 에서 열리고, 앱은 같은 화면을 Capacitor로 감싼 진짜 앱이에요. 주소창이 없고, 폰 알림과 구글 로그인이 앱 방식으로 돌아가요.

- `garden/index.html`: 게임 전체. 진행은 폰에 먼저 저장되고, 구글로 로그인하면 Firebase(`eclipse-mindlab`, 딜렘과 같은 프로젝트)에도 저장돼요.
- `garden-app/`: 앱 껍데기. `android/`, `ios/` 폴더는 저장소에 올리지 않고 빌드할 때마다 새로 만들어요.
- `.github/workflows/garden-android.yml`: `garden/`나 `garden-app/`을 고쳐 올리면 GitHub가 안드로이드 앱을 자동으로 빌드해요. Actions 탭 → 해당 실행 → `garden-android` 에서 APK/AAB를 받아요.

## 1. 구글 로그인 켜기 (Firebase 콘솔, 한 번만)

1. Firebase 콘솔 → `eclipse-mindlab` → 프로젝트 설정 → 앱 추가 → Android
   - 패키지 이름: `io.github.eclipse_mindlab.garden`
   - SHA-1: 아래 2번에서 만든 서명 키의 SHA-1. Play에 올린 뒤에는 Play Console → 앱 무결성 → "앱 서명 키 인증서"의 SHA-1도 추가해요. 이게 빠지면 Play에서 받은 앱에서 로그인이 안 돼요.
2. `google-services.json`을 내려받아서, GitHub 저장소 Settings → Secrets and variables → Actions → New secret
   - 이름 `GARDEN_GOOGLE_SERVICES_JSON`, 값은 파일 내용 전체
3. Firestore → 규칙: 기존 규칙은 그대로 두고 `firestore.rules.garden`의 두 블록을 `match /databases/{database}/documents { ... }` 안에 추가 → 게시
4. Authentication의 Google 로그인은 딜렘에서 이미 켜져 있어요. 같은 구글 계정이면 딜렘 이름이 리그 이름으로 그대로 들어와요.

## 2. 서명 키 만들기 (한 번만, 절대 잃어버리면 안 됨)

```
keytool -genkeypair -v -keystore garden-upload.jks -alias garden -keyalg RSA -keysize 2048 -validity 10000
keytool -list -v -keystore garden-upload.jks -alias garden   # 여기 나오는 SHA1을 1번에 넣어요
base64 -w0 garden-upload.jks                                  # 맥은 base64 -i garden-upload.jks
```

GitHub 시크릿 네 개를 추가해요.

| 이름 | 값 |
| --- | --- |
| `GARDEN_KEYSTORE_BASE64` | 위 base64 결과 |
| `GARDEN_KEYSTORE_PASSWORD` | 키 저장소 비밀번호 |
| `GARDEN_KEY_ALIAS` | `garden` |
| `GARDEN_KEY_PASSWORD` | 키 비밀번호 |

시크릿 다섯 개가 다 있으면 서명된 APK와 AAB가 함께 나와요. 시크릿이 없으면 시험용(debug) APK만 나와요. 폰에 깔아서 해 볼 수는 있지만 구글 로그인은 안 돼요.

## 3. 구글 플레이 베타

1. Play Console에서 앱 만들기 (이름: 꼬마 철학자의 정원, 게임 아님 → 앱, 무료)
2. 테스트 → 내부 테스트 → 새 버전 → Actions에서 받은 `.aab` 업로드 → 테스터 이메일 추가 → 링크를 테스터에게 공유
3. 정식 출시 전에 채울 것: 개인정보처리방침 URL(딜렘 `privacy.html`에 정원 항목 추가), 데이터 보안 양식(구글 계정 이메일·이름, 게임 진행 저장), 콘텐츠 등급, 스크린샷
4. 2023년 11월 이후 만든 개인 개발자 계정이면, 정식 출시 전에 비공개 테스트를 12명 이상이 14일 동안 해야 해요. 구독자 베타 모집으로 채우면 돼요.

## 4. 아이폰

맥과 Xcode, 애플 개발자 계정(연 99달러)이 있어야 해요.

```
cd garden-app && npm install && npx cap add ios && npm run ios
```

1. Firebase에 iOS 앱 추가(번들 ID `io.github.eclipse_mindlab.garden`) → `GoogleService-Info.plist`를 `ios/App/App/`에 넣기
2. Xcode → App → Info → URL Types에 plist의 `REVERSED_CLIENT_ID` 추가
3. 앱스토어 규정상 구글 로그인을 넣으면 애플 로그인도 같이 있어야 해요. iOS 출시 전에 애플 로그인을 추가해요.
4. Xcode → Product → Archive → TestFlight로 베타

## 5. 앱 안에서 도는 것

- 알림(폰 안에서 예약, 서버 없음): 아침 8시 40분 "오늘 미션이 게시판에 붙었어요", 연속 기록이 있는데 오늘 미션을 안 했으면 밤 9시 10분에 한 번, 시간 미션이 끝나면 한 번. 첫 미션을 "할게요" 할 때 알림 허락을 물어요.
- 안드로이드 뒤로 가기: 열린 창부터 닫고, 다 닫혀 있으면 앱을 내려요.
- 해낸 미션의 "자랑하기": 그림 카드를 만들어 공유 창을 띄워요.
- 저장: 로그인하면 정원이 클라우드에 올라가요. 새 폰에서 로그인하면 더 많이 자란 쪽 정원으로 맞추고, 바뀌기 전 정원은 폰에 백업으로 남겨요.
- 리그: 이번 주(월요일 시작) 해낸 미션 수로 순위. 위 30명과 내 순위를 보여 줘요.

## 직접 빌드할 때

```
cd garden-app
npm install
npm run sync          # ../garden 을 www 로 복사하고 네이티브 프로젝트에 반영
npx cap add android   # 처음 한 번
npx cap open android  # 안드로이드 스튜디오
```

처음 `cap add android` 뒤에는 `android/variables.gradle`의 `ext {` 안에 `rgcfaIncludeGoogle = true` 한 줄을 넣어야 구글 로그인이 들어가요. 워크플로는 이걸 자동으로 해요.
