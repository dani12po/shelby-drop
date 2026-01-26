interface SignOptions {
  expiresIn?: number;
}

export function signObjectUrl(objectKey: string, options: SignOptions): string {
  // For production: Implement actual signing with your S3 gateway
  // This would typically involve:
  // 1. Getting credentials from your auth system
  // 2. Using AWS SDK or similar to generate presigned URLs
  // 3. Including proper signature headers
  
  const gatewayOrigin = process.env.NEXT_PUBLIC_S3_GATEWAY_ORIGIN || "https://gateway.shelby.xyz";
  const baseUrl = `${gatewayOrigin}/${objectKey}`;
  
  if (options.expiresIn) {
    const expiry = Date.now() + (options.expiresIn * 1000);
    return `${baseUrl}?signed=1&expires=${expiry}`;
  }
  
  return `${baseUrl}?signed=1`;
}
