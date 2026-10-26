/* Registro opcional do PWA, sem interferir no Firebase nem nas páginas. */
(function(){if(!('serviceWorker' in navigator))return;window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').catch(function(err){console.warn('PWA indisponível:',err);});});})();
