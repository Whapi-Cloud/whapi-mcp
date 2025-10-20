const fetch = require('node-fetch');
module.exports = async function sendMessageLiveLocation(args, env = process.env) {
  // Build path with path params
  let pathTmpl = "/messages/live_location";
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
    if (args.hasOwnProperty('to')) bodyObj['to'] = args['to'];
    if (args.hasOwnProperty('quoted')) bodyObj['quoted'] = args['quoted'];
    if (args.hasOwnProperty('edit')) bodyObj['edit'] = args['edit'];
    if (args.hasOwnProperty('latitude')) bodyObj['latitude'] = args['latitude'];
    if (args.hasOwnProperty('longitude')) bodyObj['longitude'] = args['longitude'];
    if (args.hasOwnProperty('address')) bodyObj['address'] = args['address'];
    if (args.hasOwnProperty('name')) bodyObj['name'] = args['name'];
    if (args.hasOwnProperty('url')) bodyObj['url'] = args['url'];
    if (args.hasOwnProperty('preview')) bodyObj['preview'] = args['preview'];
    if (args.hasOwnProperty('accuracy')) bodyObj['accuracy'] = args['accuracy'];
    if (args.hasOwnProperty('speed')) bodyObj['speed'] = args['speed'];
    if (args.hasOwnProperty('degrees')) bodyObj['degrees'] = args['degrees'];
    if (args.hasOwnProperty('comment')) bodyObj['comment'] = args['comment'];
    if (args.hasOwnProperty('view_once')) bodyObj['view_once'] = args['view_once'];
    init.body = JSON.stringify(bodyObj);
  }
  
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  let content;
  if (contentType.includes('application/json')) content = await res.json(); else content = await res.text();
  return { status: res.status, content };
};
