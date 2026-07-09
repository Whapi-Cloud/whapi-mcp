const fetch = require('node-fetch');
module.exports = async function sendMessageQuiz(args, env = process.env) {
  // Build path with path params
  let pathTmpl = "/messages/quiz";
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
    if (args.hasOwnProperty('title')) bodyObj['title'] = args['title'];
    if (args.hasOwnProperty('options')) bodyObj['options'] = args['options'];
    if (args.hasOwnProperty('correct_option_index')) bodyObj['correct_option_index'] = args['correct_option_index'];
    if (args.hasOwnProperty('end_time')) bodyObj['end_time'] = args['end_time'];
    if (args.hasOwnProperty('hide_participant_name')) bodyObj['hide_participant_name'] = args['hide_participant_name'];
    if (args.hasOwnProperty('allow_add_option')) bodyObj['allow_add_option'] = args['allow_add_option'];
    init.body = JSON.stringify(bodyObj);
  }
  
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  let content;
  if (contentType.includes('application/json')) content = await res.json(); else content = await res.text();
  return { status: res.status, content };
};
