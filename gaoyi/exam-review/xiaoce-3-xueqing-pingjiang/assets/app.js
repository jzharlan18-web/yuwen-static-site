// 语文资源站 · 交互脚本
(function(){
  // 当前页导航高亮
  var page = document.body.getAttribute('data-page') || '';
  document.querySelectorAll('.nav a').forEach(function(a){
    if(a.getAttribute('data-nav') === page) a.classList.add('on');
  });

  // 移动端菜单
  var btn = document.querySelector('.menu-btn');
  var nav = document.querySelector('.nav');
  if(btn && nav){
    btn.addEventListener('click', function(){ nav.classList.toggle('open'); });
    nav.addEventListener('click', function(e){ if(e.target.tagName === 'A') nav.classList.remove('open'); });
  }

  // 返回顶部
  var top = document.getElementById('top');
  function onScroll(){
    if(!top) return;
    if(window.scrollY > 400) top.classList.add('show');
    else top.classList.remove('show');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  if(top) top.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });

  // 条形图进入视口时动画
  var bars = document.querySelectorAll('.bar-fill');
  if('IntersectionObserver' in window && bars.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var el = en.target;
          var w = el.getAttribute('data-w');
          if(w) el.style.width = w + '%';
          io.unobserve(el);
        }
      });
    }, {threshold:.2});
    bars.forEach(function(b){ io.observe(b); });
  } else {
    bars.forEach(function(b){ b.style.width = b.getAttribute('data-w') + '%'; });
  }
})();
