const card = document.getElementById('card');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "mis à jour à l'instant";
  if (minutes === 1) return 'mis à jour il y a 1 minute';
  if (minutes < 60) return `mis à jour il y a ${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return 'mis à jour il y a 1 heure';
  if (hours < 24) return `mis à jour il y a ${hours} heures`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'mis à jour il y a 1 jour' : `mis à jour il y a ${days} jours`;
}

function render(status) {
  if (!status.active || !status.message) {
    card.innerHTML = `
      <div class="status-empty">
        <div class="icon">🤷</div>
        <p>Pas d'information à afficher pour le moment.</p>
      </div>`;
    return;
  }

  const hasAddress = Boolean(status.address);
  const mapsUrl = hasAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(status.address)}`
    : '';

  card.innerHTML = `
    <p class="message">${escapeHtml(status.message)}</p>
    ${status.placeName ? `<p class="place">📍 ${escapeHtml(status.placeName)}</p>` : ''}
    ${hasAddress ? `<p class="address">${escapeHtml(status.address)}</p>` : ''}
    ${hasAddress ? `<a class="directions-btn" href="${mapsUrl}" target="_blank" rel="noopener">🧭 Itinéraire</a>` : ''}
    <p class="updated-at">${timeAgo(status.updatedAt)}</p>
  `;
}

async function load() {
  try {
    const res = await fetch('/api/status', { cache: 'no-store' });
    const status = await res.json();
    render(status);
  } catch (err) {
    card.innerHTML = `<p class="hint">Impossible de charger le statut. Nouvelle tentative…</p>`;
  }
}

load();
setInterval(load, 20000);
