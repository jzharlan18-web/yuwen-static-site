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
    '@media print{#wbFab,#wbLayer{display:none!important;}}'
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

  document.body.appendChild(fab);
  document.body.appendChild(layer);

  var frame = layer.querySelector('#wbFrame');
  var titleB = layer.querySelector('#wbTopTitle b');
  titleB.textContent = lessonTitle();

  var loaded = false;
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
    if (e && e.data && e.data.type === 'wb-close') close();
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
    }
  });
  window.addEventListener('mouseup', function () {
    if (moved) savePos();
    sx = sy = 0;
    setTimeout(function () { dragged = false; }, 0);
  });
})();
