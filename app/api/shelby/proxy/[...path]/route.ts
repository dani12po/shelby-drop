import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shelby RPC Proxy - Robust Version
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
    const targetHeaders = new Headers();
    
    // Copy headers from original request, but skip restricted or sensitive ones
    for (const [key, value] of req.headers.entries()) {
      const k = key.toLowerCase();
      // We skip auth-related headers from the client to ensure we use the server-side ones
      if (!["host", "connection", "content-length", "origin", "referer", "x-api-key", "authorization", "cookie", "x-api-token", "x-authorization", "api-key"].includes(k)) {
        targetHeaders.set(key, value);
      }
    }

    // 2. Inject the API key from environment
    let keySource = "none";
    const possibleKeys = [
      { name: "SHELBY_RPC_API_KEY", val: process.env.SHELBY_RPC_API_KEY },
      { name: "SHELBY_API_KEY", val: process.env.SHELBY_API_KEY },
      { name: "SHELBY_SIGNING_SECRET", val: process.env.SHELBY_SIGNING_SECRET },
      { name: "NEXT_PUBLIC_SHELBY_API_KEY", val: process.env.NEXT_PUBLIC_SHELBY_API_KEY },
    ];

    let serverApiKey = "";
    for (const k of possibleKeys) {
      if (k.val && k.val.trim().length > 0) {
        const trimmed = k.val.trim();
        // Prioritize AG- keys for RPC operations
        if (trimmed.startsWith("AG-")) {
          serverApiKey = trimmed;
          keySource = k.name;
          break;
        }
        // Fallback to first non-empty key if no AG- key found yet
        if (!serverApiKey) {
          serverApiKey = trimmed;
          keySource = k.name;
        }
      }
    }
    
    if (serverApiKey) {
      // Inject into ALL possible header variations to be absolutely sure
      targetHeaders.set("x-api-key", serverApiKey);
      targetHeaders.set("authorization", `Bearer ${serverApiKey}`);
      targetHeaders.set("x-api-token", serverApiKey);
      targetHeaders.set("x-authorization", serverApiKey);
      targetHeaders.set("api-key", serverApiKey);
      
      const isAgKey = serverApiKey.startsWith("AG-");
      console.log(`[Shelby Proxy ${requestId}] Injected API Key from ${keySource} (prefix: ${serverApiKey.substring(0, 5)}..., len: ${serverApiKey.length}, isAG: ${isAgKey})`);
    } else {
      console.warn(`[Shelby Proxy ${requestId}] WARNING: No API key found in environment!`);
      return NextResponse.json({ 
        error: "Proxy Configuration Error", 
        details: "No Shelby API key found in server environment variables. Please check Vercel settings and ensure you have redeployed." 
      }, { 
        status: 500,
        headers: { "X-Proxy-Error": "Missing API Key" }
      });
    }

    // 3. Force Origin/Referer (CRITICAL for Shelby RPC)
    const allowedOrigin = process.env.SHELBY_ORIGIN || "https://explorer.shelby.xyz";
    targetHeaders.set("Origin", allowedOrigin);
    targetHeaders.set("Referer", allowedOrigin + "/");
    targetHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    targetHeaders.set("Accept", "*/*");
    
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

    // Convert Headers to plain object for maximum compatibility
    const finalHeaders: Record<string, string> = {};
    targetHeaders.forEach((v, k) => {
      finalHeaders[k] = v;
    });
    
    // Explicitly set common casings just in case the target is case-sensitive
    finalHeaders["x-api-key"] = serverApiKey;
    finalHeaders["X-API-KEY"] = serverApiKey;
    finalHeaders["X-Api-Key"] = serverApiKey;
    finalHeaders["api-key"] = serverApiKey;
    finalHeaders["API-KEY"] = serverApiKey;
    finalHeaders["Authorization"] = `Bearer ${serverApiKey}`;
    finalHeaders["authorization"] = `Bearer ${serverApiKey}`;

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: finalHeaders,
      body,
      cache: "no-store",
      credentials: 'omit',
    };

    if (body) {
      // @ts-ignore
      fetchOptions.duplex = 'half';
    }

    const res = await fetch(url, fetchOptions);

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
    responseHeaders.set("X-Proxy-Target", url);
    responseHeaders.set("X-Proxy-Key-Prefix", serverApiKey.substring(0, 5));

    if (res.status === 401 || res.status === 403) {
      const errorBody = await res.clone().text();
      console.error(`[Shelby Proxy ${requestId}] ${res.status} Error from target. Body: ${errorBody}`);
      
      // Log headers for debugging (redacted)
      const debugHeaders: Record<string, string> = {};
      Object.entries(finalHeaders).forEach(([k, v]) => {
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
