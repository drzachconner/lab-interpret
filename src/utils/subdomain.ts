/**
 * Utility functions for handling subdomain-based tenant routing
 */

export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // Skip localhost, direct IPs, and all Lovable hosts (treat as main domain)
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname) ||
    hostname.includes('lovable.dev') ||
    hostname.includes('lovable.app') ||
    hostname.includes('lovableproject.com')
  ) {
    return null;
  }
  
  // Split hostname by dots
  const parts = hostname.split('.');
  
  // Need at least 3 parts for a subdomain (subdomain.domain.tld)
  if (parts.length < 3) {
    return null;
  }
  
  // Return the first part as the subdomain
  const subdomain = parts[0];
  
  // Filter out common non-tenant subdomains
  const systemSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp'];
  if (systemSubdomains.includes(subdomain.toLowerCase())) {
    return null;
  }
  
  return subdomain;
};

export const isMainDomain = (): boolean => {
  return getSubdomain() === null;
};

export const getMainDomainUrl = (): string => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  
  // For localhost, return as-is
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}${port}`;
  }
  
  // For production, remove subdomain
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const mainDomain = parts.slice(1).join('.');
    return `${protocol}//${mainDomain}${port}`;
  }
  
  return `${protocol}//${hostname}${port}`;
};