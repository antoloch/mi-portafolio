(function(){
  /* =====================================================
     TUS PROYECTOS — cambia nombre, foto y link de cada uno
     img:  ruta de la foto (ej. 'images/lamp01.jpg')
     href: página del proyecto (proyecto-01.html ... proyecto-09.html)
     ===================================================== */
  var PROJECTS = [
    {name:'21 Ágapes: Ecos del Encuentro', img:'images/01.png', href:'proyecto-01.html'},
    {name:'Vitrina Sónica',                img:'images/02.jpg', href:'proyecto-02.html'},
    {name:'El Tincado',                    img:'images/03.jpg', href:'proyecto-03.html'},
    {name:'Lamp 01',                       img:'images/04.jpg', href:'proyecto-04.html'},
    {name:'Silla de Madera',               img:'images/05.jpg', href:'proyecto-05.html'},
    {name:'Torno Patero',                  img:'images/06.jpg', href:'proyecto-06.html'},
    {name:'Aural',                         img:'images/07.png', href:'proyecto-07.html'},
    {name:'Auto',                          img:'images/08.jpg', href:'proyecto-08.html'},
  ];

  /* grises de respaldo, por si una foto aún no está */
  var FALLBACK = ['#e6e6e6','#c9c9c9','#9a9a9a','#d4d4d4','#a8a8a8','#7d7d7d','#bdbdbd','#6f6f6f','#b3b3b3'];

  var stage = document.getElementById('stage'),
      sc    = document.getElementById('sc'),
      ctr   = document.getElementById('ctr'),
      ix    = document.getElementById('ix'),
      tst   = document.getElementById('tst'),
      label = document.getElementById('cursor-label'),
      nIdx  = document.getElementById('nav-index'),
      nProj = document.getElementById('nav-projects');

  var N = PROJECTS.length, MAXI = N - 1;
  var P = [], cur = 0, tgt = 0, drag = false, moved = false, ly = 0, hovered = -1, tt;

  function pad(n){ return ('0' + n).slice(-2); }

  /* crear planos y lista */
  PROJECTS.forEach(function(pr, i){
    var p = document.createElement('div');
    p.className = 'pn';
    p.style.backgroundColor = FALLBACK[i % FALLBACK.length];
    p.style.backgroundImage = "url('" + pr.img + "')";
    p.innerHTML = '<span></span>';
    sc.appendChild(p); P.push(p);

    var r = document.createElement('a');
    r.href = pr.href;
    r.textContent = pad(i + 1) + '  ' + pr.name;
    ix.appendChild(r);
  });

  /* INDEX (menú de arriba): abre / cierra la lista de proyectos */
  function showIndex(on){
    ix.classList.toggle('o', on);
    nIdx.classList.toggle('is-current', on);
    nProj.classList.toggle('is-current', !on);
    if (history.replaceState) history.replaceState(null, '', on ? '#index' : location.pathname + location.search);
  }
  nIdx.addEventListener('click', function(e){ e.preventDefault(); showIndex(!ix.classList.contains('o')); });
  nProj.addEventListener('click', function(e){ if (ix.classList.contains('o')){ e.preventDefault(); showIndex(false); } });
  addEventListener('keydown', function(e){ if (e.key === 'Escape') showIndex(false); });
  if (location.hash === '#index') showIndex(true);

  /* scroll, arrastre y toque recorren la profundidad */
  stage.addEventListener('wheel', function(e){
    if (ix.classList.contains('o')) return;   /* con la lista abierta, el scroll es de la lista */
    e.preventDefault();
    tgt = Math.max(0, Math.min(MAXI, tgt + e.deltaY * .0025));
  }, {passive:false});

  var sy = 0;
  stage.addEventListener('pointerdown', function(e){ drag = true; moved = false; ly = sy = e.clientY; });
  addEventListener('pointerup', function(){ drag = false; });
  stage.addEventListener('pointermove', function(e){
    if (drag){
      var dy = e.clientY - ly; ly = e.clientY;
      if (Math.abs(e.clientY - sy) > 8) moved = true;   /* solo cuenta como arrastre si te moviste más de 8 px */
      /* el carrusel solo se mueve cuando de verdad arrastras (así un clic no lo desplaza) */
      if (moved) tgt = Math.max(0, Math.min(MAXI, tgt - dy / (innerWidth > 700 ? 150 : 90)));
    }
    var o = e.target.closest ? e.target.closest('.pn') : null;
    hovered = o ? P.indexOf(o) : -1;
    label.textContent = hovered > -1 ? PROJECTS[hovered].name : '';
  });
  stage.addEventListener('pointerleave', function(){ hovered = -1; label.textContent = ''; });

  /* clic en cualquier foto: abre la página de ese proyecto */
  stage.addEventListener('click', function(e){
    if (moved) return;
    /* usa la foto sobre la que está el cursor (la foto se mueve al hacer hover, así el clic no se pierde) */
    var o = e.target.closest ? e.target.closest('.pn') : null;
    var i = hovered > -1 ? hovered : (o ? P.indexOf(o) : -1);
    if (i < 0) return;
    var href = PROJECTS[i].href;
    if (href){ location.href = href; return; }
    tst.textContent = '→ página de ' + PROJECTS[i].name;
    tst.style.opacity = 1; clearTimeout(tt);
    tt = setTimeout(function(){ tst.style.opacity = 0; }, 1800);
  });

  /* animación */
  var hv = P.map(function(){ return 0; });
  function frame(){
    var w = stage.clientWidth, h = stage.clientHeight;
    if (w){
      cur += (tgt - cur) * .08;
      var D = w > 700,
          pw = D ? w * .30 : w * .62,
          ph = pw * 1.35,
          ox = D ? w * .25 : w * .36,
          oy = D ? h * .80 : h * .72,
          dx = D ? pw * .38 : pw * .28,
          dy = D ? -pw * .19 : -pw * .42,
          dz = -pw * .65,
          vv = tgt - cur, bl = Math.min(5, Math.abs(vv) * 5);

      P.forEach(function(p, i){
        var d = i - cur,
            op = d < 0 ? Math.max(0, 1 + d * 1.1) : Math.max(0, 1 - d * .11),
            active = hovered === i;

        p.style.width  = pw + 'px';
        p.style.height = ph + 'px';
        p.style.left   = (ox - pw / 2) + 'px';
        p.style.top    = (oy - ph / 2) + 'px';

        hv[i] += ((active ? 1 : 0) - hv[i]) * .14;
        var T = Math.max(4, Math.round(ph * .014));
        if (p._T !== T){ p._T = T; p.style.setProperty('--T', T + 'px'); }

        /* al pasar el cursor el plano sale hacia adelante, arriba y a la izquierda */
        p.style.transform = 'translate3d(' + (d * dx - hv[i] * pw * .08) + 'px,' +
                            (d * dy - hv[i] * pw * .06) + 'px,' +
                            (d * dz + hv[i] * pw * .75) + 'px) rotateY(-16deg)';
        /* al pasar el cursor: opacidad total y sin desenfoque */
        p.style.opacity = (op + (1 - op) * hv[i]).toFixed(3);
        var bb = (bl + Math.max(0, d) * .2) * (1 - hv[i]);
        p.style.filter  = bb > .05 ? 'blur(' + bb.toFixed(2) + 'px)' : 'none';
        p.style.zIndex  = String(Math.round(20 - Math.abs(d)) + (active ? 50 : 0));
        p.style.pointerEvents = op < .25 ? 'none' : 'auto';
        p.firstChild.textContent = Math.abs(d) < .5 ? PROJECTS[i].name : pad(i + 1);
      });
      ctr.textContent = pad(Math.round(cur) + 1) + ' / ' + pad(N);
    }
    requestAnimationFrame(frame);
  }
  frame();
})();
