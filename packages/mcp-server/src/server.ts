import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  CreateMessageResultSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import type { AiTextResponse, ProviderConfig } from '@leafletpdf/core'
import { readConfig } from './config/env-config.js'
import type { ResolvedProviderConfig } from './config/env-config.js'
import { handleTransform, TransformArgs } from './tools/leafletpdf-transform.js'

function buildSamplingProvider(server: Server): ProviderConfig {
  return {
    provider: 'mcp-sampling',
    createMessage: async (prompt: string): Promise<AiTextResponse> => {
      const result = await server.request(
        {
          method: 'sampling/createMessage',
          params: {
            messages: [{ role: 'user', content: { type: 'text', text: prompt } }],
            maxTokens: 8192,
          },
        },
        CreateMessageResultSchema
      )

      const text = result.content.type === 'text' ? result.content.text : ''
      return { text, usage: { inputTokens: 0, outputTokens: 0 } }
    },
  }
}

export async function runServer() {
  const config = readConfig()

  const server = new Server(
    {
      name: 'leafletpdf-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        experimental: { sampling: {} },
      },
    }
  )

  // Resolve the provider config — either direct (API key / Ollama) or MCP sampling
  const providerConfig: ResolvedProviderConfig = config.useSampling
    ? {
        transformation: buildSamplingProvider(server),
        validation: buildSamplingProvider(server),
      }
    : config.providerConfig!

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'leafletpdf_transform',
          description: 'Run the Leaflet PDF pipeline to transform text, files, or YouTube videos into an educational reading artifact (PDF).',
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
                description: 'Directory to save the PDF. Defaults to LEAFLETPDF_OUTPUT_DIR env var or ~/Documents/LeafletPDF/.'
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
    if (request.params.name === 'leafletpdf_transform') {
      const args = request.params.arguments as TransformArgs
      const result = await handleTransform(args, config.outputDir, providerConfig)

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
