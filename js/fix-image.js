// 修复首页文章卡片图片显示 - 强制完整显示图片
(function() {
  // 方法1: 注入高优先级CSS
  function injectCSS() {
    var style = document.createElement('style');
    style.id = 'fix-image-override';
    style.textContent = [
      '.home-article-thumbnail img {',
      '  object-fit: contain !important;',
      '  object-position: center center !important;',
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }
  
  // 方法2: 直接修改元素样式作为备用
  function fixImages() {
    document.querySelectorAll('.home-article-thumbnail img').forEach(function(img) {
      img.style.setProperty('object-fit', 'contain', 'important');
      img.style.setProperty('object-position', 'center center', 'important');
    });
  }
  
  // 立即执行
  injectCSS();
  fixImages();
  
  // DOM加载完成后再次执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectCSS();
      fixImages();
    });
  }
  
  // 页面完全加载后执行
  window.addEventListener('load', function() {
    injectCSS();
    fixImages();
  });
  
  // 使用MutationObserver监控DOM变化
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function(mutations) {
      fixImages();
    }).observe(document.body, { childList: true, subtree: true });
  }
  
  // 兼容Swup页面过渡库
  if (typeof window.swup !== 'undefined') {
    window.swup.on('contentReplaced', function() {
      injectCSS();
      fixImages();
    });
  }
  
  // 使用setTimeout作为保底方案
  setTimeout(function() {
    injectCSS();
    fixImages();
  }, 1000);
  
  setTimeout(function() {
    injectCSS();
    fixImages();
  }, 3000);
})();
