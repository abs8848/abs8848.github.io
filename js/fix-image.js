document.addEventListener("DOMContentLoaded", function() { 
  document.querySelectorAll("#home-article-thumbnail img").forEach(function(img) { 
    img.style.objectFit = "contain"; 
    img.style.objectPosition = "center center"; 
  }); 
});
