/* ==========================================================================
   ECLIPSE FILM ENGINE
   영화형 시뮬레이터 공통 엔진. 페이지는 window.FILM 설정만 정의하고 이 파일을 불러온다.

   FILM = {
     id, title, tagline, notice?, runtime,
     cast: ['아버지', ...], book: { title?, url },
     share: { url, text },
     scenes: [{
       page,                       // 대본 페이지 번호(장식)
       beats: [beat],              // 탭할 때마다 하나씩
       ask,                        // 선택 대본 페이지의 지문
       choices: [{ par, dl, beats, p:{no,name,desc} }],
       write?: { act, ph, label }, // 있으면 직접 쓰기 페이지 (final 씬에서 사용)
       after?: [beat], skip?: [beat], p?: {...}, final?: true
     }],
     ending(picks) -> { name, lines: [..] }
   }
   beat = { slate?, shot?, who?, x, if?(picks) }
   shot = { k:'two', L, R } | { k:'phone', from, x } | { k:'num', big, small } | { k:'black', cap? }

   저장은 기존 시뮬레이터와 같은 규칙: localStorage 'eclipse_mindlab_profile',
   첫 완료 때만 경험치 +30, 원칙은 이름 문자열로 추가 (삭제는 절대 하지 않음).
   ========================================================================== */
(function () {
  const F = window.FILM;
  const STORAGE_KEY = 'eclipse_mindlab_profile';
  const $ = s => document.querySelector(s);
  const screen = $('#screen'), subs = $('#subs'), slateEl = $('#slate'), deck = $('#deck'), adv = $('#adv');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let sc = 0, picks = [], said = '', got = [], queue = [], qi = 0, onDone = null, phase = 'ident', cur = null;

  /* grain */
  (() => {
    if (reduce) return;
    const c = $('#grain'), x = c.getContext('2d'), img = x.createImageData(160, 90);
    let last = 0;
    (function f(t) {
      if (t - last > 83) { last = t; const d = img.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } x.putImageData(img, 0, 0); }
      requestAnimationFrame(f);
    })(0);
  })();

  /* timecode */
  let tcRun = false, tcFrames = 0, tcLast = 0;
  (function tick(t) {
    if (tcRun && tcLast) tcFrames += (t - tcLast) / 1000 * 24;
    tcLast = t;
    const f = Math.floor(tcFrames), s = Math.floor(f / 24), p = n => String(n).padStart(2, '0');
    $('#tc').textContent = `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f % 24)}`;
    requestAnimationFrame(tick);
  })(0);
  function freeze(on) { tcRun = !on; screen.classList.toggle('frozen', on); $('#tc').classList.toggle('frozen', on); }

  /* shots */
  function putShot(h) { const old = screen.querySelector('.shot'); old.insertAdjacentHTML('afterend', h); old.remove(); }
  function twoSVG(on) {
    const fig = (side, body) => `<g class="${on === side ? 'on' : ''}">${body}</g>`;
    return `<svg viewBox="0 0 240 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d84a3"/><stop offset="1" stop-color="#4a4258"/></linearGradient>
        <pattern id="blind" width="4" height="3.2" patternUnits="userSpaceOnUse"><rect width="4" height="1.1" fill="#000" opacity=".55"/></pattern>
        <radialGradient id="spill" cx=".5" cy=".35" r=".6"><stop offset="0" stop-color="#ddd0f0" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="240" height="100" fill="#110a1c"/>
      <rect x="62" y="6" width="116" height="60" fill="url(#win)"/>
      <rect x="62" y="6" width="116" height="60" fill="url(#blind)"/>
      <rect x="119" y="6" width="2" height="60" fill="#110a1c"/>
      <rect width="240" height="100" fill="url(#spill)"/>
      ${fig('L', `<path d="M40 82 Q41 60 63 59 Q85 60 86 82Z" fill="#06030a"/><circle cx="63" cy="46" r="11" fill="#06030a"/><path class="rim" d="M74 44 A11 11 0 0 1 66 57 M80 64 Q85 70 86 82"/>`)}
      <rect x="0" y="76" width="240" height="24" fill="#09050f"/>
      <line x1="0" y1="76" x2="240" y2="76" stroke="#3a2e4c" stroke-width=".6"/>
      ${fig('R', `<path d="M150 104 Q152 68 194 66 Q236 68 240 104Z" fill="#030106"/><circle cx="194" cy="50" r="16" fill="#030106"/><path class="rim" d="M180 40 A16 16 0 0 1 192 34 M158 80 Q164 70 178 67"/>`)}
    </svg>`;
  }
  function renderShot(s, speaker) {
    if (!s) return;
    let h = '';
    if (s.k === 'phone') h = `<div class="shot s-phone"><div class="notif"><i></i><div class="h">${esc(s.from)}<span>지금</span></div><div>${esc(s.x)}</div></div></div>`;
    else if (s.k === 'num') h = `<div class="shot s-num"><div class="big">${esc(s.big)}</div>${s.small ? `<div class="small">${esc(s.small)}</div>` : ''}</div>`;
    else if (s.k === 'black') h = `<div class="shot s-black">${s.cap ? `<div class="cap">${esc(s.cap)}</div>` : ''}</div>`;
    else if (s.k === 'two') h = `<div class="shot s-two">${twoSVG(speaker === s.L ? 'L' : speaker === s.R ? 'R' : null)}</div>`;
    else if (s.k === 'card') h = `<div class="shot s-card"><div class="no">이 장면의 원칙</div><div class="nm">${esc(s.name)}</div></div>`;
    else if (s.k === 'title') h = `<div class="shot s-title">${s.u ? `<div class="u">${esc(s.u)}</div>` : ''}<div class="t">${esc(s.t)}</div></div>`;
    screen.classList.add('cut');
    setTimeout(() => { putShot(h); screen.classList.remove('cut'); }, reduce ? 0 : 90);
  }
  function relight(speaker) {
    if (!cur || cur.k !== 'two') return;
    const g = screen.querySelectorAll('.s-two svg > g');
    if (g.length === 2) { g[0].classList.toggle('on', speaker === cur.L); g[1].classList.toggle('on', speaker === cur.R); }
  }
  function setSub(b) {
    const cls = b.long ? 'long' : b.who === '나' ? 'me' : b.who ? '' : 'nar';
    const who = b.who && b.who !== '나' && (!cur || cur.k !== 'two') ? `<span class="who">${esc(b.who)}</span>` : '';
    subs.innerHTML = b.x ? `<div class="subline ${cls}">${who}${esc(b.x)}</div>` : '';
  }

  /* beats */
  function show(b) {
    if (b.slate) slateEl.textContent = b.slate;
    if (b.shot) { cur = b.shot; renderShot(b.shot, b.who); } else relight(b.who);
    setSub(b);
  }
  function play(beats, done) {
    document.body.classList.remove('sheet-open');
    queue = beats.filter(b => !b.if || b.if(picks)); qi = 0; onDone = done; phase = 'beats'; adv.hidden = false; freeze(false);
    if (!queue.length) return end();
    show(queue[qi++]);
  }
  function step() { if (phase !== 'beats') return; if (qi < queue.length) show(queue[qi++]); else end(); }
  function end() { phase = 'idle'; adv.hidden = true; onDone(); }
  $('#ff').addEventListener('click', e => { e.stopPropagation(); if (phase !== 'beats') return; while (qi < queue.length - 1) qi++; if (qi < queue.length) show(queue[qi++]); });
  document.addEventListener('click', e => { if (e.target.closest('button,textarea,a,.page,.credits')) return; if (phase === 'ident') return titleCard(); step(); });
  document.addEventListener('keydown', e => { if (phase === 'beats' && (e.key === ' ' || e.key === 'ArrowRight')) { e.preventDefault(); step(); } });

  /* flow */
  const markHTML = '<div class="ecl-mark" aria-hidden="true"><i class="lit"></i><i class="rim"></i><i class="shade"></i></div>';
  function ident() {
    phase = 'ident'; adv.hidden = true; slateEl.textContent = '';
    putShot(`<div class="shot ident">${markHTML}<div class="word">이클립스</div></div>`);
    subs.innerHTML = ''; deck.innerHTML = '';
    setTimeout(() => { if (phase === 'ident') titleCard(); }, reduce ? 0 : 4200);
  }
  function titleCard() {
    if (phase !== 'ident') return; phase = 'title';
    renderShot({ k: 'title', t: F.title, u: '이클립스의 딜렘' });
    subs.innerHTML = `<div class="subline nar">${esc(F.tagline)}</div>`;
    deck.innerHTML = `<button class="ecl-btn" id="playBtn" type="button">상영 시작</button>
      <div class="meta">${esc(F.runtime)}</div>${F.notice ? `<div class="meta warn">${esc(F.notice)}</div>` : ''}`;
    $('#playBtn').onclick = start;
  }
  function start() { sc = 0; picks = []; said = ''; got = []; tcFrames = 0; deck.innerHTML = ''; scene(); }
  function scene() { const S = F.scenes[sc]; deck.innerHTML = ''; play(S.beats, () => S.write ? writePage(S) : choosePage(S)); }

  function pageShell(S, act) {
    const d = document.createElement('div'); d.className = 'page';
    d.innerHTML = `<div class="pg-cue">당신의 차례</div><div class="pg-no">${S.page}.</div><div class="pg-head">${esc(slateEl.textContent)}</div><p class="act">${esc(act)}</p>`;
    const sh = document.createElement('div'); sh.className = 'sheet'; sh.appendChild(d);
    deck.innerHTML = ''; deck.appendChild(sh); document.body.classList.add('sheet-open');
    try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) {}
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('in')));
    return d;
  }
  function writePage(S) {
    freeze(true); phase = 'page';
    const d = pageShell(S, S.write.act);
    d.insertAdjacentHTML('beforeend', `<div class="wbox"><label class="wch" for="say">${esc(S.write.label || '나')}</label><textarea id="say" maxlength="60" placeholder="${esc(S.write.ph)}"></textarea></div>
      <div class="note">잘 쓰려고 하지 않아도 돼요. 떠오르는 대로.</div>
      <div class="pbtns"><button class="pbtn alt" id="skipW" type="button">쓰지 않기</button><button class="pbtn" id="shoot" type="button">${esc(S.write.send || '이 문장으로 보내기')}</button></div>`);
    const finish = () => { if (S.p) got.push(S.p); principle(S.p); };
    $('#shoot').onclick = () => {
      const v = $('#say').value.trim(); if (!v) { $('#say').focus(); return; }
      said = v; deck.innerHTML = '';
      play([{ shot: { k: 'phone', from: S.write.from || '나', x: said }, x: S.write.sent || '' }, ...(S.after || [])], finish);
    };
    $('#skipW').onclick = () => { deck.innerHTML = ''; play(S.skip || [], finish); };
  }
  function choosePage(S) {
    freeze(true); phase = 'page';
    const d = pageShell(S, S.ask);
    const L = document.createElement('div'); L.className = 'lines';
    S.choices.forEach((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'line';
      b.innerHTML = `<span class="ch">나</span><span class="par">(${esc(c.par)})</span><span class="dl">${esc(c.dl)}</span>`;
      b.onclick = () => pick(S, i, L, b);
      L.appendChild(b);
    });
    d.appendChild(L);
  }
  async function pick(S, i, L, b) {
    if (phase !== 'page') return; phase = 'locked';
    L.classList.add('locked'); b.classList.add('pick');
    await wait(380);
    L.querySelectorAll('.line').forEach(x => { if (x !== b) x.classList.add('strike'); });
    const c = S.choices[i]; picks.push(i); got.push(c.p);
    await wait(700);
    deck.innerHTML = '';
    play([{ who: '나', x: c.dl }, ...c.beats], () => principle(c.p));
  }
  function principle(p) {
    document.body.classList.remove('sheet-open');
    const last = sc === F.scenes.length - 1;
    const next = () => { if (last) ending(); else { sc++; scene(); } };
    if (!p) return next();
    phase = 'idle'; freeze(false);
    cur = { k: 'card' }; renderShot({ k: 'card', no: p.no, name: p.name });
    setSub({ x: p.desc, long: true });
    deck.innerHTML = `<button class="ecl-btn ghost" id="nx" type="button">${last ? '엔딩 보기' : '다음 장면'}</button>`;
    $('#nx').onclick = () => { deck.innerHTML = ''; next(); };
  }
  function ending() {
    const E = F.ending(picks);
    slateEl.textContent = '엔딩';
    play([{ shot: { k: 'black' }, x: E.lines[0] }, ...E.lines.slice(1).map(x => ({ x })), { shot: { k: 'title', t: E.name, u: '당신의 엔딩' }, x: '' }], () => { saveProgress(); credits(E); });
  }

  /* save: same rules as sim-template.js */
  function saveProgress() {
    try {
      let profile;
      try { profile = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { profile = null; }
      if (!profile || typeof profile !== 'object') profile = { version: 5, name: '익명 탐험가', level: 1, exp: 0, completedSims: [], principles: [] };
      if (!profile.version) profile.version = 5;
      if (!Array.isArray(profile.completedSims)) profile.completedSims = [];
      if (!Array.isArray(profile.principles)) profile.principles = [];
      if (!profile.completedSims.includes(F.id)) {
        profile.completedSims.push(F.id);
        profile.exp = (profile.exp || 0) + 30;
        profile.level = profile.level || 1;
        while (profile.exp >= profile.level * 100) { profile.exp -= profile.level * 100; profile.level++; }
      }
      const have = new Set(profile.principles.map(p => typeof p === 'string' ? p : (p && p.name)));
      got.forEach(p => { if (p && !have.has(p.name)) { profile.principles.push(p.name); have.add(p.name); } });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) { /* 저장 실패해도 상영은 계속 */ }
  }

  function credits(E) {
    phase = 'credits'; freeze(true);
    const c = document.createElement('div'); c.className = 'credits'; c.setAttribute('role', 'dialog'); c.setAttribute('aria-label', '크레딧');
    c.innerHTML = `<div class="roll">
      <div><div class="cr-title">${esc(E.name)}</div><p class="cr-sub">${E.lines.map(esc).join(' ')}</p></div>
      ${said ? `<div class="cr"><h5>${esc(F.creditWritten || '각본')}</h5><div>당신</div><div class="q">“${esc(said)}”</div></div>` : ''}
      <div class="cr"><h5>출연</h5>${F.cast.map(n => `<div>${esc(n)}</div>`).join('')}</div>
      <div class="cr"><h5>이 영화에서 모은 원칙</h5>${got.map(p => `<div>${esc(p.name)}</div>`).join('')}<div style="font-size:13px;color:var(--mist)">원칙 도감에 저장했어요</div></div>
      <div class="cr"><h5>함께 읽을 책</h5><div class="bk">세계척학전집${F.book.title ? ` 『${esc(F.book.title)}』` : ''}</div></div>
      <div class="cr cr-end">${markHTML}<h5>제작</h5><div style="font-family:var(--serif)">이클립스</div></div>
      <div class="cr-actions">
        <a class="ecl-btn" href="${esc(F.book.url)}" target="_blank" rel="noopener">책 보러 가기</a>
        <button class="ecl-btn ghost" id="shareFilm" type="button">친구에게 보내기</button>
        <button class="ecl-btn ghost" id="retake" type="button">다른 선택으로 다시 보기</button>
        <a href="index.html" style="color:var(--mist);font-size:14px;margin-top:6px">홈으로</a>
      </div>
    </div><button class="cr-skip" id="crSkip" type="button">크레딧 건너뛰기</button>`;
    document.body.appendChild(c);
    const toStatic = () => { c.classList.add('static'); const s = $('#crSkip'); if (s) s.remove(); };
    c.querySelector('.roll').addEventListener('animationend', toStatic);
    $('#crSkip').onclick = toStatic;
    if (reduce) toStatic();
    $('#retake').onclick = () => { c.remove(); freeze(false); ident(); };
    $('#shareFilm').onclick = async () => {
      const text = F.share.text + '\n' + F.share.url;
      try { if (navigator.share) { await navigator.share({ title: F.title, text }); return; } } catch (e) { return; }
      try { await navigator.clipboard.writeText(text); $('#shareFilm').textContent = '링크를 복사했어요'; } catch (e) { $('#shareFilm').textContent = F.share.url; }
    };
  }

  window.SimFilm = { get picks() { return picks; }, get phase() { return phase; } };
  ident();
})();
