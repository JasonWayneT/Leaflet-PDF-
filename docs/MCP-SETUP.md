# Bookit v2: MCP Server Setup

The Bookit MCP Server allows you to use the Bookit pipeline directly from your favorite AI assistants without leaving your editor or desktop client.

## Requirements
- Node.js 18+ installed

## Configuration

Since the MCP server doesn't have a graphical interface, you must configure it using environment variables in your MCP client's configuration file.

### Required Environment Variables
- `BOOKIT_ANTHROPIC_KEY` (if using Anthropic for transformation/validation)
- `BOOKIT_GOOGLE_KEY` (if using Google for transformation/validation)

### Optional Environment Variables
- `BOOKIT_OUTPUT_DIR` - Where PDFs are saved. Defaults to `~/Documents/Bookit/`
- `BOOKIT_TRANSFORM_PROVIDER` - `anthropic` (default), `google`, or `ollama`
- `BOOKIT_VALIDATE_PROVIDER` - `anthropic` (default), `google`, or `ollama`
- `BOOKIT_TRANSFORM_MODEL` - E.g. `claude-3-5-sonnet-20240620`
- `BOOKIT_VALIDATE_MODEL` - E.g. `claude-3-haiku-20240307`

## Claude Desktop Setup

Open your Claude Desktop configuration file:
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following to the `mcpServers` object (replace `<PATH_TO_BOOKIT>` with your actual path):

```json
{
  "mcpServers": {
    "bookit": {
      "command": "node",
      "args": ["<PATH_TO_BOOKIT>/packages/mcp-server/dist/index.js"],
      "env": {
        "BOOKIT_ANTHROPIC_KEY": "sk-ant-your-key-here"
      }
    }
  }
}
```

Restart Claude Desktop. You can now type: "Bookit this YouTube video: [URL]"

## Cursor Setup

In Cursor:
1. Go to **Settings > Features > MCP Servers**
2. Click **+ Add new MCP server**
3. Name: `bookit`
4. Type: `command`
5. Command: `node <PATH_TO_BOOKIT>/packages/mcp-server/dist/index.js`
6. Add your environment variables in the Cursor UI or ensure they are present in your global environment.

You can now use `@bookit_transform` or ask Cursor to run text through Bookit.

## Troubleshooting

- **Server starts but tool returns an error:** Ensure your API key has credits and is valid. Check `~/Documents/Bookit/bookit-token-log.jsonl` for the token logging.
- **Playwright errors:** The server needs Chromium. Run `npx playwright install chromium` in the `packages/mcp-server` directory.
