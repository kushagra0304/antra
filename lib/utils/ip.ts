/**
 * Extracts the client IP address from request headers
 * Handles various proxy headers for accurate IP detection
 */
export function getClientIP(request: Request): string {
  // Try to get IP from various headers (in order of preference)
  const headers = request.headers;
  
  // Cloudflare
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) {
    const ip = cfIP.trim();
    console.log('[IP-DEBUG] Extracted IP from cf-connecting-ip:', ip);
    return ip;
  }
  
  // X-Forwarded-For (may contain multiple IPs, take the first one)
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    if (ips[0]) {
      console.log('[IP-DEBUG] Extracted IP from x-forwarded-for:', ips[0], 'All IPs:', ips);
      return ips[0];
    }
  }
  
  // X-Real-IP
  const xRealIP = headers.get('x-real-ip');
  if (xRealIP) {
    const ip = xRealIP.trim();
    console.log('[IP-DEBUG] Extracted IP from x-real-ip:', ip);
    return ip;
  }
  
  // X-Client-IP
  const xClientIP = headers.get('x-client-ip');
  if (xClientIP) {
    const ip = xClientIP.trim();
    console.log('[IP-DEBUG] Extracted IP from x-client-ip:', ip);
    return ip;
  }
  
  // Log all available headers for debugging
  const allHeaders: Record<string, string> = {};
  headers.forEach((value, key) => {
    if (key.toLowerCase().includes('ip') || key.toLowerCase().includes('forward') || key.toLowerCase().includes('real') || key.toLowerCase().includes('client') || key.toLowerCase().includes('cf-')) {
      allHeaders[key] = value;
    }
  });
  console.warn('[IP-DEBUG] Could not extract IP, available IP-related headers:', JSON.stringify(allHeaders));
  
  // Fallback: try to get from request URL or connection
  // In serverless environments, we may not have direct access
  // Return a default or throw error
  return 'unknown';
}

