"""
이클립스의 딜렘 자동 검사.

모든 페이지를 '이미 쓰던 사용자'의 저장 데이터로 열어서
1) 자바스크립트 오류가 없는지
2) 저장된 원칙·완료 기록·경험치가 하나도 사라지지 않았는지
3) 홈 집계 숫자가 맞는지
4) 템플릿 시뮬레이터를 끝까지 플레이하면 완료·원칙이 저장되는지
를 확인한다. Firebase는 tools/firebase-stub 의 가짜 모듈로 대체한다.

실행:  python3 tools/check.py            (스크린샷: tools/out/)
       python3 tools/check.py --no-shots
       ECLIPSE_FONTS=<dir> python3 tools/check.py   (fontsource 패키지를 풀어둔 폴더: 실제 웹폰트로 스크린샷)
"""
import http.server, json, os, re, socketserver, sys, threading
from functools import partial
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
STUB = ROOT / 'tools' / 'firebase-stub'
OUT = ROOT / 'tools' / 'out'
SHOTS = '--no-shots' not in sys.argv

index_src = (ROOT / 'index.html').read_text(encoding='utf8')
VALID = re.findall(r"'([^']*)'", re.search(r"const VALID_PRINCIPLES = \[(.*?)\];", index_src, re.S).group(1))
UNIQUE_VALID = list(dict.fromkeys(VALID))

SEED_PRINCIPLES = UNIQUE_VALID[:10] + [{'name': UNIQUE_VALID[10], 'desc': 'x'}, '테스트 미등록 원칙']
SEED_PROFILE = {
    'version': 5, 'name': '테스터', 'level': 3, 'exp': 40,
    'completedSims': ['rich', 'trolley'], 'principles': SEED_PRINCIPLES, 'maxStreak': 4,
}
SEED_LOCAL = {
    'eclipse_mindlab_profile': json.dumps(SEED_PROFILE, ensure_ascii=False),
    'eclipse_mindlab_daily': json.dumps({'lastDate': '2026-10-01', 'streak': 2, 'maxStreak': 4, 'history': {'2026-10-01': 0}}),
    'eclipse_read_books': json.dumps({'philosophy': 1}),
    'eclipse_name_dismissed': 'true',
    'mindlab_my_challenges': json.dumps(['test1234']),
}
QUESTIONS = [{'id': f'q{i}', 'text': f'질문 {i}', 'options': ['가', '나', '다', '라']} for i in range(5)]
FIRESTORE_SEED = {
    'challenges/test1234': {
        'creatorName': '테스터', 'questions': QUESTIONS,
        'answers': [{'questionId': q['id'], 'answer': 0} for q in QUESTIONS],
        'createdAt': '2026-10-01T00:00:00Z', 'attempts': 1,
        'results': [{'name': '친구', 'score': 80, 'correctCount': 4, 'timestamp': '2026-10-02T00:00:00Z'}],
    }
}
INIT = f"""
(() => {{
  if (sessionStorage.getItem('__seeded')) return;
  const seed = {json.dumps(SEED_LOCAL, ensure_ascii=False)};
  for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v);
  sessionStorage.setItem('__seeded', '1');
}})();
window.__FIRESTORE_SEED__ = {json.dumps(FIRESTORE_SEED, ensure_ascii=False)};
window.alert = () => {{}};
"""
H2C_STUB = "window.html2canvas = () => Promise.resolve(document.createElement('canvas'));"


def names(principles):
    return {p if isinstance(p, str) else (p or {}).get('name') for p in principles}


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    handler = partial(Quiet, directory=str(ROOT))
    srv = socketserver.TCPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f'http://127.0.0.1:{srv.server_address[1]}/'


FONTS = os.environ.get('ECLIPSE_FONTS')


def font_css():
    """구글 폰트 대신 로컬 fontsource 파일로 같은 글꼴을 제공한다 (스크린샷 확인용)."""
    css = []
    for pkg, files in [('song-myung', ['400.css']), ('ibm-plex-sans-kr', ['400.css', '500.css', '600.css'])]:
        d = next(p for p in Path(FONTS).glob(f'fontsource-{pkg}-*') if p.is_dir())
        for f in files:
            css.append((d / f).read_text().replace('url(./files/', f'url(http://fonts.local/{d.name}/files/'))
    return '\n'.join(css)


def route(r):
    url = r.request.url
    if FONTS and 'fonts.googleapis.com' in url:
        return r.fulfill(body=font_css(), content_type='text/css')
    if FONTS and url.startswith('http://fonts.local/'):
        return r.fulfill(path=str(Path(FONTS) / url[len('http://fonts.local/'):]))
    m = re.search(r'firebasejs/[\d.]+/(firebase-[a-z]+\.js)', url)
    if m:
        return r.fulfill(path=str(STUB / m.group(1)), content_type='application/javascript')
    if 'html2canvas' in url:
        return r.fulfill(body=H2C_STUB, content_type='application/javascript')
    if url.startswith('http://127.0.0.1'):
        return r.continue_()
    return r.abort()


def page_list():
    pages = sorted(p.name for p in ROOT.glob('*.html') if not p.name.startswith(('google', 'naver')))
    extra = {'read-me-challenge.html': '?id=test1234', 'read-me-results.html': '?id=test1234'}
    return [(p, extra.get(p, '')) for p in pages]


def get_profile(page):
    raw = page.evaluate("localStorage.getItem('eclipse_mindlab_profile')")
    return json.loads(raw) if raw else None


def check_preserved(prof, errors):
    if not prof:
        errors.append('프로필이 사라짐'); return
    lost = names(SEED_PRINCIPLES) - names(prof.get('principles', []))
    if lost: errors.append(f'원칙 유실: {sorted(lost)}')
    lost_sims = set(SEED_PROFILE['completedSims']) - set(prof.get('completedSims', []))
    if lost_sims: errors.append(f'완료 기록 유실: {sorted(lost_sims)}')
    if (prof.get('level', 1), prof.get('exp', 0)) < (SEED_PROFILE['level'], SEED_PROFILE['exp']):
        errors.append(f"레벨/경험치 감소: {prof.get('level')}/{prof.get('exp')}")


def play_template_sim(page, errors):
    sim_id = page.evaluate("typeof SimTemplate !== 'undefined' && SimTemplate.config ? SimTemplate.config.id : null")
    if not sim_id:
        return
    before = get_profile(page)
    for _ in range(40):
        if page.is_visible('#resultScreen'):
            break
        btn = page.query_selector('.sim-choice-btn:visible')
        if btn:
            btn.click()
        elif page.is_visible('#nextBtn'):
            page.click('#nextBtn')
        page.wait_for_timeout(150)
    if not page.is_visible('#resultScreen'):
        errors.append('결과 화면까지 도달 못함'); return
    after = get_profile(page)
    if sim_id not in after.get('completedSims', []):
        errors.append(f'완료 기록 미저장: {sim_id}')
    if len(names(after['principles'])) <= len(names(before['principles'])):
        errors.append('플레이 후 원칙이 늘지 않음')


def play_hunt(page, errors):
    """궤변 사냥(hunt.html) 오늘의 사냥 다섯 판을 정답으로 끝내고 저장을 확인한다."""
    if not page.evaluate("typeof window.Hunt !== 'undefined'"):
        return
    before = get_profile(page)
    page.click('#dailyBtn')
    for _ in range(600):
        if page.is_visible('#end'):
            break
        if page.query_selector('#nextBtn'):
            page.click('#nextBtn'); page.wait_for_timeout(80); continue
        r = page.evaluate("Hunt.round")
        if not r or r['done']:
            page.wait_for_timeout(80); continue
        if r['clean']:
            page.click('#okBtn'); continue
        bads = r['bad'] if r['boss'] else [r['bad'] if isinstance(r['bad'], int) else r['bad'][0]]
        kinds = r['f'] if r['boss'] else [r['f']]
        for b, f in zip(bads, kinds):
            sel = f'#logIn .msg[data-k="{b}"]:not(.caught) .bubble'
            if page.query_selector(sel) and not page.query_selector('#sheet.on'):
                page.click(sel); page.click(f'#sheetIn .opt[data-f="{f}"]')
                break
        page.wait_for_timeout(80)
    if not page.is_visible('#end'):
        errors.append('궤변 사냥 결과 화면까지 도달 못함'); return
    st = json.loads(page.evaluate("localStorage.getItem('eclipse_fallacy_hunt')") or '{}')
    day = list(st.get('daily', {}).values())
    if not day or day[0].get('grid') != '●●●●●':
        errors.append(f"궤변 사냥 기록 이상: {day}")
    after = get_profile(page)
    check_preserved(after, errors)
    if (after['level'], after['exp']) == (before['level'], before['exp']):
        errors.append('궤변 사냥 경험치 미지급')


def main():
    srv, base = serve()
    if SHOTS: OUT.mkdir(parents=True, exist_ok=True)
    failures = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for name, qs in page_list():
            ctx = browser.new_context(viewport={'width': 400, 'height': 860}, device_scale_factor=1)
            ctx.add_init_script(INIT)
            ctx.route('**/*', route)
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(f'JS 오류: {e}'))
            page.goto(base + name + qs, wait_until='load')
            page.wait_for_timeout(1200)
            check_preserved(get_profile(page), errors)
            if name == 'index.html':
                expect = len(set(n for n in names(SEED_PRINCIPLES) if n in VALID))
                got = page.inner_text('#statPrinciples').strip()
                dex = page.inner_text('#dexCount').strip()
                if got != str(expect): errors.append(f'홈 원칙 수 {got} != {expect}')
                if dex != f'{expect}/{len(UNIQUE_VALID)}': errors.append(f'홈 도감 표시 {dex}')
            if name == 'dex.html':
                total = page.inner_text('#progressCount').strip()
                if not total.endswith(f'/{len(UNIQUE_VALID)}'): errors.append(f'도감 총계 {total}')
            if SHOTS:
                page.screenshot(path=str(OUT / name.replace('.html', '.png')), full_page=True)
            play_template_sim(page, errors)
            status = 'OK ' if not errors else 'FAIL'
            failures += bool(errors)
            print(f'{status} {name}')
            for e in errors: print('     -', e)
            ctx.close()
        browser.close()
    srv.shutdown()
    print(f'\n{len(page_list()) - failures}/{len(page_list())} 통과')
    sys.exit(1 if failures else 0)


if __name__ == '__main__':
    main()
