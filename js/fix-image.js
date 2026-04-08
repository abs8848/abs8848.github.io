// 修复首页文章卡片图片显示 - 保持卡片布局，图片完整显示
(function() {
  function fixImages() {
    document.querySelectorAll('.home-article-thumbnail img').forEach(function(img) {
      // 只修改图片的object-fit，保留其他所有样式
      img.style.objectFit = 'contain';
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
  setTimeout(fixImages, 500);
  setTimeout(fixImages, 1500);
  setTimeout(fixImages, 3000);
})();
