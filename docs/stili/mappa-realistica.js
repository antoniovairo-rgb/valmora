// Mappa aerea realistica procedurale (bozza per D-066). Canvas 2D, seme fisso, animata.
function rng(s){return()=>{s|=0;s=s+0x6d2b79f5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
window.mappaReale=(cv,{W=360,H=300,settori=[],corteo=true})=>{
const dpr=2;cv.width=W*dpr;cv.height=H*dpr;cv.style.width='100%';const g=cv.getContext('2d');g.scale(dpr,dpr);
const r=rng(7);const fondo=document.createElement('canvas');fondo.width=W*dpr;fondo.height=H*dpr;const f=fondo.getContext('2d');f.scale(dpr,dpr);
// asfalto con grana
f.fillStyle='#2a2d33';f.fillRect(0,0,W,H);
for(let i=0;i<9000;i++){f.fillStyle=`rgba(${r()<.5?255:0},${r()<.5?255:0},${r()<.5?255:0},${r()*.05})`;f.fillRect(r()*W,r()*H,1,1)}
// strade principali: due viali verso lo stadio
const viale=(pts,w,col)=>{f.strokeStyle=col;f.lineWidth=w;f.lineCap='round';f.beginPath();f.moveTo(...pts[0]);f.bezierCurveTo(...pts[1],...pts[2],...pts[3]);f.stroke()};
const vC=[[30,H+10],[60,230],[110,190],[150,160]],vL=[[330,H+10],[300,230],[250,190],[210,160]];
// isolati con tetti, ombre e cortili
const tetti=['#8f5a44','#a0664b','#7a4f3e','#9b9a95','#86847f','#6e6c69','#b07252'];
const isolati=[];for(let y=6;y<H;y+=46)for(let x=4;x<W;x+=58){const cx=x+28,cy=y+20;const dx=(cx-180)/112,dy=(cy-118)/72;if(dx*dx+dy*dy<1.35)continue;isolati.push([x,y])}
for(const[x,y]of isolati){f.fillStyle='#4a4b4f';f.fillRect(x,y,54,40);
 for(let k=0;k<5;k++){const bw=10+r()*20,bh=10+r()*16,bx=x+2+r()*(52-bw),by=y+2+r()*(38-bh);
  f.fillStyle='rgba(0,0,0,.45)';f.fillRect(bx+3,by+3,bw,bh);f.fillStyle=tetti[(r()*tetti.length)|0];f.fillRect(bx,by,bw,bh);
  f.fillStyle='rgba(255,255,255,.10)';f.fillRect(bx,by,bw,1.2);f.fillStyle='rgba(0,0,0,.18)';f.fillRect(bx+bw/2-.5,by,1,bh);
  if(r()<.5){f.fillStyle='#c9c6bd';f.fillRect(bx+2,by+2,3,2)}}
 if(r()<.6)for(let k=0;k<4;k++){const tx=x+r()*54,ty=y+r()*40,tr=2.5+r()*3;f.fillStyle='rgba(0,0,0,.4)';f.beginPath();f.arc(tx+2,ty+2,tr,0,7);f.fill();f.fillStyle=`hsl(${95+r()*30},${35+r()*20}%,${22+r()*12}%)`;f.beginPath();f.arc(tx,ty,tr,0,7);f.fill()}}
// auto parcheggiate
for(let i=0;i<40;i++){const x=r()*W,y=r()*H,dx=(x-180)/105,dy=(y-118)/66;if(dx*dx+dy*dy<1.2)continue;f.fillStyle=['#d8d4cc','#2b4d8c','#a02c2c','#e2b33c','#1c1c1c'][(r()*5)|0];f.fillRect(x,y,6,3)}
for(const v of[vC,vL]){viale(v,34,'rgba(0,0,0,.45)');viale(v,30,'#b9b4a8');viale(v,24,'#33363c');f.setLineDash([6,8]);viale(v,1.2,'rgba(255,255,255,.6)');f.setLineDash([])}
// piazzale
f.fillStyle='#5b5a56';f.beginPath();f.ellipse(180,128,128,86,0,0,7);f.fill();
for(let i=0;i<14;i++){const a=i/14*Math.PI*2;f.fillStyle='rgba(0,0,0,.35)';f.beginPath();f.arc(180+Math.cos(a)*122+2,128+Math.sin(a)*80+2,4,0,7);f.fill();f.fillStyle='#355b2e';f.beginPath();f.arc(180+Math.cos(a)*122,128+Math.sin(a)*80,4,0,7);f.fill()}
// stadio: ombra, gradinate a settori di colore, tribune, tetto
f.fillStyle='rgba(0,0,0,.55)';f.beginPath();f.ellipse(186,126,104,66,0,0,7);f.fill();
const anelli=14;for(let k=0;k<anelli;k++){const t=k/anelli;f.beginPath();f.ellipse(180,118,100-t*24,62-t*15,0,0,7);f.fillStyle=k%2?'#3b3f48':'#444955';f.fill()}
// colori delle curve (sciarpe): Cinderwick arancio a sinistra, Larkspire azzurro a destra
const curva=(a0,a1,col)=>{for(let k=0;k<12;k++){f.beginPath();f.ellipse(180,118,98-k*2,60-k*1.3,0,a0,a1);f.strokeStyle=col;f.globalAlpha=.25+.04*k;f.lineWidth=1.6;f.stroke()}f.globalAlpha=1};
curva(Math.PI*.72,Math.PI*1.28,'#ff7a1a');curva(-Math.PI*.28,Math.PI*.28,'#2fa7ff');
// prato a strisce
f.save();f.beginPath();f.rect(136,92,88,52);f.clip();for(let i=0;i<10;i++){f.fillStyle=i%2?'#2f8f3c':'#38a046';f.fillRect(136+i*8.8,92,8.8,52)}f.restore();
f.strokeStyle='rgba(255,255,255,.85)';f.lineWidth=.8;f.strokeRect(138,94,84,48);f.beginPath();f.moveTo(180,94);f.lineTo(180,142);f.stroke();f.beginPath();f.arc(180,118,7,0,7);f.stroke();f.strokeRect(138,108,10,20);f.strokeRect(212,108,10,20);
// tetto traslucido
f.strokeStyle='rgba(235,240,245,.55)';f.lineWidth=6;f.beginPath();f.ellipse(180,118,101,63,0,0,7);f.stroke();
// fari
const fari=[[88,62],[272,62],[88,174],[272,174]];
const folla=[];for(let i=0;i<1400;i++){const a=r()*Math.PI*2,k=r();const rx=98-k*22,ry=60-k*14;const x=180+Math.cos(a)*rx,y=118+Math.sin(a)*ry;const sin=Math.cos(a);folla.push([x,y,sin<-.55?'#ff8a2a':sin>.55?'#45b4ff':['#e9e4da','#c9c2b4','#9a958c'][(r()*3)|0],r()*6.28])}
const marcia=[];for(let i=0;i<70;i++)marcia.push([r(),(r()-.5)*8,r()*6.28]);
const bez=(p,t)=>{const u=1-t;return[0,1].map(i=>u*u*u*p[0][i]+3*u*u*t*p[1][i]+3*u*t*t*p[2][i]+t*t*t*p[3][i])};
let t0=performance.now();
function frame(now){const t=(now-t0)/1000;g.drawImage(fondo,0,0,W,H);
 // folla che ondeggia
 for(const[x,y,c,ph]of folla){g.fillStyle=c;g.globalAlpha=.75+.25*Math.sin(t*3+ph);g.fillRect(x,y,1.3,1.3)}g.globalAlpha=1;
 // corteo che avanza sul viale di Cinderwick
 if(corteo)for(const[u,off,ph]of marcia){const s=((u+t*.025)%1)*.75;const[x,y]=bez(vC,s);g.fillStyle=Math.sin(ph+t*4)>0?'#ff7a1a':'#f3eee4';g.fillRect(x+off,y+off*.4,2.2,2.2)}
 // luce dei fari
 for(const[x,y]of fari){const gr=g.createRadialGradient(x,y,0,x,y,80);gr.addColorStop(0,'rgba(255,248,220,.55)');gr.addColorStop(1,'rgba(255,248,220,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,80,0,7);g.fill();g.fillStyle='#fffbe6';g.beginPath();g.arc(x,y,2.2,0,7);g.fill()}
 // velo serale
 const v=g.createLinearGradient(0,0,0,H);v.addColorStop(0,'rgba(20,10,60,.28)');v.addColorStop(1,'rgba(255,90,40,.10)');g.fillStyle=v;g.fillRect(0,0,W,H);
 // settori: alone di tensione + segnalino fumetto
 for(const s of settori){const x=Math.min(332,Math.max(28,s.x/100*W)),y=s.y/100*H;const col=s.t<.3?'#2fe07a':s.t<.6?'#ffd400':'#ff1f6b';
  const p=1+.15*Math.sin(t*4);const gr=g.createRadialGradient(x,y,0,x,y,34*p);gr.addColorStop(0,col+'aa');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.beginPath();g.arc(x,y,34*p,0,7);g.fill();
  if(s.attiva){g.strokeStyle='#ffd400';g.lineWidth=3;g.globalAlpha=1-(t%1.2)/1.2;g.beginPath();g.arc(x,y,12+(t%1.2)/1.2*26,0,7);g.stroke();g.globalAlpha=1}
  g.fillStyle='#111';g.beginPath();g.arc(x+2,y+2,10,0,7);g.fill();g.fillStyle=col;g.beginPath();g.arc(x,y,10,0,7);g.fill();g.lineWidth=2.5;g.strokeStyle='#111';g.stroke()}
 requestAnimationFrame(frame)}
requestAnimationFrame(frame)};
