const STOREFRONT_API_URL = "179sample";
const STOREFRONT_API_KEY = "617926776e39716b2330322fd150541d";

export const storefrontAccessToken = STOREFRONT_API_KEY;
export const storefrontApiVersion = "2024-10";
export const shopDomain = STOREFRONT_API_URL + ".myshopify.com";
export const endpoint = `https://${shopDomain}/api/${storefrontApiVersion}/graphql.json`;
