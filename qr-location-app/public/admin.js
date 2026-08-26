const TOKEN_KEY = 'qr-location-admin-token';

const loginCard = document.getElementById('login-card');
const adminCard = document.getElementById('admin-card');
const tokenInput = document.getElementById('token');
const loginBtn = document.getElementById('login-btn');
const loginMsg = document.getElementById('login-msg');
const logoutBtn = document.getElementById('logout-btn');
const publishBtn = document.getElementById('publish-btn');
const publishMsg = document.getElementById('publish-msg');
const activeInput = document.getElementById('active');
const messageInput = document.getElementById('message');
const placeNameInput = document.getElementById('placeName');
const addressInput = document.getElementById('address');
const qrImg = document.getElementById('qr-img');
const qrDownload = document.getElementById('qr-download');
const qrTargetHint = document.getElementById('qr-target-hint');

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setMsg(el, text, kind) {
  el.textContent = text;
  el.className = 'msg' + (kind ? ' ' + kind : '');
}

function showLoggedOut() {
  loginCard.hidden = false;
  adminCard.hidden = true;
}

function showLoggedIn() {
  loginCard.hidden = true;
  adminCard.hidden = false;
}

async function loadCurrentStatus() {
  try {
    const res = await fetch('/api/status', { cache: 'no-store' });
    const status = await res.json();
    activeInput.checked = Boolean(status.active);
    messageInput.value = status.message || '';
    placeNameInput.value = status.placeName || '';
    addressInput.value = status.address || '';
  } catch (err) {
    // Formulaire vide si le statut n'a jamais été publié.
  }
}

async function publish() {
  const token = getToken();
  publishBtn.disabled = true;
  setMsg(publishMsg, 'Publication…', '');

  try {
    const res = await fetch('/api/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        active: activeInput.checked,
        message: messageInput.value,
        placeName: placeNameInput.value,
        address: addressInput.value,
      }),
    });

    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      showLoggedOut();
      setMsg(loginMsg, 'Code incorrect, réessaie.', 'err');
      return;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMsg(publishMsg, body.error || 'Erreur lors de la publication.', 'err');
      return;
    }

    setMsg(publishMsg, 'Publié ✅', 'ok');
  } catch (err) {
    setMsg(publishMsg, 'Erreur réseau, réessaie.', 'err');
  } finally {
    publishBtn.disabled = false;
  }
}

async function tryLogin() {
  const token = tokenInput.value.trim();
  if (!token) return;

  setMsg(loginMsg, 'Vérification…', '');
  try {
    const res = await fetch('/api/verify-token', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setMsg(loginMsg, 'Code incorrect.', 'err');
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    setMsg(loginMsg, '', '');
    showLoggedIn();
    await loadCurrentStatus();
  } catch (err) {
    setMsg(loginMsg, 'Erreur réseau, réessaie.', 'err');
  }
}

function setupQr() {
  const src = `/api/qrcode.png?size=800&_=${Date.now()}`;
  qrImg.src = src;
  qrDownload.href = src;
  fetch('/api/qrcode-target')
    .then((r) => r.json())
    .then((d) => {
      qrTargetHint.textContent = `Pointe vers : ${d.url}`;
    })
    .catch(() => {});
}

loginBtn.addEventListener('click', tryLogin);
tokenInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') tryLogin();
});
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(TOKEN_KEY);
  showLoggedOut();
});
publishBtn.addEventListener('click', publish);

setupQr();
if (getToken()) {
  showLoggedIn();
  loadCurrentStatus();
} else {
  showLoggedOut();
}
