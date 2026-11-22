/* Cursor personalizado: círculo fucsia de 12 px que sigue al mouse sin retraso */
(function(){
  var cur = document.getElementById('cursor');
  // solo con mouse (en celular no hay cursor)
  if (!cur || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  var mx = 0, my = 0, cx = 0, cy = 0;

  addEventListener('pointermove', function(e){
    mx = e.clientX; my = e.clientY;
    if (!cur.classList.contains('on')){ cx = mx; cy = my; cur.classList.add('on'); }
  });
  document.addEventListener('mouseleave', function(){ cur.classList.remove('on'); });
  document.addEventListener('mouseenter', function(){ cur.classList.add('on'); });

  (function loop(){
    cx += (mx - cx) * 1;       // 1 = sin retraso (más bajo, ej. .5, = más suave y lento)
    cy += (my - cy) * 1;
    cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    requestAnimationFrame(loop);
  })();
})();
