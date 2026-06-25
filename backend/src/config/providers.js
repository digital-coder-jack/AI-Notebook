/**
 * Provider routing configuration.
 *
 * Maps the internal tier ("lite" / "pro") to the upstream provider
 * base URL and API key, read from environment variables.
 *
 * These values are NEVER exposed via any API response.
 */

export function getProviderConfig(tier) {
  if (tier === 'lite') {
    return {
      baseUrl: process.env.LITE_PROVIDER_BASE_URL || 'https://api.groq.com/openai/v1',
      apiKey: process.env.LITE_PROVIDER_API_KEY || '',
    };
  }
  if (tier === 'pro') {
    return {
      baseUrl: process.env.PRO_PROVIDER_BASE_URL || 'https://api.openai.com/v1',
      apiKey: process.env.PRO_PROVIDER_API_KEY || '',
    };
  }
  return null;
}
