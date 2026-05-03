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
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[Shelby Proxy ${requestId}] Incoming request: ${req.method} ${req.url}`);

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

    // Use Headers object for better compatibility and case-insensitivity
    const headers = new Headers();
    
    // 1. Copy headers from original request
    req.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      // Skip headers that we will override or that are restricted by fetch
      // We also skip x-api-key and authorization to ensure we use the server-side ones
      if (!["host", "connection", "content-length", "origin", "referer", "x-api-key", "authorization"].includes(k)) {
        headers.set(key, value);
      }
    });

    // 2. ALWAYS inject/override the API key from environment
    // We check multiple possible environment variable names, prioritizing the RPC-specific one
    const serverApiKey = process.env.SHELBY_RPC_API_KEY || 
                         process.env.SHELBY_API_KEY || 
                         (process.env.SHELBY_SIGNING_SECRET?.startsWith("AG-") ? process.env.SHELBY_SIGNING_SECRET : undefined) || 
                         process.env.NEXT_PUBLIC_SHELBY_API_KEY;

    if (serverApiKey) {
      // Inject into ALL possible header variations to be absolutely sure
      // Shelby RPC is known to look for 'x-api-key'
      headers.set("x-api-key", serverApiKey);
      headers.set("X-API-KEY", serverApiKey);
      headers.set("Authorization", `Bearer ${serverApiKey}`);
      
      // Additional variations just in case
      headers.set("x-api-token", serverApiKey);
      headers.set("X-API-Token", serverApiKey);
      headers.set("X-Authorization", serverApiKey);
      
      console.log(`[Shelby Proxy ${requestId}] Injected Server API Key (len: ${serverApiKey.length})`);
    } else {
      // Fallback: check if the client sent an API key and ensure it's in the right format
      const clientApiKey = req.headers.get("x-api-key") || req.headers.get("X-API-KEY");
      const clientAuth = req.headers.get("Authorization");
      
      if (clientApiKey) {
        headers.set("x-api-key", clientApiKey);
        console.log(`[Shelby Proxy ${requestId}] Using API Key from client headers`);
      } else if (clientAuth) {
        headers.set("Authorization", clientAuth);
        console.log(`[Shelby Proxy ${requestId}] Using Authorization from client headers`);
      } else {
        console.warn(`[Shelby Proxy ${requestId}] WARNING: No API key found in environment or client headers!`);
      }
    }

    // 3. Force Origin/Referer to a known allowed value (CRITICAL for Shelby RPC)
    const expectedOrigin = "https://explorer.shelby.xyz";
    headers.set("Origin", expectedOrigin);
    headers.set("Referer", expectedOrigin + "/");
    headers.set("User-Agent", "ShelbyDrop/1.0 (Next.js Proxy)");
    
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    console.log(`[Shelby Proxy ${requestId}] Forwarding ${req.method} to: ${url}`);

    // Forward the request using fetch
    let body: any = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      // Use arrayBuffer for reliable binary data handling
      body = await req.arrayBuffer();
      console.log(`[Shelby Proxy ${requestId}] Body size: ${body.byteLength} bytes`);
    }

    const res = await fetch(url, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
      // @ts-ignore - duplex is required for streaming/binary bodies in some environments
      duplex: 'half'
    });

    console.log(`[Shelby Proxy ${requestId}] Target Response: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const errorText = await res.clone().text().catch(() => "N/A");
      console.error(`[Shelby Proxy ${requestId}] Target Error Body: ${errorText}`);
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
    console.error(`[Shelby Proxy ${requestId}] Error:`, error);
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
