export async function POST(request) {
  const apiKey = process.env.CEPOLAB_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: { message: "API key not set. Set CEPOLAB_API_KEY in .env.local" } }, { status: 500 });
  }
  try {
    const body = await request.json();
    
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    };

    // MCP 서버가 있으면 beta 헤더 추가
    if (body.mcp_servers) {
      headers["anthropic-beta"] = "mcp-client-2025-04-04";
    }

    // web_search tool이 있으면 beta 헤더 추가
    if (body.tools && body.tools.some(t => t.type === "web_search_20250305")) {
      headers["anthropic-beta"] = headers["anthropic-beta"] 
        ? headers["anthropic-beta"] + ",web-search-2025-03-05"
        : "web-search-2025-03-05";
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json({ error: { message: error.message } }, { status: 500 });
  }
}
