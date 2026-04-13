#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const manifestPath = path.join(__dirname, 'B_manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('B_manifest.json not found. Run: npm run generate');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const logPath = path.join(__dirname, 'mcp-debug.log');
function log(msg) {
  try { fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`); } catch {}
}
log('server:start');

// Load generated tool implementations (CommonJS)
const toolsImpl = require('./generated-mcp');
log('tools:module:loaded');

const server = new McpServer({
  name: 'whapi-mcp',
  version: '1.0.0'
}, {
  capabilities: {
    tools: { listChanged: true },
    resources: {},
    prompts: {},
    logging: {}
  }
});
log('server:created');

// Build a ZodRawShape from a JSON Schema-like object (subset used in B_manifest.json)
function buildZodShapeFromInputSchema(inputSchema) {
  const shape = {};
  if (!inputSchema || typeof inputSchema !== 'object') return shape;
  const properties = inputSchema.properties || {};
  const required = Array.isArray(inputSchema.required) ? new Set(inputSchema.required) : new Set();
  for (const [key, prop] of Object.entries(properties)) {
    let zt;
    const t = prop && prop.type;
    if (t === 'string') {
      zt = z.string();
    } else if (t === 'number' || t === 'integer') {
      zt = z.number();
    } else if (t === 'boolean') {
      zt = z.boolean();
    } else if (t === 'array') {
      const itemType = (prop.items && prop.items.type) || 'any';
      let zi;
      if (itemType === 'string') zi = z.string();
      else if (itemType === 'number' || itemType === 'integer') zi = z.number();
      else if (itemType === 'boolean') zi = z.boolean();
      else zi = z.any();
      zt = z.array(zi);
    } else if (t === 'object') {
      zt = z.record(z.any());
    } else {
      zt = z.any();
    }
    if (prop && typeof prop.description === 'string') {
      zt = zt.describe(prop.description);
    }
    shape[key] = required.has(key) ? zt : zt.optional();
  }
  return shape;
}

// Tools that permanently reconfigure the WhatsApp channel — flag for AI safety
const DESTRUCTIVE_TOOLS = new Set(['updateChannelSettings', 'webhookTest']);

// Detailed usage hints for polymorphic tools where flat inputSchema is not enough
const TOOL_USAGE_HINTS = {
  sendMessageInteractive: `

USAGE BY TYPE (field "type" determines "action" structure):

type:"list" -> action: { list: { sections: [{ title: "Section", rows: [{ title: "Row", id: "r1", description: "Optional" }] }], label: "Button text" } }

type:"button" -> action: { buttons: [{ type: "quick_reply", title: "Button1", id: "id1" }, { type: "quick_reply", title: "Button2", id: "id2" }] }
Button types: quick_reply, call (needs phone_number), copy (needs copy_code), url (needs url field)

type:"product" -> action: { product: { catalog_id: "...", product_id: "..." } }

header/body/footer each take: { text: "string" }
Required fields: to, action, type`
};

for (const tool of manifest) {
  const name = tool.toolName;
  const baseDescription = tool.description || tool.summary || `HTTP ${tool.http.method} ${tool.http.path}`;
  const hint = TOOL_USAGE_HINTS[name] || '';
  const description = DESTRUCTIVE_TOOLS.has(name)
    ? `[DESTRUCTIVE] Permanently reconfigures WhatsApp channel settings (webhooks, proxy). Requires explicit human confirmation before execution. ${baseDescription}${hint}`
    : `${baseDescription}${hint}`;

  const paramsShape = buildZodShapeFromInputSchema(tool.inputSchema);
  const registerWithSchema = paramsShape && Object.keys(paramsShape).length > 0;

  const handler = async (args) => {
    const fn = toolsImpl[name];
    if (typeof fn !== 'function') {
      return {
        content: [{ type: 'text', text: `Tool implementation not found: ${name}` }],
        isError: true
      };
    }
    try {
      const result = await fn(args, { API_TOKEN: process.env.API_TOKEN });
      return {
        content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }]
      };
    } catch (e) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(e && e.message ? e.message : e) }]
      };
    }
  };

  if (registerWithSchema) {
    server.tool(name, description, paramsShape, handler);
    log(`tool:registered_with_schema:${name}:${Object.keys(paramsShape).join(',')}`);
  } else {
    server.tool(name, description, handler);
    log(`tool:registered_no_schema:${name}`);
  }
}
log(`tools:registered:${manifest.length}`);

// Minimal prompt/resource to satisfy clients expecting these capabilities
server.prompt('noop', 'No-op prompt', async () => ({ messages: [] }));
server.resource('about', 'about://whapi-mcp', async () => ({ contents: [{ type: 'text', text: 'whapi-mcp' }] }));

// Health-check tool — registered before connect() per MCP SDK spec
server.tool('hello', 'Simple health check tool', async () => ({
  content: [{ type: 'text', text: 'hello' }]
}));

if (!process.env.API_TOKEN) {
  console.error('ERROR: API_TOKEN environment variable is required');
  process.exit(1);
}

await server.connect(new StdioServerTransport());
log('server:connected');

// Notify client that tools are available
try { server.sendToolListChanged(); log('notify:tools:list_changed'); } catch {}
// Ensure the process stays alive when launched outside an MCP client
if (process.stdin && typeof process.stdin.resume === 'function') {
  process.stdin.resume();
}
