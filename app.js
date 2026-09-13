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
async function sha256(s) { return hex(await crypto.subtle.digest('SHA-256', utf8(s))); }

async function factoryPassword(pdsn) {
  let mix = '';
  const max = Math.max(pdsn.length, SALT.length);
  for (let i = 0; i < max; i++) {
    if (i < pdsn.length) mix += pdsn[i];
    if (i < SALT.length) mix += SALT[i];
  }
  const h1 = await sha256(mix);
  const h2 = await sha256(h1);
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
    factoryOutput.textContent = await factoryPassword(pdsn);
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
