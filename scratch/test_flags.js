const fetch = require('node-fetch');
async function test() {
  const res = await fetch('https://media.api-sports.io/flags/turkey.svg');
  console.log(res.status, res.headers.get('content-type'));
}
test();
