const fetch = require('node-fetch');
module.exports = async function createProduct(args, env = process.env) {
  // Build path with path params
  let pathTmpl = "/business/products";
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
    if (args.hasOwnProperty('product_retailer_id')) bodyObj['product_retailer_id'] = args['product_retailer_id'];
    if (args.hasOwnProperty('currency')) bodyObj['currency'] = args['currency'];
    if (args.hasOwnProperty('images')) bodyObj['images'] = args['images'];
    if (args.hasOwnProperty('availability')) bodyObj['availability'] = args['availability'];
    if (args.hasOwnProperty('name')) bodyObj['name'] = args['name'];
    if (args.hasOwnProperty('url')) bodyObj['url'] = args['url'];
    if (args.hasOwnProperty('description')) bodyObj['description'] = args['description'];
    if (args.hasOwnProperty('price')) bodyObj['price'] = args['price'];
    if (args.hasOwnProperty('is_hidden')) bodyObj['is_hidden'] = args['is_hidden'];
    init.body = JSON.stringify(bodyObj);
  }
  
  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  let content;
  if (contentType.includes('application/json')) content = await res.json(); else content = await res.text();
  return { status: res.status, content };
};
