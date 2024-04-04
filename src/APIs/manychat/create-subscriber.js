const axios = require('axios');

/**
 * If a WhatsApp phone is passed, only WhatsApp subscriber will be created
 */
function createManyChatSubscriber(whatsapp_phone, firstName='', lastName='', email='', gender='', hasOptInSms='', hasOptInEmail='', consentPhrase='') {
  let data = {
    whatsapp_phone: whatsapp_phone
  };

  if (firstName) data.first_name = firstName;
  if (lastName) data.last_name = lastName;
  if (email) data.email = email;
  if (gender) data.gender = gender;
  if (hasOptInSms) data.has_opt_in_sms = hasOptInSms;
  if (hasOptInEmail) data.has_opt_in_email = hasOptInEmail;
  if (consentPhrase) data.consent_phrase = consentPhrase;

  data = JSON.stringify(data);

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.manychat.com/fb/subscriber/createSubscriber',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer 1064186:f2da5069d9d3c85229bab078a90e10e3'
    },
    data : data
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}