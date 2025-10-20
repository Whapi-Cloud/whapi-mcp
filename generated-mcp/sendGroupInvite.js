const fetch = require('node-fetch');
module.exports = async function sendGroupInvite(args, env = process.env) {
  // Build path with path params
  let pathTmpl = "/groups/link/{InviteCode}";
  for (const p of [{"name":"InviteCode","type":"string","required":true,"description":"Invite Code"}]){
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
    if (args.hasOwnProperty('to')) bodyObj['to'] = args['to'];
    if (args.hasOwnProperty('quoted')) bodyObj['quoted'] = args['quoted'];
    if (args.hasOwnProperty('edit')) bodyObj['edit'] = args['edit'];
    if (args.hasOwnProperty('title')) bodyObj['title'] = args['title'];
    if (args.hasOwnProperty('body')) bodyObj['body'] = args['body'];
    if (args.hasOwnProperty('preview_type')) bodyObj['preview_type'] = args['preview_type'];
    if (args.hasOwnProperty('preview')) bodyObj['preview'] = args['preview'];
    if (args.hasOwnProperty('media')) bodyObj['media'] = args['media'];
    if (args.hasOwnProperty('mime_type')) bodyObj['mime_type'] = args['mime_type'];
    if (args.hasOwnProperty('no_encode')) bodyObj['no_encode'] = args['no_encode'];
    if (args.hasOwnProperty('no_cache')) bodyObj['no_cache'] = args['no_cache'];
    if (args.hasOwnProperty('mentions')) bodyObj['mentions'] = args['mentions'];
    init.body = JSON.stringify(bodyObj);
  }
  
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  let content;
  if (contentType.includes('application/json')) content = await res.json(); else content = await res.text();
  return { status: res.status, content };
};
