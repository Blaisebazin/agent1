const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const QRCode = require('qrcode');

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-moi';
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
const DATA_FILE = path.join(__dirname, 'data', 'status.json');

const DEFAULT_STATUS = {
  active: false,
  message: '',
  placeName: '',
  address: '',
  updatedAt: null,
};

async function readStatus() {
  try {
    const raw = await fsp.readFile(DATA_FILE, 'utf8');
    return { ...DEFAULT_STATUS, ...JSON.parse(raw) };
  } catch (err) {
    if (err.code === 'ENOENT') return { ...DEFAULT_STATUS };
    throw err;
  }
}

async function writeStatus(status) {
  await fsp.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fsp.writeFile(DATA_FILE, JSON.stringify(status, null, 2));
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function requireAdmin(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !timingSafeEqual(token, ADMIN_TOKEN)) {
    return res.status(401).json({ error: 'Jeton admin invalide.' });
  }
  next();
}

function publicUrlFor(req) {
  return PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
}

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', async (req, res) => {
  const status = await readStatus();
  res.json(status);
});

app.get('/api/verify-token', requireAdmin, (req, res) => {
  res.json({ ok: true });
});

app.post('/api/status', requireAdmin, async (req, res) => {
  const body = req.body || {};
  const message = String(body.message || '').trim().slice(0, 280);
  const placeName = String(body.placeName || '').trim().slice(0, 120);
  const address = String(body.address || '').trim().slice(0, 200);
  const active = Boolean(body.active);

  if (active && !message) {
    return res.status(400).json({ error: 'Le message ne peut pas etre vide.' });
  }

  const status = {
    active,
    message,
    placeName,
    address,
    updatedAt: new Date().toISOString(),
  };
  await writeStatus(status);
  res.json(status);
});

app.get('/api/qrcode.png', async (req, res) => {
  const size = Math.min(Math.max(parseInt(req.query.size, 10) || 800, 200), 2000);
  const target = publicUrlFor(req) + '/';
  try {
    const buffer = await QRCode.toBuffer(target, {
      type: 'png',
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Impossible de generer le QR code.' });
  }
});

app.get('/api/qrcode-target', (req, res) => {
  res.json({ url: publicUrlFor(req) + '/' });
});

app.listen(PORT, () => {
  console.log(`qr-location-app en ecoute sur http://localhost:${PORT}`);
  if (!PUBLIC_URL) {
    console.log("PUBLIC_URL n'est pas defini : le QR code encodera l'hote de la requete entrante.");
  }
  if (ADMIN_TOKEN === 'change-moi') {
    console.log('ATTENTION : ADMIN_TOKEN utilise la valeur par defaut, change-la avant de deployer.');
  }
});
