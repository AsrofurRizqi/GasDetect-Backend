const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendMessage = async (to, body) => {
    try {
      to = to.replace(/^0/,'+62');
      const message = await client.messages.create({
        body: body,
        to: 'whatsapp:' + to, 
        from: 'whatsapp:' + twilioPhoneNumber
      });
      return message;
    } catch (error) {
      throw error;
    }
  };
  
  module.exports = { sendMessage };