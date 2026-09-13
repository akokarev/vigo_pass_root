'use strict';

const SALT = 'E13S31NMP5DfCs24';
const MASTER = 'DfCs0715#!';

const pdsnInput = document.querySelector('#pdsn');
const radioSnInput = document.querySelector('#radioSn');
const results = document.querySelector('#results');
const error = document.querySelector('#error');
const factoryOutput = document.querySelector('#factory');
const suOutput = document.querySelector('#su');

function utf8(s) { return new TextEncoder().encode(s); }
function hex(bytes) { return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join(''); }
function rotr(x,n){return (x>>>n)|(x<<(32-n));}
function sha256(s){
  const bytes=new TextEncoder().encode(s), K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  let b=Array.from(bytes), bit=b.length*8; b.push(128); while(b.length%64!==56)b.push(0); for(let i=7;i>=0;i--)b.push((bit/2**(i*8))&255);
  let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  for(let o=0;o<b.length;o+=64){let w=new Array(64); for(let i=0;i<16;i++)w[i]=((b[o+4*i]<<24)|(b[o+4*i+1]<<16)|(b[o+4*i+2]<<8)|b[o+4*i+3])>>>0; for(let i=16;i<64;i++){let x=w[i-15],y=w[i-2],a=(rotr(x,7)^rotr(x,18)^(x>>>3))>>>0,c=(rotr(y,17)^rotr(y,19)^(y>>>10))>>>0; w[i]=(w[i-16]+a+w[i-7]+c)>>>0;} let [a,bb,c,d,e,f,g,h]=H; for(let i=0;i<64;i++){let S1=(rotr(e,6)^rotr(e,11)^rotr(e,25))>>>0,ch=((e&f)^(~e&g))>>>0,t1=(h+S1+ch+K[i]+w[i])>>>0,S0=(rotr(a,2)^rotr(a,13)^rotr(a,22))>>>0,maj=((a&bb)^(a&c)^(bb&c))>>>0,t2=(S0+maj)>>>0; h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=bb;bb=a;a=(t1+t2)>>>0;} H=H.map((v,i)=> (v+[a,bb,c,d,e,f,g,h][i])>>>0);}
  return H.map(x=>x.toString(16).padStart(8,'0')).join('');
}

function factoryPassword(pdsn) {
  let mix = '';
  const max = Math.max(pdsn.length, SALT.length);
  for (let i = 0; i < max; i++) {
    if (i < pdsn.length) mix += pdsn[i];
    if (i < SALT.length) mix += SALT[i];
  }
  const h1 = sha256(mix);
  const h2 = sha256(h1);
  return 'DfCs' + h2.substring(0, 8) + '#!';
}

function clearError() {
  error.hidden = true;
  error.textContent = '';
}

function showError(message) {
  error.textContent = message;
  error.hidden = false;
}

async function calculateFromPdsn() {
  clearError();
  const pdsn = pdsnInput.value.trim();

  if (!pdsn) {
    results.hidden = true;
    return;
  }

  try {
    factoryOutput.textContent = factoryPassword(pdsn);
    document.querySelector('#master').textContent = MASTER;
    results.hidden = false;
    calculateSu();
  } catch (e) {
    results.hidden = true;
    showError('Не удалось выполнить расчёт в браузере.');
    console.error(e);
  }
}

function calculateSu() {
  const sn = radioSnInput.value.trim();
  if (!sn) {
    suOutput.textContent = '—';
    return;
  }

  if (sn.length < 4) {
    suOutput.textContent = '—';
    return;
  }

  clearError();
  suOutput.textContent = 'DfCs' + sn.slice(-4) + '#!';
}

let pdsnTimer;
pdsnInput.addEventListener('input', () => {
  clearTimeout(pdsnTimer);
  pdsnTimer = setTimeout(calculateFromPdsn, 100);
});

radioSnInput.addEventListener('input', calculateSu);

for (const button of document.querySelectorAll('.copy')) {
  button.addEventListener('click', async () => {
    const value = document.querySelector('#' + button.dataset.copy).textContent;
    if (!value || value === '—') return;

    try {
      await navigator.clipboard.writeText(value);
      const old = button.textContent;
      button.textContent = 'Скопировано';
      setTimeout(() => button.textContent = old, 900);
    } catch {
      showError('Не удалось скопировать. Выделите пароль и скопируйте его вручную.');
    }
  });
}
