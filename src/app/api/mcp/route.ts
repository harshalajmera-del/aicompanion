// POST /api/mcp — execute any MCP tool by name
import { NextRequest, NextResponse } from 'next/server';
import { executeMCPTool } from '@/lib/mcp/executor';
import type { MCPToolName } from '@/lib/mcp/tools';
import { generateId } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body: { tool: MCPToolName; params: Record<string, unknown>; callId?: string } = await req.json();
    if (!body.tool) {
      return NextResponse.json({ error: 'tool name is required' }, { status: 400 });
    }
    const result = await executeMCPTool(body.tool, body.params ?? {}, body.callId ?? generateId());
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/mcp]', err);
    return NextResponse.json({ error: 'MCP tool execution failed' }, { status: 500 });
  }
}

// GET /api/mcp — list all available tools
export async function GET() {
  const { MCP_TOOLS } = await import('@/lib/mcp/tools');
  const tools = Object.entries(MCP_TOOLS).map(([name, def]) => ({
    name,
    description: def.description,
  }));
  return NextResponse.json({ tools, count: tools.length });
}
