// CORE-START — Tonprüfung über das Spektrum (wird in index.html eingebettet)
const noteFreq=m=>440*Math.pow(2,(m-69)/12);
const SEMI=Math.pow(2,1/12);
function peakAt(mag,binHz,f){
  const nb=mag.length,b=f/binHz,b0=Math.max(1,Math.floor(b*0.988)),b1=Math.min(nb-1,Math.ceil(b*1.012));
  let m=0;for(let i=b0;i<=b1;i++)if(mag[i]>m)m=mag[i];return m;
}
// Wie deutlich ragt bei Frequenz f ein Ton heraus (verglichen mit einem Halbton darüber/darunter)?
function toneRatio(mag,binHz,f){
  const d=Math.max(f*(SEMI-1),4.5*binHz); // Abstand mind. so groß wie das Fenster breit ist
  return peakAt(mag,binHz,f)/(Math.max(peakAt(mag,binHz,f-d),peakAt(mag,binHz,f+d))+1e-9);
}
function sharedWith(fh,others){
  return others.some(p=>{const fp=noteFreq(p),k=Math.round(fh/fp);return k>=1&&Math.abs(fh-k*fp)<0.012*fh});
}
// Klingt Ton e? `others` = andere Töne, die gerade gleichzeitig erwartet werden.
// Erwartete Stärke an Frequenz fh, die von anderen (gleichzeitig erwarteten) Tönen stammt
function sharedLevel(fh,others,mag,binHz){
  let lv=-1;
  for(const p of others){const fp=noteFreq(p),k=Math.round(fh/fp);
    if(k>=1&&Math.abs(fh-k*fp)<0.012*fh){
      const b=peakAt(mag,binHz,fp*(k+1));
      const est=k>1?Math.min(peakAt(mag,binHz,fp*(k-1)),b):b;
      lv=Math.max(lv,est)}}
  return lv; // -1 = nicht geteilt
}
function hasNote(e,others,mag,binHz,floor){
  const f0=noteFreq(e),H=[];let considered=0,passes=0;
  for(let h=1;h<=6;h++){
    const fh=f0*h;if(fh>5000)break;
    const pk=peakAt(mag,binHz,fh),sl=sharedLevel(fh,others,mag,binHz);
    let ok;
    if(sl<0){ok=pk>floor&&toneRatio(mag,binHz,fh)>=2.5;considered++;if(ok)passes++}
    else{ok=pk>floor&&pk>2*sl;if(ok)passes++}
    H[h]=ok;
  }
  // Grundton muss belegt sein (tiefe Töne: 3. Oberton reicht, dazu der 2.)
  const fundOK=e>=48?H[1]:((H[1]||H[3])&&(H[2]||H[1]));
  if(!fundOK||passes<Math.max(1,Math.ceil(0.5*considered)))return false;
  // Eine Oktave tiefer gespielt? Dann gäbe es Töne bei f/2 und 1,5·f
  if(!others.some(p=>p===e-12)){
    const half=f0/2,onehalf=f0*1.5;
    const sub=x=>peakAt(mag,binHz,x)>floor&&toneRatio(mag,binHz,x)>=2.5&&sharedLevel(x,others,mag,binHz)<0;
    if(sub(onehalf)&&(half<55||sub(half)))return false;
  }
  return true;
}
// Stärkster einzelner Ton (für die Anzeige)
function strongestNote(mag,binHz,floor){
  let bestN=-1,bestV=0;
  for(let n=36;n<=96;n++){
    const f0=noteFreq(n);let v=0,ok=0;
    for(let h=1;h<=4;h++){const fh=f0*h;const pk=peakAt(mag,binHz,fh);
      if(toneRatio(mag,binHz,fh)>=2.5&&pk>floor){v+=pk;if(h%2)ok++}}
    if(ok&&v>bestV){bestV=v;bestN=n}
  }
  // tiefste Oktave wählen, die noch selbst (ungerade Obertöne) belegt ist
  return bestN;
}
// CORE-END
if(typeof module!=='undefined')module.exports={hasNote,strongestNote,noteFreq};
