// 修复首页文章卡片图片显示 - 强制完整显示图片
(function() {
  // 注入高优先级CSS
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
  
  // 直接修改元素样式
  function fixImages() {
    var imgs = document.querySelectorAll('.home-article-thumbnail img');
    imgs.forEach(function(img) {
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center center';
    });
    console.log('Fixed ' + imgs.length + ' images');
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
  } else {
    injectCSS();
    fixImages();
  }
  
  // 页面完全加载后执行
  window.addEventListener('load', function() {
    injectCSS();
    fixImages();
  });
  
  // MutationObserver监控DOM变化
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function() {
      fixImages();
    }).observe(document.body, { childList: true, subtree: true });
  }
  
  // 兼容Swup
  if (typeof window.swup !== 'undefined') {
    window.swup.on('contentReplaced', function() {
      injectCSS();
      fixImages();
    });
  }
  
  // 保底方案
  setTimeout(fixImages, 500);
  setTimeout(fixImages, 1500);
  setTimeout(fixImages, 3000);
})();
