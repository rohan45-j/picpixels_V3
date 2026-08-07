// src/lib/fetch.ts
// Utility wrapper around fetch that returns JSON with timeout, retry, and Next.js caching.

export interface FetchOptions {
  timeout?: number;
  retries?: number;
  revalidate?: number;
  cache?: RequestCache;
  tags?: string[];
  // SWR pattern: serve stale content while revalidating in background
  staleWhileRevalidate?: number;
}

const DEFAULT_TIMEOUT = 8000; // 8 seconds
const DEFAULT_RETRIES = 2;
const DEFAULT_REVALIDATE = 300; // 5 minutes for static data
const DEFAULT_STALE_WHILE_REVALIDATE = 600; // 10 minutes

// In-flight request cache for deduplication
const inFlightRequests = new Map<string, Promise<any>>();

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getCacheKey(url: string, options: FetchOptions = {}): string {
  return `${url}:${options.cache}:${options.revalidate}:${JSON.stringify(options.tags)}`;
}

export async function fetchJSON<T>(
  url: string,
  opts: FetchOptions = {}
): Promise<T | null> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    revalidate = DEFAULT_REVALIDATE,
    cache = 'force-cache',
    tags = [],
    staleWhileRevalidate = DEFAULT_STALE_WHILE_REVALIDATE,
  } = opts;

  const cacheKey = getCacheKey(url, opts);
  
  // Request deduplication: return existing in-flight promise
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T | null>;
  }

  let lastError: Error | null = null;

  const fetchPromise = (async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const nextOptions: RequestInit['next'] = { 
          revalidate,
          tags: tags.length > 0 ? tags : undefined,
        };

        const resp = await fetchWithTimeout(
          url, 
          { 
            cache, 
            next: nextOptions,
            headers: {
              // Request stale-while-revalidate from CDN/Next.js
              'Cache-Control': `stale-while-revalidate=${staleWhileRevalidate}`,
            },
          }, 
          timeout
        );

        if (!resp.ok) {
          console.error(`Failed to fetch ${url}: ${resp.status}`);
          return null;
        }

        const data = (await resp.json()) as T;
        return data;
      } catch (err) {
        lastError = err as Error;

        // Don't retry on abort or non-network errors
        if (err instanceof DOMException && err.name === 'AbortError') {
          console.error(`Request timeout for ${url} after ${timeout}ms`);
          break;
        }

        if (attempt < retries) {
          const delay = Math.min(1000 * 2 ** attempt, 5000); // Exponential backoff, max 5s
          console.warn(`Retry ${attempt + 1}/${retries} for ${url} after ${delay}ms:`, err);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`Error fetching ${url} after ${retries + 1} attempts:`, lastError);
    return null;
  })();

  // Store in-flight request
  inFlightRequests.set(cacheKey, fetchPromise);
  
  try {
    return await fetchPromise;
  } finally {
    // Clean up after a delay to allow reuse for concurrent requests
    setTimeout(() => inFlightRequests.delete(cacheKey), 100);
  }
}

// High-priority fetch for critical data (hero, navigation) - uses force-cache for static generation
export async function fetchCriticalJSON<T>(
  url: string,
  opts: Omit<FetchOptions, 'cache'> = {}
): Promise<T | null> {
  return fetchJSON<T>(url, {
    ...opts,
    cache: 'force-cache', // Use force-cache for static generation compatibility
    revalidate: 60, // Short revalidate for critical data
    timeout: 5000,
    retries: 1,
  });
}

// Background fetch for non-critical data
export async function fetchBackgroundJSON<T>(
  url: string,
  opts: Omit<FetchOptions, 'cache'> = {}
): Promise<T | null> {
  return fetchJSON<T>(url, {
    ...opts,
    cache: 'force-cache',
    revalidate: 600, // 10 minutes
    timeout: 15000,
    retries: 3,
  });
}

// Prefetch function for hover-based preloading
export function prefetch(url: string, options: FetchOptions = {}): void {
  if (typeof window === 'undefined') return;
  
  // Use low priority fetch for prefetching
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  fetch(url, {
    priority: 'low',
    cache: 'force-cache',
    next: { revalidate: options.revalidate || 300 },
    signal: controller.signal,
  }).catch(() => {}).finally(() => clearTimeout(timeoutId));
}
