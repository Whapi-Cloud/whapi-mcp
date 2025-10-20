const fetch = require('node-fetch');
module.exports = async function sendMessageStoryText(args, env = process.env) {
  // Build path with path params
  let pathTmpl = "/messages/story/text";
  for (const p of []){
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
  const method = "POST";

  const init = { method, headers };
  
  if (method !== 'GET'){
    init.headers['Content-Type'] = 'application/json';
    const bodyObj = {};
    if (args.hasOwnProperty('contacts')) bodyObj['contacts'] = args['contacts'];
    if (args.hasOwnProperty('exclude_contacts')) bodyObj['exclude_contacts'] = args['exclude_contacts'];
    if (args.hasOwnProperty('caption')) bodyObj['caption'] = args['caption'];
    if (args.hasOwnProperty('background_color')) bodyObj['background_color'] = args['background_color'];
    if (args.hasOwnProperty('caption_color')) bodyObj['caption_color'] = args['caption_color'];
    if (args.hasOwnProperty('font_type')) bodyObj['font_type'] = args['font_type'];
    init.body = JSON.stringify(bodyObj);
  }
  
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  let content;
  if (contentType.includes('application/json')) content = await res.json(); else content = await res.text();
  return { status: res.status, content };
};
