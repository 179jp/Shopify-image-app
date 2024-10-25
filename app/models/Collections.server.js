/**
 * AdminAPI からのコレクションの取得
 */

const query = `
{
  collections(first: 200) {
    nodes {
      id
      title
      products(first: 50) {
        nodes {
          id
          title
        }
      }
    }
  }
}`;

export const readCollections = async ({ admin }) => {
  const response = await admin.graphql(query);
  const {
    data: {
      collections: { nodes: collections },
    },
  } = await response.json();
  return collections;
};
