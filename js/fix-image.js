// 确保图片在卡片中正确显示
(function() {
  function fixImages() {
    document.querySelectorAll('.home-article-thumbnail img').forEach(function(img) {
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center center';
    });
  }
  
  // 立即执行
  fixImages();
  
  // DOM加载完成后再次执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixImages);
  } else {
    fixImages();
  }
  
  // 页面完全加载后执行
  window.addEventListener('load', fixImages);
  
  // MutationObserver监控DOM变化
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function() {
      fixImages();
    }).observe(document.body, { childList: true, subtree: true });
  }
  
  // 兼容Swup
  if (typeof window.swup !== 'undefined') {
    window.swup.on('contentReplaced', fixImages);
  }
  
  // 保底方案
  setTimeout(fixImages, 1000);
  setTimeout(fixImages, 2000);
})();
