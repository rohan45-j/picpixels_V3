// src/lib/fetch.ts
// Utility wrapper around fetch that returns JSON and leverages Next.js built‑in caching.
// By default we do NOT specify a cache option, allowing Next.js to cache
// the response according to standard HTTP caching headers.

export async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error(`Failed to fetch ${url}: ${resp.status}`);
      return null;
    }
    const data = (await resp.json()) as T;
    return data;
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return null;
  }
}
