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

    // 1. Prepare headers for the target request
    const targetHeaders: Record<string, string> = {};
    
    // Copy headers from original request, but skip restricted ones
    for (const [key, value] of req.headers.entries()) {
      const k = key.toLowerCase();
      // We skip auth-related headers from the client to ensure we use the server-side ones
      if (!["host", "connection", "content-length", "origin", "referer", "x-api-key", "authorization", "cookie", "x-api-token"].includes(k)) {
        targetHeaders[key] = value;
      }
    }

    // 2. Inject the API key from environment
    let keySource = "none";
    // Try to find ANY key that looks like a Shelby API key
    const possibleKeys = [
      { name: "SHELBY_RPC_API_KEY", val: process.env.SHELBY_RPC_API_KEY },
      { name: "SHELBY_API_KEY", val: process.env.SHELBY_API_KEY },
      { name: "SHELBY_SIGNING_SECRET", val: process.env.SHELBY_SIGNING_SECRET },
      { name: "NEXT_PUBLIC_SHELBY_API_KEY", val: process.env.NEXT_PUBLIC_SHELBY_API_KEY },
    ];

    let serverApiKey = "";
    for (const k of possibleKeys) {
      if (k.val && k.val.trim().length > 0) {
        // Prioritize AG- keys for RPC operations
        if (k.val.trim().startsWith("AG-")) {
          serverApiKey = k.val.trim();
          keySource = k.name;
          break;
        }
        // Fallback to first non-empty key if no AG- key found yet
        if (!serverApiKey) {
          serverApiKey = k.val.trim();
          keySource = k.name;
        }
      }
    }
    
    if (serverApiKey) {
      // Inject into ALL possible header variations to be absolutely sure
      targetHeaders["x-api-key"] = serverApiKey;
      targetHeaders["X-API-KEY"] = serverApiKey;
      targetHeaders["Authorization"] = `Bearer ${serverApiKey}`;
      targetHeaders["x-api-token"] = serverApiKey;
      targetHeaders["api-key"] = serverApiKey;
      targetHeaders["X-Shelby-API-Key"] = serverApiKey;
      
      console.log(`[Shelby Proxy ${requestId}] Injected API Key from ${keySource} (prefix: ${serverApiKey.substring(0, 5)}..., len: ${serverApiKey.length})`);
    } else {
      console.warn(`[Shelby Proxy ${requestId}] WARNING: No API key found in environment!`);
    }

    // 3. Force Origin/Referer (CRITICAL for Shelby RPC)
    targetHeaders["Origin"] = "https://explorer.shelby.xyz";
    targetHeaders["Referer"] = "https://explorer.shelby.xyz/";
    targetHeaders["User-Agent"] = "ShelbyDrop/1.0 (Next.js Proxy)";
    
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

    // Forward the request
    let body: any = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.arrayBuffer();
      console.log(`[Shelby Proxy ${requestId}] Body size: ${body.byteLength} bytes`);
    }

    const res = await fetch(url, {
      method: req.method,
      headers: targetHeaders,
      body,
      cache: "no-store",
      // @ts-ignore
      duplex: 'half'
    });

    console.log(`[Shelby Proxy ${requestId}] Target Response: ${res.status}`);

    // Build response headers
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (!["content-encoding", "transfer-encoding", "connection", "access-control-allow-origin", "set-cookie"].includes(k)) {
        responseHeaders.set(key, value);
      }
    });
    
    // Ensure CORS is allowed
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "*");
    responseHeaders.set("Access-Control-Expose-Headers", "*");
    
    // Add debug info to response headers
    responseHeaders.set("X-Proxy-Key-Source", keySource);
    responseHeaders.set("X-Proxy-Id", requestId);
    responseHeaders.set("X-Proxy-Key-Len", serverApiKey ? serverApiKey.length.toString() : "0");

    if (res.status === 401 || res.status === 403) {
      const errorBody = await res.clone().text();
      console.error(`[Shelby Proxy ${requestId}] ${res.status} Error from target. Body: ${errorBody}`);
      
      // Log headers for debugging (redacted)
      const debugHeaders: Record<string, string> = {};
      Object.entries(targetHeaders).forEach(([k, v]) => {
        const lowK = k.toLowerCase();
        if (lowK.includes("key") || lowK.includes("auth") || lowK.includes("token")) {
          debugHeaders[k] = `PRESENT (len: ${v.length}, starts: ${v.substring(0, 4)}...)`;
        } else {
          debugHeaders[k] = v;
        }
      });
      console.error(`[Shelby Proxy ${requestId}] Sent Headers to Target:`, JSON.stringify(debugHeaders, null, 2));
    }

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
