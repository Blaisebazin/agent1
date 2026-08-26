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
const durationInput = document.getElementById('duration');
const favoritesList = document.getElementById('favorites-list');
const saveFavoriteBtn = document.getElementById('save-favorite-btn');
const shareBtn = document.getElementById('share-btn');
const qrImg = document.getElementById('qr-img');
const qrDownload = document.getElementById('qr-download');
const qrTargetHint = document.getElementById('qr-target-hint');

let currentPublicUrl = '';

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
        durationMinutes: Number(durationInput.value),
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
    await Promise.all([loadCurrentStatus(), loadFavorites()]);
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
      currentPublicUrl = d.url;
      qrTargetHint.textContent = `Pointe vers : ${d.url}`;
    })
    .catch(() => {});
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderFavorites(favorites) {
  favoritesList.innerHTML = favorites
    .map(
      (f) => `
      <span class="favorite-chip" data-id="${f.id}" data-name="${escapeHtml(f.name)}" data-address="${escapeHtml(f.address)}">
        ${escapeHtml(f.name)}
        <button type="button" class="remove" data-id="${f.id}" aria-label="Supprimer">×</button>
      </span>`
    )
    .join('');
}

async function loadFavorites() {
  try {
    const res = await fetch('/api/favorites', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) return;
    renderFavorites(await res.json());
  } catch (err) {
    // Liste vide si la requête échoue, l'utilisateur peut réessayer.
  }
}

async function saveFavorite() {
  const name = placeNameInput.value.trim();
  const address = addressInput.value.trim();
  if (!name || !address) {
    setMsg(publishMsg, 'Renseigne un nom de lieu et une adresse avant de les enregistrer.', 'err');
    return;
  }

  const res = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ name, address }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    setMsg(publishMsg, body.error || "Impossible d'enregistrer ce favori.", 'err');
    return;
  }

  await loadFavorites();
}

async function deleteFavorite(id) {
  await fetch(`/api/favorites/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  await loadFavorites();
}

async function shareLink() {
  if (!currentPublicUrl) return;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Où je suis',
        text: messageInput.value || 'Où je suis en ce moment',
        url: currentPublicUrl,
      });
    } catch (err) {
      // L'utilisateur a annulé le partage, rien à faire.
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(currentPublicUrl);
    setMsg(publishMsg, 'Lien copié dans le presse-papier ✅', 'ok');
  } catch (err) {
    setMsg(publishMsg, currentPublicUrl, '');
  }
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
saveFavoriteBtn.addEventListener('click', saveFavorite);
shareBtn.addEventListener('click', shareLink);
favoritesList.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.remove');
  if (removeBtn) {
    deleteFavorite(removeBtn.dataset.id);
    return;
  }
  const chip = e.target.closest('.favorite-chip');
  if (chip) {
    placeNameInput.value = chip.dataset.name;
    addressInput.value = chip.dataset.address;
  }
});

setupQr();
if (getToken()) {
  showLoggedIn();
  loadCurrentStatus();
  loadFavorites();
} else {
  showLoggedOut();
}
