import { json } from "stream/consumers";

export const readPatterns = async ({ admin }) => {
  const response = await admin.graphql(`
    {
      metaobjects(type: "pattern", first: 250) {
        edges {
          node {
            id
            name: field(key: "name") {
              value
            }
            kana: field(key: "kana") {
              value
            }
            color: field(key: "color") {
              value
            }
            number: field(key: "number") {
              value
            }
            description: field(key: "description") {
              value
            }
          }
        }
      }
    }`);
  const {
    data: {
      metaobjects: { edges },
    },
  } = await response.json();
  const patterns = edges.map(({ node }) => {
    return {
      id: node.id,
      name: node.name.value,
      kana: node.kana.value,
      color: node.color.value,
      number: node.number.value,
      description: node.description.value,
    };
  });
  return patterns;
};

export const readPatternsWithReferencedBy = async ({ admin }) => {
  const response = await admin.graphql(`
    {
      metaobjects(type: "pattern", first: 250) {
        edges {
          node {
            id
            name: field(key: "name") {
              value
            }
            kana: field(key: "kana") {
              value
            }
            color: field(key: "color") {
              value
            }
            number: field(key: "number") {
              value
            }
            description: field(key: "description") {
              value
            }
            image: field(key: "image") {
              value
            }
            category: field(key: "category") {
              value
            }
            referencedBy(first:250) {
              edges {
                node {
                  referencer {
                    __typename
                    ... on Metaobject {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`);
  const {
    data: {
      metaobjects: { edges },
    },
  } = await response.json();
  const patterns = edges.map(({ node }) => {
    const referencedIds = node.referencedBy.edges.map(({ node }) => {
      return node.referencer.id;
    });
    return {
      id: node.id,
      name: node.name.value,
      kana: node.kana.value,
      color: node.color.value,
      number: node.number.value,
      description: node.description.value,
      referencedIds,
    };
  });
  return patterns;
};

export const createPattern = async ({ admin, addPattern }) => {
  const mutation = `#graphql
    mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject {
          type
          fields {
            key
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // JSONの文字列に変換
  //const category = json(addPattern.category);
  const variables = {
    metaobject: {
      type: "pattern",
      fields: [
        {
          key: "name",
          value: addPattern.name,
        },
        {
          key: "kana",
          value: addPattern.kana,
        },
        {
          key: "color",
          value: addPattern.colorName,
        },
        {
          key: "number",
          value: addPattern.number,
        },
        {
          key: "description",
          value: addPattern.description,
        },
        /*
        {
          key: "category",
          value: category,
        },
        */
      ],
    },
  };

  try {
    // API リクエストを送信
    const response = await admin.graphql(mutation, {
      variables,
    });
    console.log(addPattern.name);
    return response;
  } catch (error) {
    return error;
  }
};
