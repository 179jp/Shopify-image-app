/**
 * AdminAPI からの商品情報の取得
 */

const query = `
{
  products(first: 100) {
    nodes {
      id
      title
      images(first: 1) {
        edges {
          node {
            originalSrc
            altText
            width
            height
          }
        }
      }
    }
  }
}`;

export const readProducts = async ({ admin }) => {
  const response = await admin.graphql(query);
  const {
    data: {
      products: { nodes: products },
    },
  } = await response.json();
  return products;
};
