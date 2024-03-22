const axios = require('axios');

export default function sendManyChatMessage(messages, actions = [], quick_replies = [], message_tag = "ACCOUNT_UPDATE", otn_topic_name = "Сhannel news") {
  let data = JSON.stringify({
    "subscriber_id": 1416405486,
    "data": {
      "version": "v2",
      "content": {
        "messages": messages,
        "actions": actions,
        "quick_replies": quick_replies
      }
    },
    "message_tag": message_tag,
    "otn_topic_name": otn_topic_name
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.manychat.com/fb/sending/sendContent',
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