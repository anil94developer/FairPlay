import USABET_API from "../api-services/usabet-api";

let cachedLogoUrl: string | null = null;

/**
 * Response shapes we support from content/getLogo:
 * - { logoUrl: string }
 * - { data: { logoUrl: string } }
 * - { logo: string } (url or base64)
 * - { url: string }
 * - { imageUrl: string }
 */
function parseLogoResponse(data: any): string | null {
  if (!data || typeof data !== "object") return null;
  const url =
    data.logoUrl ??
    data.data?.logoUrl ??
    (typeof data.logo === "string" ? data.logo : null) ??
    data.url ??
    data.imageUrl;
  return typeof url === "string" && url.length > 0 ? url : null;
}

const GET_LOGO_REQUEST = { key: "MXNwb3J0cy5pbg==" };

/**
 * Fetches logo URL from content/getLogo API.
 * Returns the logo URL string or null on failure. Result is cached.
 */
export async function fetchLogoUrl(): Promise<string | null> {
  if (cachedLogoUrl !== null) return cachedLogoUrl;
  try {
    const response = await USABET_API.post("/content/getLogo", GET_LOGO_REQUEST);
    const url = parseLogoResponse(response?.data);
    if (url) cachedLogoUrl = url;
    return url;
  } catch (err) {
    console.warn("[logoUtil] content/getLogo failed, using fallback:", err);
    return null;
  }
}

/**
 * Returns the API endpoint URL for the logo image (use as img src if backend serves image directly).
 */
export function getLogoEndpointUrl(): string {
  const base = USABET_API.defaults.baseURL || "";
  const path = base.endsWith("/") ? "content/getLogo" : "/content/getLogo";
  return base + path;
}

export function clearLogoCache(): void {
  cachedLogoUrl = null;
}
