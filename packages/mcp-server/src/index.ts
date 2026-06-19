import { runServer } from './server.js'

runServer().catch(err => {
  console.error("Failed to start MCP server:", err)
  process.exit(1)
})
