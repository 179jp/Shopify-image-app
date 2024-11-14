/**
 * AdminAPI からのファイル（画像）情報の取得
 */
// 複数ファイル
export const readFiles = async ({ admin, first, after = null }) => {
  const pager = after ? `, after: "${after}"` : "";
  const response = await admin.graphql(`
    {
      files(first: ${first}${pager}) {
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
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    `);
  const {
    data: {
      files: { nodes, pageInfo },
    },
  } = await response.json();
  return {
    files: nodes,
    filesPageInfo: pageInfo,
  };
};

// ファイル検索
export const searchFiles = async ({ admin, filenameQuery, isSortReverse }) => {
  const response = await admin.graphql(`
    {
      files(first: 100, sortKey: CREATED_AT, reverse: ${isSortReverse}, query: "${filenameQuery}") {
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
    }`);
  const {
    data: {
      files: { nodes },
    },
  } = await response.json();
  return nodes;
};

// 単一ファイル
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

/*
metafields(first:10) {
          nodes {
            references {
              nodes {
                ... on Page {
                  id
                }
                ... on Product {
                  id
                }
                ... on Collection {
                  id
                }
              }
            }
          }
        }
*/
