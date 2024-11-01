// Storefront API エンドポイントとアクセストークンの設定
const storefrontAccessToken = STOREFRONT_API_KEY; // 取得したアクセストークンを設定
const storefrontApiVersion = "2024-10"; // 使用する API バージョンを指定
const shopDomain = STOREFRONT_API_URL + ".myshopify.com"; // ショップのドメインを設定

// GraphQL エンドポイント
const endpoint = `https://${shopDomain}/api/${storefrontApiVersion}/graphql.json`;

const fetchImageSettings = require("./models_imageSettings.js");

const images = fetchImageSettings({ endpoint, storefrontAccessToken });
console.log(images);
