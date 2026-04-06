# whapi-mcp

A Model Context Protocol (MCP) server for Whapi Cloud (WhatsApp API).

## Quick start

Requires Node.js 18+.

Install and run via NPX:

```bash
npx -y whapi-mcp@latest
```

Or set your Whapi API token and run:

```bash
# PowerShell
$env:API_TOKEN="YOUR_TOKEN"; npx -y whapi-mcp@latest
```

## Using with MCP clients

- Cursor: add to %USERPROFILE%\.cursor\mcp.json
```json
{
  "mcpServers": {
    "whapi-mcp": {
      "command": "npx",
      "args": ["-y", "whapi-mcp@latest"],
      "env": { "API_TOKEN": "YOUR_TOKEN" }
    }
  }
}
```

- Claude Desktop: add to %APPDATA%\Claude\claude_desktop_config.json (same structure as above).

## Tools

The server exposes tools generated from Whapi OpenAPI. Example:

- sendMessageText (required: to, body)

Example call (pseudo):

```
name: sendMessageText
arguments: { "to": "1234567890@s.whatsapp.net", "body": "Hello" }
```

## Agent Skills

**WHAPI Agent Skill** — a structured guide for AI agents is now available. Install it to give your agent accurate knowledge of Chat ID formats, MCP setup, webhook configuration, message types, and safe broadcast patterns — preventing the most common mistakes before they happen.

```bash
npx skills add Whapi-Cloud/whapi-agent-skills
```

## License

MIT
