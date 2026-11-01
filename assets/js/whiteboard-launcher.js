/* =========================================================
   课堂白板 · 全站唤起器（whiteboard-launcher.js）
   ---------------------------------------------------------
   用途：语文资源站任意讲解页（课文、试卷讲评、作文讲评、
   病句专项等）都可一键唤起课堂白板，写完收起，原页面不动。

   设计约束（对应「不能影响我正在讲的内容」）：
   1. 不跳转、不刷新原页面 —— 白板以浮层 iframe 呈现；
   2. 不破坏原页面 DOM —— 只追加自身 UI，不改写任何节点；
   3. 板书不丢 —— iframe 只创建一次，收起是隐藏而非销毁；
   4. 不抢原页面的键 —— 仅用 B（白板内未占用）；焦点在
      输入框内时不响应；原页面快捷键优先。
   5. 不进打印 —— 按钮与浮层在 @media print 下隐藏。

   用法：页面 </body> 前引入本文件即可，无需其它配置。
   ========================================================= */
(function () {
  'use strict';
  if (window.__wbLauncher) return;
  window.__wbLauncher = true;

  /* ---------- 路径推算：从本脚本地址反推站点根 ---------- */
  var src = (document.currentScript && document.currentScript.src) || '';
  var base = src.replace(/assets\/js\/whiteboard-launcher\.js(\?.*)?$/, '');
  if (!base) {
    // 兜底：按当前页面层级往上找站点根
    var seg = location.pathname.split('/').filter(Boolean);
    base = new Array(Math.max(seg.length, 0) + 1).join('../');
  }
  var WB_URL = base + 'tools/whiteboard/index.html';

  /* ---------- 课名与会话标识 ---------- */
  function lessonTitle() {
    var h1 = document.querySelector('h1');
    var t = h1 && h1.textContent ? h1.textContent.trim() : '';
    if (!t) t = (document.title || '').trim();
    // 去掉标题尾部「 · 高一语文」这类后缀
    t = t.replace(/[|｜]\s*[^\n]*$/, '').trim();
    t = t.replace(/[\s·•]+\s*(高一|高二|高三|语文|课件|课堂)[^\n]*$/, '').trim();
    t = t.replace(/^[\s·•]+|[\s·•]+$/g, '');
    return (t || '语文课堂').slice(0, 40);
  }
  function sessionId() {
    return location.pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'lesson';
  }
  function buildUrl() {
    return WB_URL +
      '?lessonTitle=' + encodeURIComponent(lessonTitle()) +
      '&session=' + encodeURIComponent(sessionId()) +
      '&new=1';
  }

  /* ---------- 样式 ---------- */
  var css = [
    '#wbFab{position:fixed;right:18px;bottom:18px;z-index:2147483000;',
    'display:inline-flex;align-items:center;gap:6px;padding:9px 14px 9px 11px;',
    'background:#163a5f;color:#fff;border:1px solid rgba(255,255,255,.16);',
    'border-radius:22px;font:600 14px/1 "PingFang SC","Microsoft YaHei",system-ui,sans-serif;',
    'cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.28);user-select:none;',
    'opacity:.82;transition:opacity .15s,transform .08s;}',
    '#wbFab:hover{opacity:1;}',
    '#wbFab:active{transform:scale(.96);}',
    '#wbFab svg{width:17px;height:17px;display:block;}',
    '#wbLayer{position:fixed;inset:0;z-index:2147483001;background:#0e1014;display:none;flex-direction:column;}',
    '#wbLayer.open{display:flex;}',
    '#wbTop{flex:0 0 auto;height:38px;display:flex;align-items:center;gap:10px;',
    'padding:0 12px;background:#20242c;border-bottom:1px solid #0b0d10;',
    'font:13px/1 "PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:#e7e9ee;}',
    '#wbTopTitle{flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9aa0ab;}',
    '#wbTopTitle b{color:#e7e9ee;font-weight:600;}',
    '#wbTop button{background:#2b303a;color:#e7e9ee;border:1px solid transparent;',
    'border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;}',
    '#wbTop button:hover{background:#363c48;}',
    '#wbClose{background:#3d8bff!important;color:#fff!important;}',
    '#wbClose:hover{background:#2a63cf!important;}',
    '#wbFrame{flex:1 1 auto;width:100%;height:100%;border:0;background:#fff;display:block;}',
    '#wbCapture{position:fixed;right:108px;bottom:18px;z-index:2147483000;background:#2468bd;color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:22px;padding:9px 14px;cursor:pointer;font:600 14px/1 "PingFang SC","Microsoft YaHei",system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.28);}',
    '#wbSelect{position:fixed;inset:0;z-index:2147483002;background:rgba(0,0,0,.9);display:none;flex-direction:column;align-items:center;justify-content:center;color:#fff;font:14px system-ui,sans-serif;}',
    '#wbSelect.open{display:flex;}#wbSelectBar{padding:10px;text-align:center;}#wbSelect button{margin-left:12px;padding:6px 12px;cursor:pointer;}',
    '#wbImageWrap{position:relative;max-width:100%;max-height:calc(100vh - 60px);line-height:0;touch-action:none;cursor:crosshair;}',
    '#wbImageWrap img{display:block;max-width:100vw;max-height:calc(100vh - 60px);user-select:none;pointer-events:none;}',
    '#wbSelection{position:absolute;border:2px solid #49a3ff;background:rgba(73,163,255,.2);display:none;pointer-events:none;}',
    '@media print{#wbFab,#wbCapture,#wbCaptureHint,#wbLayer,#wbSelect{display:none!important;}}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- DOM ---------- */
  var PEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4-1L19 8a2 2 0 00-3-3L5 16l-1 4z"/><path d="M14 6l3 3"/></svg>';

  var fab = document.createElement('div');
  fab.id = 'wbFab';
  fab.setAttribute('role', 'button');
  fab.setAttribute('tabindex', '0');
  fab.title = '课堂白板（快捷键 B，可拖动本按钮）';
  fab.innerHTML = PEN + '<span>白板</span>';

  var layer = document.createElement('div');
  layer.id = 'wbLayer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML =
    '<div id="wbTop">' +
    '<span id="wbTopTitle">课堂白板 · <b></b></span>' +
    '<button id="wbPopout" type="button" title="在独立窗口打开（适合双屏投屏）">⧉ 独立窗口</button>' +
    '<button id="wbClose" type="button" title="收起白板（Esc）">收起 ✕</button>' +
    '</div><iframe id="wbFrame" allow="fullscreen"></iframe>';

  var capture = document.createElement('button');
  capture.id = 'wbCapture';
  capture.type = 'button';
  capture.textContent = '截图';
  capture.title = '截图需选择共享画面。Windows：Win+Shift+S 截图，打开白板后按 Ctrl+V 粘贴';
  var selection = document.createElement('div');
  selection.id = 'wbSelect';
  selection.innerHTML = '<div id="wbSelectBar">截图已停止共享，请在图片上拖拽框选 <button type="button">取消截图</button></div><div id="wbImageWrap"><img alt="待框选的静态截图" draggable="false"><div id="wbSelection"></div></div>';
  document.body.appendChild(fab);
  document.body.appendChild(capture);
  document.body.appendChild(layer);
  document.body.appendChild(selection);

  var frame = layer.querySelector('#wbFrame');
  var titleB = layer.querySelector('#wbTopTitle b');
  titleB.textContent = lessonTitle();

  var loaded = false, frameReady = false, frameLoaded = false, pendingImage = null;
  var targetOrigin = location.origin;
  frame.addEventListener('load', function () { frameLoaded = true; sendPending(); });
  function sendPending() {
    if (frameReady && frameLoaded && pendingImage) {
      frame.contentWindow.postMessage({type: 'wb-import-image', image: pendingImage}, targetOrigin);
      pendingImage = null;
    }
  }

  var wrap = selection.querySelector('#wbImageWrap');
  var preview = wrap.querySelector('img');
  var box = selection.querySelector('#wbSelection');
  var captured = null, start = null;
  function cancelSelection() {
    selection.classList.remove('open');
    preview.removeAttribute('src');
    box.style.display = 'none';
    captured = null; start = null;
  }
  selection.querySelector('button').addEventListener('click', function () {
    cancelSelection();
    alert('已取消截图，白板内容未改变。');
  });
  capture.addEventListener('click', async function () {
    if (targetOrigin === 'null') {
      alert('截图导入需要同源的 HTTP 或 HTTPS 页面，请通过本地服务器或网站打开。Windows 可使用 Win+Shift+S 截图，再打开白板按 Ctrl+V 粘贴。');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert('当前浏览器或页面环境不支持屏幕共享截图。请使用安全环境（HTTPS 或 localhost），或用 Windows Win+Shift+S 截图后打开白板按 Ctrl+V 粘贴。');
      return;
    }
    var stream, video;
    capture.disabled = true;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: false});
      video = document.createElement('video');
      video.muted = true;
      video.srcObject = stream;
      await video.play();
      // 等待共享选择窗口关闭和屏幕画面更新后取帧。
      await new Promise(function (resolve) { setTimeout(resolve, 1000); });
      if (!stream.getVideoTracks().some(function (track) { return track.readyState === 'live'; })) {
        throw new Error('屏幕共享已停止');
      }
      if (!video.videoWidth || !video.videoHeight) throw new Error('画面尚未就绪');
      var image = document.createElement('canvas');
      image.width = video.videoWidth; image.height = video.videoHeight;
      image.getContext('2d').drawImage(video, 0, 0);
      stream.getTracks().forEach(function (track) { track.stop(); });
      stream = null;
      video.srcObject = null;
      captured = image;
      preview.src = image.toDataURL('image/png');
      selection.classList.add('open');
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        alert('已取消或拒绝屏幕共享，未获取截图。也可用 Windows Win+Shift+S 截图，再打开白板按 Ctrl+V 粘贴。');
      } else {
        alert('截图失败：' + (err.message || '无法获取画面') + '。请重试或使用 Windows Win+Shift+S 和 Ctrl+V。');
      }
    } finally {
      if (stream) stream.getTracks().forEach(function (track) { track.stop(); });
      if (video) video.srcObject = null;
      capture.disabled = false;
    }
  });
  function point(e) {
    var r = preview.getBoundingClientRect();
    return {x: Math.max(0, Math.min(r.width, e.clientX - r.left)), y: Math.max(0, Math.min(r.height, e.clientY - r.top))};
  }
  wrap.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || !captured) return;
    e.preventDefault(); start = point(e); wrap.setPointerCapture(e.pointerId);
    box.style.display = 'block'; box.style.left = start.x + 'px'; box.style.top = start.y + 'px';
    box.style.width = '0'; box.style.height = '0';
  });
  wrap.addEventListener('pointermove', function (e) {
    if (!start) return;
    var p = point(e);
    box.style.left = Math.min(start.x, p.x) + 'px'; box.style.top = Math.min(start.y, p.y) + 'px';
    box.style.width = Math.abs(p.x - start.x) + 'px'; box.style.height = Math.abs(p.y - start.y) + 'px';
  });
  wrap.addEventListener('pointercancel', function () { start = null; box.style.display = 'none'; });
  wrap.addEventListener('pointerup', function (e) {
    if (!start || !captured) return;
    var p = point(e), r = preview.getBoundingClientRect();
    var x = Math.min(start.x, p.x), y = Math.min(start.y, p.y);
    var w = Math.abs(p.x - start.x), h = Math.abs(p.y - start.y);
    start = null;
    if (w < 3 || h < 3) { box.style.display = 'none'; alert('选区太小，请重新拖拽框选。'); return; }
    var sx = captured.width / r.width, sy = captured.height / r.height;
    var cropped = document.createElement('canvas');
    cropped.width = Math.max(1, Math.round(w * sx)); cropped.height = Math.max(1, Math.round(h * sy));
    cropped.getContext('2d').drawImage(captured, x * sx, y * sy, w * sx, h * sy, 0, 0, cropped.width, cropped.height);
    pendingImage = cropped.toDataURL('image/png');
    cancelSelection(); open(); sendPending();
  });
  function open() {
    if (!loaded) { frame.src = buildUrl(); loaded = true; }
    layer.classList.add('open');
    layer.setAttribute('aria-hidden', 'false');
    fab.style.opacity = '0';
    fab.style.pointerEvents = 'none';
    try { frame.contentWindow.focus(); } catch (e) { }
  }
  function close() {
    layer.classList.remove('open');
    layer.setAttribute('aria-hidden', 'true');
    fab.style.opacity = '';
    fab.style.pointerEvents = '';
    try { window.focus(); } catch (e) { }
  }
  function toggle() { layer.classList.contains('open') ? close() : open(); }

  fab.addEventListener('click', function () { if (!dragged) open(); });
  layer.querySelector('#wbClose').addEventListener('click', close);
  layer.querySelector('#wbPopout').addEventListener('click', function () {
    window.open(buildUrl(), 'classroom-whiteboard', 'width=1280,height=820');
  });

  /* ---------- 快捷键 B（不干扰原页面） ---------- */
  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'b' || e.key === 'B') { e.preventDefault(); toggle(); return; }
    if (e.key === 'Escape' && layer.classList.contains('open')) { e.preventDefault(); close(); }
  });

  /* ---------- 白板内部按 Esc / 点「返回课件」→ 通知收起 ---------- */
  window.addEventListener('message', function (e) {
    if ((targetOrigin !== 'null' && e.origin !== targetOrigin) || e.source !== frame.contentWindow || !e.data) return;
    if (e.data.type === 'wb-close') close();
    if (targetOrigin !== 'null' && e.data.type === 'wb-ready') { frameReady = true; sendPending(); }
  });

  /* ---------- 按钮可拖动（避开正文），位置全局记忆 ---------- */
  var dragged = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
  var POS_KEY = 'wbFabPos';
  (function restorePos() {
    try {
      var p = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
      if (p && typeof p.right === 'number' && typeof p.bottom === 'number') {
        fab.style.left = 'auto'; fab.style.top = 'auto';
        fab.style.right = p.right + 'px'; fab.style.bottom = p.bottom + 'px';
      }
    } catch (e) { }
  })();
  function positionCapture() {
    var r = fab.getBoundingClientRect();
    var left = r.left - capture.offsetWidth - 8;
    var top = r.top + (r.height - capture.offsetHeight) / 2;
    if (left < 8) { left = r.left; top = r.top - capture.offsetHeight - 8; }
    capture.style.left = Math.max(8, Math.min(window.innerWidth - capture.offsetWidth - 8, left)) + 'px';
    capture.style.right = 'auto';
    capture.style.top = Math.max(8, Math.min(window.innerHeight - capture.offsetHeight - 8, top)) + 'px';
    capture.style.bottom = 'auto';
  }
  positionCapture();
  window.addEventListener('resize', positionCapture);
  function savePos() {
    var r = fab.getBoundingClientRect();
    try {
      localStorage.setItem(POS_KEY, JSON.stringify({
        right: Math.round(window.innerWidth - r.right),
        bottom: Math.round(window.innerHeight - r.bottom)
      }));
    } catch (e) { }
  }
  fab.addEventListener('mousedown', function (e) {
    dragged = false; moved = false;
    sx = e.clientX; sy = e.clientY;
    var r = fab.getBoundingClientRect();
    ox = window.innerWidth - r.right; oy = window.innerHeight - r.bottom;
    e.preventDefault();
  });
  window.addEventListener('mousemove', function (e) {
    if (sx === 0 && sy === 0) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.abs(dx) + Math.abs(dy) > 5) moved = true;
    if (moved) {
      dragged = true;
      fab.style.left = 'auto'; fab.style.top = 'auto';
      fab.style.right = Math.max(8, ox - dx) + 'px';
      fab.style.bottom = Math.max(8, oy - dy) + 'px';
      positionCapture();
    }
  });
  window.addEventListener('mouseup', function () {
    if (moved) savePos();
    sx = sy = 0;
    setTimeout(function () { dragged = false; }, 0);
  });
})();
