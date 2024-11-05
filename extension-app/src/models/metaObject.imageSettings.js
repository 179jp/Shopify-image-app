import { endpoint, storefrontAccessToken } from "./shopify.storefront";

const query = `
  query GetMetaobjects($type: String!, $first: Int!, $after: String) {
    metaobjects(type: $type, first: $first, after: $after) {
      edges {
        node {
          id
          type
          handle
          fields {
            key
            value
            reference {
              __typename
              ... on Product {
                id
              }
              ... on MediaImage {
                id
                previewImage {
                  altText
                  id
                  originalSrc
                  width
                  height
                }
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// クエリ変数を設定
const variables = {
  type: "image_settings",
  first: 250,
  after: null,
};

export const fetchImageSettings = async () => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  });
  const { data } = await response.json();
  console.log(data);
  const images = data.metaobjects.edges.map(({ node }) => {
    const collections = node.fields.find(
      (field) => field.key === "collections",
    );
    const imageData = node.fields.find((field) => field.key === "image");
    const image = {
      id: imageData.reference.id,
      url: imageData.reference.previewImage.originalSrc,
      altText: imageData.reference.previewImage.altText,
      width: imageData.reference.previewImage.width,
      height: imageData.reference.previewImage.height,
    };
    const recommendProducts = node.fields.find(
      (field) => field.key === "recommend_products",
    );
    const selectedTags = node.fields.find((field) => field.key === "tags");
    const patterns = node.fields.find((field) => field.key === "patterns");
    const products = node.fields.find((field) => field.key === "products");
    const productsOnImage = node.fields.find(
      (field) => field.key === "products_on_image",
    );
    return {
      id: node.id,
      imageId: image.id,
      url: image.url,
      altText: image.altText,
      width: image.width,
      height: image.height,
      handle: node.handle,
      collections: collections ? collections.value : [],
      recommendProducts: recommendProducts ? recommendProducts.value : [],
      selectedTags: selectedTags ? selectedTags.value : [],
      patterns: patterns ? patterns.value : [],
      products: products ? products.value : [],
      productsOnImage: productsOnImage ? productsOnImage.value : [],
    };
  });
  return images;
};
