import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shelby RPC Proxy
 * 
 * This proxy is used to bypass Origin header restrictions and inject API keys.
 * It forwards requests to the real Shelby RPC nodes.
 */
async function handleProxy(req: Request, { params }: { params: { path: string[] } }) {
  try {
    const pathParts = params.path;
    if (!pathParts || pathParts.length < 1) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const network = pathParts[0]; // 'testnet' or 'shelbynet'
    const remainingPath = pathParts.slice(1).filter(Boolean).join("/");
    
    const targetBase = network === "shelbynet" 
      ? "https://api.shelbynet.shelby.xyz/shelby" 
      : "https://api.testnet.shelby.xyz/shelby";
      
    const baseUrl = targetBase.endsWith("/") ? targetBase : `${targetBase}/`;
    
    // Append query parameters from the original request
    const { search } = new URL(req.url);
    const url = `${baseUrl}${remainingPath}${search}`;

    // Use a plain object for headers to ensure total control and compatibility with fetch
    const headerMap: Record<string, string> = {};
    
    // Copy headers from original request
    req.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      // Skip restricted headers that we will override
      if (!["host", "origin", "referer", "connection", "content-length", "x-api-key", "authorization"].includes(k)) {
        headerMap[key] = value;
      }
    });

    // ALWAYS inject/override the API key from environment
    const rpcKey = process.env.SHELBY_RPC_API_KEY;
    const signingSecret = process.env.SHELBY_SIGNING_SECRET;
    const generalKey = process.env.SHELBY_API_KEY;
    const publicKey = process.env.NEXT_PUBLIC_SHELBY_API_KEY;
    
    const apiKey = rpcKey || 
                   (signingSecret?.startsWith("AG-") ? signingSecret : undefined) || 
                   generalKey ||
                   publicKey;

    if (apiKey) {
      // Inject into multiple possible header locations to be safe
      headerMap["x-api-key"] = apiKey;
      headerMap["X-API-KEY"] = apiKey;
      headerMap["Authorization"] = `Bearer ${apiKey}`;
      
      console.log(`[Shelby Proxy] Injected API Key: ${apiKey.substring(0, 10)}...`);
    } else {
      console.warn(`[Shelby Proxy] WARNING: No API key found in environment variables!`);
    }

    // Force Origin/Referer to a known allowed value
    let expectedOrigin = process.env.SHELBY_ORIGIN;
    if (!expectedOrigin || expectedOrigin.includes("localhost") || expectedOrigin.includes("127.0.0.1")) {
      expectedOrigin = "https://explorer.shelby.xyz";
    }
    
    headerMap["Origin"] = expectedOrigin;
    headerMap["Referer"] = expectedOrigin + "/";
    headerMap["User-Agent"] = "ShelbyDrop/1.0 (Next.js Proxy)";
    
    console.log(`[Shelby Proxy] ${req.method} -> ${url}`);

    // Forward the request using fetch
    let body: any = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      // Use arrayBuffer for reliable binary data handling
      body = await req.arrayBuffer();
      console.log(`[Shelby Proxy] Body size: ${body.byteLength} bytes`);
    }

    const res = await fetch(url, {
      method: req.method,
      headers: headerMap,
      body,
      // @ts-ignore
      duplex: 'half'
    });

    console.log(`[Shelby Proxy] Target Response: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const errorText = await res.clone().text().catch(() => "N/A");
      console.error(`[Shelby Proxy] Target Error Body: ${errorText}`);
    }

    // Build response headers
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      // Skip headers that might interfere with CORS or encoding
      if (!["content-encoding", "transfer-encoding", "connection", "access-control-allow-origin"].includes(k)) {
        responseHeaders.set(key, value);
      }
    });
    
    // Ensure CORS is allowed for the browser
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "*");

    return new NextResponse(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Shelby Proxy Error]", error);
    return NextResponse.json({ 
      error: "Proxy failed", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 502 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const OPTIONS = handleProxy;
