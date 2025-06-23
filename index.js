const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

// Mostrar QR en consola
client.on('qr', qr => {
  console.log('📷 Escanea este QR:');
  qrcode.generate(qr, { small: true });
});

// Confirmar conexión
client.on('ready', () => {
  console.log('✅ Conectado a WhatsApp!');
});

// Escuchar mensajes
client.on('message', async msg => {
  const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
  const numerosPermitidos = config.numerosPermitidos;
  const gruposPermitidos = config.gruposPermitidos;
  const privadosPermitidos = config.privadosPermitidos || [];

  const chat = await msg.getChat();
  const contact = await msg.getContact();
  const nombre = contact.pushname || "SinPushname";
  const numero = contact.number;

  // This log should always run
  console.log(`📨 Mensaje de ${nombre} en ${chat.name || "Privado"}: ${msg.body}`);
  console.log("🆔 ID del chat:", chat.id._serialized);

  // Check permissions
  const isAllowedGroup = gruposPermitidos.includes(chat.id._serialized);
  const isAllowedNumber = numerosPermitidos.includes(numero);
  const isAllowedPrivate = privadosPermitidos.includes(chat.id._serialized);

  if (
    (chat.isGroup && isAllowedGroup && isAllowedNumber) ||
    (!chat.isGroup && isAllowedNumber && isAllowedPrivate)
  ) {
    chat.sendMessage("L");
    console.log(`✅ Respuesta enviada con "L" en el chat con ID "${chat.id._serialized}" por ${nombre}`);
  }
});

client.initialize();