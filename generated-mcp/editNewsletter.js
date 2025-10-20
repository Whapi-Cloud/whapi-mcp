const fetch = require('node-fetch');
module.exports = async function editNewsletter(args, env = process.env) {
  // Build path with path params
  let pathTmpl = "/newsletters/{NewsletterID}";
  for (const p of [{"name":"NewsletterID","type":"string","required":true,"description":"Newsletter ID"}]){
    const val = args[p.name];
    if (val === undefined || val === null) throw new Error('Missing path param: ' + p.name);
    pathTmpl = pathTmpl.replace('{'+p.name+'}', encodeURIComponent(String(val)));
  }

  // Query string
  const queryPairs = [];
  for (const q of []){
    const v = args[q.name];
    if (v === undefined || v === null) continue;
    queryPairs.push(encodeURIComponent(q.name) + '=' + encodeURIComponent(String(v)));
  }
  const qs = queryPairs.length ? '?' + queryPairs.join('&') : '';

  // Headers
  const headers = {};
  headers['Authorization'] = 'Bearer ' + (env.API_TOKEN || '');

  const url = "https://gate.whapi.cloud" + pathTmpl + qs;
  const method = "PATCH";

  const init = { method, headers };
  
  if (method !== 'GET'){
    init.headers['Content-Type'] = 'application/json';
    const bodyObj = {};
    if (args.hasOwnProperty('name')) bodyObj['name'] = args['name'];
    if (args.hasOwnProperty('description')) bodyObj['description'] = args['description'];
    if (args.hasOwnProperty('newsletter_pic')) bodyObj['newsletter_pic'] = args['newsletter_pic'];
    if (args.hasOwnProperty('reactions')) bodyObj['reactions'] = args['reactions'];
    init.body = JSON.stringify(bodyObj);
  }
  
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  let content;
  if (contentType.includes('application/json')) content = await res.json(); else content = await res.text();
  return { status: res.status, content };
};
