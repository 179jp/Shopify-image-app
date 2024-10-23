/**
 * AdminAPI からのファイル（画像）情報の取得
 */
export const readFile = async ({ admin, queryFileId }) => {
  const response = await admin.graphql(`
{
  files(first: 1, query: "id:${queryFileId}") {
    nodes {
      id
      createdAt
      ... on MediaImage {
        id
        image {
          id
          originalSrc
          width
          height
        }
      }
    }
  }
}
`);
  const {
    data: {
      files: {
        nodes: [file],
      },
    },
  } = await response.json();
  return file;
};
