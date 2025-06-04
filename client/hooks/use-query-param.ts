import { useLocation } from 'wouter';

/**
 * A hook to get a specific query parameter from the URL
 * @param param The name of the query parameter to get
 * @returns The value of the query parameter, or null if it doesn't exist
 */
export function useQueryParam(param: string): string | null {
  const [location] = useLocation();
  
  // Use URLSearchParams to parse the query string
  const url = new URL(window.location.href);
  return url.searchParams.get(param);
}