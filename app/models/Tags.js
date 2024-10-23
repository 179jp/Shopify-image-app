export const readTags = async ({ admin }) => {
  const tagsResponse = await admin.graphql(`
    {
      metaobjects(type: "image_tag",first: 100) {
        edges {
          node {
            id
            name: field(key: "name") {
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
  } = await tagsResponse.json();
  const tags = edges.map(({ node }) => {
    return {
      id: node.id,
      name: node.name.value,
    };
  });
  return tags;
};

const mutation = `#graphql
    mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject {
          type
          name: field(key: "name") {
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

export const createTag = async ({ admin, addTag }) => {
  const variables = {
    metaobject: {
      type: "image_tag",
      fields: [
        {
          key: "name",
          value: addTag,
        },
      ],
    },
  };

  try {
    // API リクエストを送信
    const response = await admin.graphql(mutation, {
      variables: variables,
    });

    const { data, errors } = await response.json();
    console.log("data", data, errors);

    if (errors && errors.length > 0) {
      console.error("GraphQL エラー:", errors);
      return json({ errors }, { status: 400 });
    }

    if (data.metaobjectCreate.userErrors.length > 0) {
      console.error("ユーザーエラー:", data.metaobjectCreate.userErrors);
      return json(
        { errors: data.metaobjectCreate.userErrors },
        { status: 400 },
      );
    }

    // 成功した場合の処理（例: リダイレクト）
    return true;
  } catch (error) {
    console.error("エラー:", error);
    return json({ error: "エラーが発生しました。" }, { status: 500 });
  }
};
