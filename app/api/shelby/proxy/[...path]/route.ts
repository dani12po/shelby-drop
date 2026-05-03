import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shelby RPC Proxy
 * 
 * This proxy is used in development to bypass Origin header restrictions
 * imposed by the Shelby RPC server. It forwards requests to the real
 * Shelby RPC nodes while overriding the Origin and Host headers.
 */
async function handleProxy(req: Request, { params }: { params: { path: string[] } }) {
  try {
    const pathParts = params.path;
    if (!pathParts || pathParts.length < 1) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const network = pathParts[0]; // 'testnet' or 'shelbynet'
    const remainingPath = pathParts.slice(1).join("/");
    
    const targetBase = network === "shelbynet" 
      ? "https://api.shelbynet.shelby.xyz/shelby" 
      : "https://api.testnet.shelby.xyz/shelby";
      
    const url = `${targetBase}/${remainingPath}${new URL(req.url).search}`;

    const headers = new Headers();
    
    // Copy ALL headers from original request to ensure we don't miss any API keys or auth tokens
    // The Shelby SDK might use different header names (x-api-key, authorization, etc.)
    req.headers.forEach((value, key) => {
      // Skip host and origin as we override them below
      if (!["host", "origin", "referer", "connection", "content-length"].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // ALWAYS inject/override the API key from environment variables
    // This ensures the proxy uses the correct key regardless of what the client sends.
    const apiKey = process.env.SHELBY_RPC_API_KEY || process.env.SHELBY_API_KEY;
    if (apiKey) {
      headers.set("x-api-key", apiKey);
      console.log(`[Shelby Proxy] Injected API Key: ${apiKey.substring(0, 5)}...`);
    } else {
      console.warn(`[Shelby Proxy] WARNING: No API key found in environment variables!`);
    }

    // CRITICAL: Override the Origin and Referer headers to match what the Shelby RPC expects.
    // We use a "safe" origin that is known to be allowed by most Shelby API keys.
    // If SHELBY_ORIGIN is set and is NOT localhost, we use it. Otherwise we use the explorer.
    let expectedOrigin = process.env.SHELBY_ORIGIN;
    if (!expectedOrigin || expectedOrigin.includes("localhost") || expectedOrigin.includes("127.0.0.1")) {
      expectedOrigin = "https://explorer.shelby.xyz";
    }
    
    headers.set("Origin", expectedOrigin);
    headers.set("Referer", expectedOrigin + "/");
    
    // Ensure we don't have any localhost references in other headers
    headers.delete("host"); // Let fetch set it
    
    console.log(`[Shelby Proxy] ${req.method} -> ${url}`);
    console.log(`[Shelby Proxy] Outgoing Headers:`);
    headers.forEach((v, k) => {
      const isSensitive = ["authorization", "x-api-key"].includes(k.toLowerCase());
      console.log(`  ${k}: ${isSensitive ? v.substring(0, 10) + "..." : v}`);
    });

    // Read body into buffer to ensure it's sent correctly
    let body: any = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.arrayBuffer();
      console.log(`[Shelby Proxy] Body length: ${body.byteLength} bytes`);
    }

    const res = await fetch(url, {
      method: req.method,
      headers,
      body,
      // @ts-ignore - duplex is needed for streaming bodies in Node.js fetch
      duplex: 'half'
    });

    console.log(`[Shelby Proxy] Target Response: ${res.status} ${res.statusText}`);

    // Log error response from target
    if (!res.ok) {
      const errorClone = res.clone();
      const errorText = await errorClone.text().catch(() => "could not read error body");
      console.error(`[Shelby Proxy] Target Error Body:`, errorText);
    }

    // Copy response headers, but handle CORS
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      // Skip some headers that might cause issues
      if (!["content-encoding", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });
    
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
