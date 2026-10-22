/*
  결과 이미지 저장 (모든 페이지 공통)
  - PC: 바로 다운로드
  - 휴대폰: 공유 시트를 띄운다 (아이폰은 '이미지 저장'으로 사진 앱에 저장)
  - 공유 시트를 못 쓰는 환경(유튜브·인스타·카카오톡 앱 안 브라우저 등): 이미지를 화면에 띄워 길게 눌러 저장하게 한다
*/
(function () {
  function isTouch() {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  }
  function toBlob(url) {
    var parts = url.split(','), bin = atob(parts[1]), n = bin.length, arr = new Uint8Array(n);
    while (n--) arr[n] = bin.charCodeAt(n);
    return new Blob([arr], { type: 'image/png' });
  }
  function showOverlay(url) {
    var o = document.getElementById('eclSaveOverlay');
    if (!o) {
      var st = document.createElement('style');
      st.textContent =
        '#eclSaveOverlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.88);display:none;align-items:center;justify-content:center;padding:20px}' +
        '#eclSaveOverlay .ecl-save-box{width:100%;max-width:420px;text-align:center}' +
        '#eclSaveOverlay img{display:block;width:100%;height:auto;max-height:70vh;object-fit:contain;border-radius:12px;-webkit-touch-callout:default;-webkit-user-select:auto;user-select:auto}' +
        '#eclSaveOverlay p{color:#fff;font-size:15px;line-height:1.5;margin:16px 0 12px}' +
        '#eclSaveOverlay button{background:#fff;color:#17141f;border:0;border-radius:999px;padding:11px 26px;font-size:15px;font-weight:700;font-family:inherit}';
      document.head.appendChild(st);
      o = document.createElement('div');
      o.id = 'eclSaveOverlay';
      o.innerHTML = '<div class="ecl-save-box"><img alt="결과 이미지"><p>이미지를 길게 눌러 저장하세요</p><button type="button">닫기</button></div>';
      document.body.appendChild(o);
      o.addEventListener('click', function (e) {
        if (e.target === o || e.target.tagName === 'BUTTON') o.style.display = 'none';
      });
    }
    o.querySelector('img').src = url;
    o.style.display = 'flex';
  }
  function download(url, filename) {
    var a = document.createElement('a');
    a.download = filename;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  window.EclipseSaveImage = function (canvas, filename) {
    filename = filename || 'eclipse.png';
    var url = canvas.toDataURL('image/png');
    if (!isTouch()) { download(url, filename); return Promise.resolve('download'); }
    try {
      var file = new File([toBlob(url)], filename, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file] }).then(function () { return 'share'; }, function (e) {
          if (e && e.name === 'AbortError') return 'cancel';
          showOverlay(url); return 'overlay';
        });
      }
    } catch (e) { /* 아래 화면 보기로 */ }
    showOverlay(url);
    return Promise.resolve('overlay');
  };
})();
