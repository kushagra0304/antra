/**
 * Extracts the client IP address from request headers
 * Handles various proxy headers for accurate IP detection
 */
export function getClientIP(request: Request): string {
  // Try to get IP from various headers (in order of preference)
  const headers = request.headers;
  
  // Cloudflare
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) return cfIP.trim();
  
  // X-Forwarded-For (may contain multiple IPs, take the first one)
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    if (ips[0]) return ips[0];
  }
  
  // X-Real-IP
  const xRealIP = headers.get('x-real-ip');
  if (xRealIP) return xRealIP.trim();
  
  // X-Client-IP
  const xClientIP = headers.get('x-client-ip');
  if (xClientIP) return xClientIP.trim();
  
  // Fallback: try to get from request URL or connection
  // In serverless environments, we may not have direct access
  // Return a default or throw error
  return 'unknown';
}

