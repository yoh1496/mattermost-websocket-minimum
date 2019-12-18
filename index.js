const MattermostWebSocket = require('./mattermost');

const ws_endpoint = process.env['MATTERMOST_WS_URL'] || process.argv[2];
const token = process.env['MATTERMOST_TOKEN'] || process.argv[3];

const client = new MattermostWebSocket(ws_endpoint);

client.addListener((data) => {
  console.log(data);
});

client.connectAsync()
  .then(() => {
    console.log('connection established');
    return client.authAsync(token);
  }).then(() => {
    console.log('auth done');
  });

// 無限ループ
setInterval(() => {
  console.log('hoge');
}, 1000);

console.log(process.argv);