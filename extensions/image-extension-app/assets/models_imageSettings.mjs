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

export const fetchImageSettings = async ({
  endpoint,
  storefrontAccessToken,
}) => {
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
  return data.metaobjects.edges;
};
