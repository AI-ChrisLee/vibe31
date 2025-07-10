#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
  const url = process.argv[2] || "http://localhost:3000";
  console.log(`🔗 Connecting to MCP server at: ${url}/api/sse`);

  const transport = new SSEClientTransport(new URL(`${url}/api/sse`));
  const client = new Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  console.log("✅ Connected to MCP server");

  // List available tools
  console.log("\n📋 Available Tools:");
  const tools = await client.listTools();
  tools.tools.forEach((tool) => {
    console.log(`  - ${tool.name}: ${tool.description}`);
  });

  // List available prompts
  console.log("\n💬 Available Prompts:");
  const prompts = await client.listPrompts();
  prompts.prompts.forEach((prompt) => {
    console.log(`  - ${prompt.name}: ${prompt.description}`);
  });

  // List available resources
  console.log("\n📚 Available Resources:");
  const resources = await client.listResources();
  resources.resources.forEach((resource) => {
    console.log(`  - ${resource.name}: ${resource.description}`);
  });

  // Example: Generate a landing page
  console.log("\n🚀 Testing landing page generation...");
  try {
    const result = await client.callTool("generate_landing_page", {
      product_name: "Vibe31",
      target_audience: "Small business owners and marketers",
      unique_value_prop: "AI-powered marketing that speaks your language",
      style: "modern",
    });
    console.log("Result:", result.content[0].text);
  } catch (error) {
    console.error("Error calling tool:", error);
  }

  // Example: Get marketing templates
  console.log("\n📄 Fetching marketing templates...");
  try {
    const templates = await client.readResource("marketing_templates");
    console.log("Templates:", templates.content[0].text);
  } catch (error) {
    console.error("Error reading resource:", error);
  }

  await client.close();
  console.log("\n👋 Connection closed");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});