/* =====================================================
   ABOUT — píxeles negros que se difuminan desde los bordes hacia el centro.
   Al pasar el cursor (o el dedo), los píxeles cercanos se deshacen una sola vez, como las
   letras del Home, y después vuelven suavemente a su lugar. Es un efecto sutil: la zona es
   chica y el movimiento es corto, para que se destaque la información de la página.
   Cambia los números de CONFIG para ajustar el efecto.
   ===================================================== */
(function(){
  var CONFIG = {
    pixel:    [6, 8],        /* tamaño del píxel en px: [celular, computador] */
    densidad: 1,             /* 1 = normal, .5 = la mitad de píxeles, 1.5 = más */
    opacidad: .30,           /* qué tan oscuros se ven (0 a 1) */
    radio:    [40, 60],      /* zona que se deshace alrededor del cursor: [celular, computador] */
    fuerza:   1,             /* qué tan lejos salen los píxeles (.5 = muy poco, 2 = mucho) */
    brillo:   1              /* velocidad del parpadeo suave (0 = sin parpadeo) */
  };

  var cv = document.getElementById('rain');
  if (!cv) return;
  var x = cv.getContext('2d'),
      dpr = Math.min(2, devicePixelRatio || 1),
      reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
      W = 0, H = 0, S = 8, R = 85, N = 0, t = 0,
      mx = -9999, my = -9999,
      HX, HY, PX, PY, VX, VY, AL, PH, SP, ST, TT, LF, ARM, SH;

  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }

  function build(){
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    var D = W > 700;
    S = D ? CONFIG.pixel[1] : CONFIG.pixel[0];
    R = D ? CONFIG.radio[1] : CONFIG.radio[0];

    var cols = Math.ceil(W / S), rows = Math.ceil(H / S), list = [];
    for (var j = 0; j < rows; j++){
      for (var i = 0; i < cols; i++){
        var nx = ((i + .5) / cols - .5) * 2, ny = ((j + .5) / rows - .5) * 2;
        /* más píxeles hacia los bordes, casi ninguno en el centro donde está el contenido */
        var e = Math.pow(Math.abs(nx), 2) * 1.2 + Math.pow(Math.abs(ny), 2) * .5;
        var dn = Math.pow(clamp((e - .45) / .75, 0, 1), 1.2);
        if (Math.random() < dn * .62 * CONFIG.densidad) list.push([i * S, j * S, dn]);
      }
    }
    N = list.length;
    HX = new Float32Array(N); HY = new Float32Array(N);
    PX = new Float32Array(N); PY = new Float32Array(N);
    VX = new Float32Array(N); VY = new Float32Array(N);
    AL = new Float32Array(N); PH = new Float32Array(N); SP = new Float32Array(N);
    TT = new Float32Array(N); LF = new Float32Array(N);
    ST = new Uint8Array(N);  ARM = new Uint8Array(N); SH = new Uint8Array(N);
    for (var k = 0; k < N; k++){
      HX[k] = PX[k] = list[k][0]; HY[k] = PY[k] = list[k][1];
      AL[k] = (.25 + Math.random() * .75) * (.4 + .6 * list[k][2]) * CONFIG.opacidad;
      PH[k] = Math.random() * 6.283; SP[k] = .5 + Math.random() * 1.3;
      ARM[k] = 1; SH[k] = Math.random() < .4 ? 1 : 0;
    }
  }

  function draw(animate){
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, W, H);
    x.fillStyle = '#000';
    var R2 = R * R, sz = S - 1;
    for (var k = 0; k < N; k++){
      var a = AL[k], w = sz, h = sz;
      if (animate){
        var dx = HX[k] - mx, dy = HY[k] - my, d2 = dx * dx + dy * dy;
        if (d2 >= R2) ARM[k] = 1;                       /* cuando el cursor se aleja, el píxel queda listo otra vez */

        if (ST[k] === 0){
          if (d2 < R2 && ARM[k]){                       /* el cursor lo toca: se deshace UNA vez */
            ARM[k] = 0; ST[k] = 1; TT[k] = 0; LF[k] = 45 + Math.random() * 70;
            var ang = Math.atan2(dy, dx) + (Math.random() - .5) * 1.4,
                sp = (.5 + Math.random() * 1.3) * CONFIG.fuerza;
            VX[k] = Math.cos(ang) * sp; VY[k] = Math.sin(ang) * sp;
          }
        } else if (ST[k] === 1){                        /* sale flotando y frena */
          TT[k]++;
          VX[k] *= .96; VY[k] *= .96;
          PX[k] += VX[k]; PY[k] += VY[k];
          if (TT[k] >= LF[k]) ST[k] = 2;
        } else {                                        /* vuelve suave a su lugar, sin rebotar */
          PX[k] += (HX[k] - PX[k]) * .09;
          PY[k] += (HY[k] - PY[k]) * .09;
          if (Math.abs(HX[k] - PX[k]) < .4 && Math.abs(HY[k] - PY[k]) < .4){
            PX[k] = HX[k]; PY[k] = HY[k]; ST[k] = 0;
          }
        }
        if (CONFIG.brillo) a *= .7 + .3 * Math.sin(t * SP[k] * CONFIG.brillo + PH[k]);
        if (ST[k] !== 0){
          a = Math.min(1, a + .15);                     /* mientras se deshace, se ve un poco más oscuro */
          if (SH[k]){ w = sz * 2; h = sz * .8; }        /* algunos se estiran, como en el Home */
        }
      }
      x.globalAlpha = a;
      x.fillRect(PX[k], PY[k], w, h);
    }
    x.globalAlpha = 1;
  }

  function loop(){ t += .016; draw(true); requestAnimationFrame(loop); }

  build();
  if (reduce) draw(false);       /* si la persona pidió menos movimiento, queda una imagen fija */
  else loop();

  addEventListener('pointermove', function(e){ mx = e.clientX; my = e.clientY; });
  addEventListener('pointerdown', function(e){ mx = e.clientX; my = e.clientY; });
  addEventListener('pointerup', function(e){ if (e.pointerType === 'touch'){ mx = my = -9999; } });
  document.addEventListener('pointerleave', function(){ mx = my = -9999; });

  var rt;
  addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ build(); if (reduce) draw(false); }, 150);
  });
})();