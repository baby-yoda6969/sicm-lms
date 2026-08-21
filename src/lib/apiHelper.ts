/**
 * Safe fetch helper for static deployments (e.g. GitHub Pages) and backend APIs.
 * Prevents "Unexpected token '<', <html> is not valid JSON" errors when API routes are not hosted on static servers.
 */
export async function safeFetchJson<T = any>(url: string, options?: RequestInit, fallbackData?: T): Promise<{ ok: boolean; data: T | null }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: true, data };
    }
    
    // Non-JSON response (e.g. HTML 404 from GitHub Pages)
    return { ok: false, data: fallbackData ?? null };
  } catch (err) {
    console.warn(`safeFetchJson: request to ${url} failed, using fallback`, err);
    return { ok: false, data: fallbackData ?? null };
  }
}
