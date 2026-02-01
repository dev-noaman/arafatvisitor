import * as dotenv from 'dotenv';

dotenv.config();

async function testWhatsApp() {
  const config = {
    endpoint: process.env.WHATSAPP_ENDPOINT,
    clientId: Number(process.env.WHATSAPP_CLIENT_ID),
    whatsappClient: Number(process.env.WHATSAPP_CLIENT),
    apiKey: process.env.WHATSAPP_API_KEY,
  };

  console.log('WhatsApp Configuration:');
  console.log('  Endpoint:', config.endpoint);
  console.log('  Client ID:', config.clientId);
  console.log('  WhatsApp Client:', config.whatsappClient);
  console.log('  API Key:', config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'NOT SET');
  console.log('');

  if (!config.endpoint || !config.clientId || !config.whatsappClient || !config.apiKey) {
    console.error('Missing WhatsApp configuration in .env');
    process.exit(1);
  }

  const testPhone = process.argv[2] || '97450707317'; // Default to Adel's number
  const testMessage = 'Test message from Arafat VMS - WhatsApp integration test';

  console.log(`Testing WhatsApp send to: ${testPhone}`);
  console.log(`Message: ${testMessage}`);
  console.log('');

  const url = `${config.endpoint.replace(/\/$/, '')}/send_msg/`;
  console.log(`POST ${url}`);

  // Parse phone number - extract country code
  let normalizedPhone = testPhone.replace(/\D/g, '').replace(/^0/, '');
  let countryCode = '974'; // Default to Qatar
  let phoneNumber = normalizedPhone;

  if (normalizedPhone.startsWith('974')) {
    countryCode = '974';
    phoneNumber = normalizedPhone.slice(3);
  }

  const payload = {
    client_id: config.clientId,
    api_key: config.apiKey,
    whatsapp_client: config.whatsappClient,
    msg_type: 0,
    msg: testMessage,
    phone: phoneNumber,
    country_code: countryCode,
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log('');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('Response Status:', res.status, res.statusText);
    console.log('Response Headers:', Object.fromEntries(res.headers.entries()));

    const text = await res.text();
    console.log('Response Body:', text);

    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch {
      console.log('(Response is not JSON)');
    }

    if (res.ok) {
      console.log('\nWhatsApp message sent successfully!');
    } else {
      console.log('\nWhatsApp send failed with status:', res.status);
    }
  } catch (err) {
    console.error('\nFetch error:', err);
  }
}

testWhatsApp();
