require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const QRCode = require('qrcode');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const API_KEY_SID = process.env.API_KEY_SID;
const API_KEY_SECRET = process.env.API_KEY_SECRET;

const PUBLIC_URL = 'https://adiona.xyz';
// const PUBLIC_URL = 'http://af4af458ff8b.ngrok.io';

app.use(cors());

const wsServer = new WebSocket.Server({ host: '0.0.0.0', port: 5001, clientTracking: true });
wsServer.on('connection', socket => {
  socket.on('message', message => {
    switch (message) {
      case 'maskNone':
        io.emit('maskState', 'none');
        break;
      case 'maskDown':
        io.emit('maskState', 'down');
        break;
      case 'maskOK':
        io.emit('maskState', 'ok');
        break;
      case 'noFaceDetected':
        io.emit('maskState', 'noFace');
        break;
      case 'NFC CARD DETECTED':
        io.emit('scanned');
        break;
      default:
        break;
    }

    console.log(message);
  });
});

function wsBroadcast(message) {
  console.log(`ws broadcast: ${message}`);
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('dispenseMask', () => {
    wsBroadcast('dispenseMask');
  });
  socket.on('openGate', () => {
    wsBroadcast('openGate');
  });
  socket.on('sanitise', () => {
    wsBroadcast('sanitise');
  });
  socket.on('advance', () => {
    io.emit('advance');
  });
});

let counter = 1;
let code;
async function genNewQRCode() {
  code = await QRCode.toString(`${PUBLIC_URL}/q/${counter}`, { type: 'svg' });
  counter++;
  return code;
}
genNewQRCode();

app.get('/api/code', async (req, res) => {
  // res.send(`<img src="${await genNewQRCode()}"/>`);
  // res.send(await genNewQRCode());
  res.send(code);
});

app.get('/q/:code', async (req, res) => {
  console.log('scanned code');
  io.emit('scanned');
  res.redirect('/thankyou');
});

app.get('/api/twilio_token', async (req, res) => {
  const accessToken = new AccessToken(
    ACCOUNT_SID,
    API_KEY_SID,
    API_KEY_SECRET
  );
  accessToken.identity = Math.random().toString();
  var grant = new VideoGrant();
  grant.room = 'adiona-feed';
  accessToken.addGrant(grant);

  const jwt = accessToken.toJwt();
  res.send(jwt);
});

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

http.listen({ host: '0.0.0.0', port: 5000 }, () => console.log('Server started'));

