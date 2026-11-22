(function(){
  /* texto vertical */
  document.getElementById('mq').textContent = 'DISEÑO DE OBJETOS, INTERACCIONES Y ESPACIOS — '.repeat(10);

  /* ANTO LOCH en partículas — misma lógica del prototipo (heroP) */
  var cv=document.getElementById('hero'), x=cv.getContext('2d'),
      W=0,H=0,pts=[],st=3,tt=0,FS=60,mx=-999,my=-999,
      dpr=Math.min(2,devicePixelRatio||1),
      FN='Helvetica Neue,Helvetica,Arial,sans-serif';

  function build(){
    W=innerWidth;H=innerHeight;var D=W>700;
    cv.width=W*dpr;cv.height=H*dpr;
    var o=document.createElement('canvas');o.width=W;o.height=H;var c=o.getContext('2d');
    c.font='700 100px '+FN;
    var fs=Math.min(100*(W*(D?.72:.84))/c.measureText('ANTO').width,H*.34);FS=fs;
    c.font='700 '+fs+'px '+FN;
    if('letterSpacing' in c)c.letterSpacing=(-fs*.04)+'px';
    c.textBaseline='middle';
    var LID=0;st=Math.max(2.4,W/230);pts=[];
    c.textAlign='left';
    [['ANTO',H*.36],['LOCH',H*.36+fs*.88]].forEach(function(ln){
      var ws=[],tot=0;
      for(var k=0;k<ln[0].length;k++){var w2=c.measureText(ln[0][k]).width;ws.push(w2);tot+=w2}
      var cxx=W/2-tot/2;
      for(var k=0;k<ln[0].length;k++){
        c.clearRect(0,0,W,H);c.fillText(ln[0][k],cxx,ln[1]);
        var dd=c.getImageData(0,0,W,H).data,id=LID++,x1=1e9,x2=-1e9,y1=1e9,y2=-1e9,arr=[];
        for(var yy=0;yy<H;yy+=st)for(var xx=0;xx<W;xx+=st){
          if(dd[((yy+st/2|0)*W+(xx+st/2|0))*4+3]>128){
            arr.push([xx,yy]);
            if(xx<x1)x1=xx;if(xx>x2)x2=xx;if(yy<y1)y1=yy;if(yy>y2)y2=yy;
          }
        }
        arr.forEach(function(a){
          pts.push({hx:a[0],hy:a[1],x:a[0],y:a[1],vx:0,vy:0,s:0,t:0,l:0,sh:Math.random()<.4,id:id,lx:(x1+x2)/2,ly:(y1+y2)/2});
        });
        cxx+=ws[k];
      }
    });
  }

  addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY});
  document.addEventListener('pointerleave',function(){mx=-999;my=-999});
  addEventListener('pointerup',function(e){if(e.pointerType==='touch'){mx=-999;my=-999}});
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,120)});

  function f(){
    x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);x.fillStyle='#111';
    var D=W>700,R=D?W*.07:W*.16,R2=R*R;tt+=.012;
    var AM=FS*.06,LF=[];
    for(var k=0;k<8;k++)LF.push({
      ox:Math.sin(tt*.8+k*1.7)*AM*.35,
      oy:Math.sin(tt*1.1+k*1.3)*AM+Math.sin(tt*.6+k*2.1)*AM*.5,
      a:Math.sin(tt*.7+k*1.1)*.035
    });
    for(var i=0;i<pts.length;i++){
      var p=pts[i],lf=LF[p.id],cs=Math.cos(lf.a),sn=Math.sin(lf.a),
          rx=p.hx-p.lx,ry=p.hy-p.ly,
          wx=p.lx+rx*cs-ry*sn+lf.ox,wy=p.ly+rx*sn+ry*cs+lf.oy;
      if(!p.s){
        var dx=wx-mx,dy=wy-my;
        if(dx*dx+dy*dy<R2){
          p.s=1;
          var a=Math.atan2(dy,dx)+(Math.random()-.5)*1.6,sp=1+Math.random()*3.5;
          p.vx=Math.cos(a)*sp;p.vy=Math.sin(a)*sp;p.t=0;p.l=70+Math.random()*110;p.x=wx;p.y=wy;
        }else{x.fillRect(wx,wy,st+.6,st+.6);continue}
      }
      p.t++;
      if(p.t<p.l){p.vx*=.97;p.vy*=.97;p.x+=p.vx;p.y+=p.vy}
      else{p.x+=(wx-p.x)*.1;p.y+=(wy-p.y)*.1;if(Math.abs(wx-p.x)<.6&&Math.abs(wy-p.y)<.6)p.s=0}
      x.fillRect(p.x,p.y,p.sh?st*2.6:st*.9,st*.8);
    }
    requestAnimationFrame(f);
  }

  var ready=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  ready.then(function(){build();f()});
})();
