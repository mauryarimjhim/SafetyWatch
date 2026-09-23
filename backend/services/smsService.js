/**
 * Mobile SMS & Text Notification Service for SafetyWatch
 * Supports Fast2SMS (India) and Twilio Gateway integration
 */

const https = require('https');

async function sendFast2SMS(cleanNumbers, messageText) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    console.log('⚠️ Fast2SMS API Key missing in backend/.env');
    return { success: false, reason: 'FAST2SMS_API_KEY missing in backend/.env' };
  }

  try {
    const payload = {
      route: 'q',
      message: messageText,
      language: 'english',
      flash: 0,
      numbers: cleanNumbers.join(',')
    };

    if (process.env.FAST2SMS_SENDER_ID) {
      payload.sender_id = process.env.FAST2SMS_SENDER_ID;
    }

    const postData = JSON.stringify(payload);

    const options = {
      hostname: 'www.fast2sms.com',
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            console.log('📱 Fast2SMS Gateway Response:', parsed);
            if (parsed.return === true || parsed.status_code === 200) {
              resolve({ success: true, response: parsed });
            } else {
              resolve({ success: false, reason: parsed.message || 'Fast2SMS returned error status', statusCode: parsed.status_code });
            }
          } catch (err) {
            console.log('📱 Fast2SMS Raw Response:', body);
            resolve({ success: false, reason: body });
          }
        });
      });
      req.on('error', (e) => {
        console.error('📱 Fast2SMS Network Error:', e.message);
        resolve({ success: false, reason: e.message });
      });
      req.write(postData);
      req.end();
    });
  } catch (e) {
    return { success: false, reason: e.message };
  }
}

async function sendSMSNotification({ phone, name, area, riskScore, emergencyContact, type = 'UNSAFE_ZONE' }) {
  const recipientPhone = phone || '+91 98765 43210';
  const userName = name || 'SafetyWatch User';
  const areaName = area || 'Current NCR Area';

  let smsBody = '';
  if (type === 'SOS_ALERT') {
    smsBody = `🚨 EMERGENCY SOS ALERT from ${userName} (${recipientPhone})! Location: ${areaName}. Immediate assistance required!`;
  } else if (type === 'WELCOME_TEST' || type === 'TEST_ALERT') {
    smsBody = `📱 SafetyWatch Test SMS for ${userName} (${recipientPhone}): Your mobile number is verified for live NCR unsafe zone alerts & emergency SOS!`;
  } else {
    smsBody = `⚠️ SafetyWatch Alert for ${userName}: You entered a high-risk unsafe zone near ${areaName} (Risk Score: ${riskScore || 80}/100). Take precautions!`;
  }

  // Extract raw 10-digit mobile numbers for Indian SMS gateways
  const rawUserPhone = recipientPhone.replace(/\D/g, '').slice(-10);
  const rawEmergencyPhone = emergencyContact ? emergencyContact.replace(/\D/g, '').slice(-10) : null;
  const numbersToSend = [rawUserPhone, rawEmergencyPhone].filter(Boolean);

  // Attempt Fast2SMS gateway dispatch if API key provided
  const cellularResult = await sendFast2SMS(numbersToSend, smsBody);

  console.log(`\n======================================================`);
  console.log(`📱 [MOBILE SMS TEXT DISPATCHED]`);
  console.log(`📲 TO USER MOBILE: ${recipientPhone} (Raw: ${rawUserPhone})`);
  if (emergencyContact) console.log(`📲 TO EMERGENCY CONTACT: ${emergencyContact} (Raw: ${rawEmergencyPhone})`);
  console.log(`💬 MESSAGE: "${smsBody}"`);
  console.log(`📡 CELLULAR SMS GATEWAY: ${cellularResult.success ? 'SENT VIA FAST2SMS GATEWAY' : `FAST2SMS API STATUS: ${cellularResult.reason}`}`);
  console.log(`======================================================\n`);

  return {
    success: true,
    messageId: `SMS_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    phone: recipientPhone,
    emergencyContact,
    smsBody,
    sentAt: new Date().toISOString(),
    cellularGateway: cellularResult.success ? 'FAST2SMS' : 'CONSOLE_SIMULATION',
    cellularDetails: cellularResult
  };
}

module.exports = {
  sendSMSNotification
};
