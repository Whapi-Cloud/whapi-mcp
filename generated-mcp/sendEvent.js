const fetch = require('node-fetch');
module.exports = async function sendEvent(args, env = process.env) {
  // Build path with path params
  let pathTmpl = "/messages/event";
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
    if (args.hasOwnProperty('title')) bodyObj['title'] = args['title'];
    if (args.hasOwnProperty('description')) bodyObj['description'] = args['description'];
    if (args.hasOwnProperty('startTime')) bodyObj['startTime'] = args['startTime'];
    if (args.hasOwnProperty('endTime')) bodyObj['endTime'] = args['endTime'];
    if (args.hasOwnProperty('degreesLatitude')) bodyObj['degreesLatitude'] = args['degreesLatitude'];
    if (args.hasOwnProperty('degreesLongitude')) bodyObj['degreesLongitude'] = args['degreesLongitude'];
    if (args.hasOwnProperty('locationName')) bodyObj['locationName'] = args['locationName'];
    if (args.hasOwnProperty('locationAddress')) bodyObj['locationAddress'] = args['locationAddress'];
    if (args.hasOwnProperty('view_once')) bodyObj['view_once'] = args['view_once'];
    init.body = JSON.stringify(bodyObj);
  }
  
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  let content;
  if (contentType.includes('application/json')) content = await res.json(); else content = await res.text();
  return { status: res.status, content };
};
