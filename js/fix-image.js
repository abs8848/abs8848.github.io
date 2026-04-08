// 修复首页文章卡片图片显示 - 强制完整显示图片
(function() {
  function fixImages() {
    document.querySelectorAll('.home-article-thumbnail img').forEach(function(img) {
      // 强制覆盖所有样式
      img.setAttribute('style', 'object-fit: contain !important; object-position: center center !important;');
    });
  }
  
  // 立即执行一次
  fixImages();
  
  // DOM加载完成后再次执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixImages);
  }
  
  // 图片懒加载可能之后才添加图片，所以也监听load事件
  window.addEventListener('load', fixImages);
  
  // 使用MutationObserver监控DOM变化
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(function(mutations) {
      fixImages();
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
