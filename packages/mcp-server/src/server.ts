import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { readConfig } from './config/env-config.js'
import { handleTransform, TransformArgs } from './tools/bookit-transform.js'

export async function runServer() {
  const config = readConfig()

  const server = new Server(
    {
      name: 'bookit-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'bookit_transform',
          description: 'Run the Bookit pipeline to transform text, files, or YouTube videos into an educational reading artifact (PDF).',
          inputSchema: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: 'Raw text, markdown, or a YouTube URL. Mutually exclusive with filePath.'
              },
              filePath: {
                type: 'string',
                description: 'Absolute path to a .md or .txt file. Mutually exclusive with content.'
              },
              style: {
                type: 'string',
                description: 'Visual style: orbital-light (default) or orbital-night',
                enum: ['orbital-light', 'orbital-night']
              },
              title: {
                type: 'string',
                description: 'Document title. Derived from content if not provided.'
              },
              outputDir: {
                type: 'string',
                description: 'Directory to save the PDF. Defaults to BOOKIT_OUTPUT_DIR env var or ~/Documents/Bookit/.'
              },
              verbose: {
                type: 'boolean',
                description: 'Include pipeline stage timing in the response.'
              }
            }
          }
        }
      ]
    }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === 'bookit_transform') {
      const args = request.params.arguments as TransformArgs
      const result = await handleTransform(args, config)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ],
        isError: !!result.error
      }
    }

    throw new Error(`Unknown tool: ${request.params.name}`)
  })

  const transport = new StdioServerTransport()
  await server.connect(transport)
}
