/**
 * AdminAPI から MetaObject の ProductOnImage
 */
import { json } from "@remix-run/node";
import { JsonFormat } from "./JsonFormat";

export const readProductOnImage = async ({ admin, productOnImageId }) => {
  const mediaObjectType = "product_on_image";
  const query = `
  query GetMetaobjectWithReferences($id: ID!) {
    metaobject(id: $id) {
      id
      type
      handle
      fields {
        key
        value
        reference {
          __typename
          ... on Metaobject {
            id
            type
            handle
            fields {
              key
              value
              # 必要に応じてネストされたリファレンスをさらに取得可能
            }
          }
          ... on Product {
            id
            title
          }
        }
      }
    }
  }`;
  const variables = {
    id: productOnImageId,
  };
  const response = await admin.graphql(query, {
    variables,
  });
  const {
    data: { metaobject: productsOnImage },
  } = await response.json();
  return formatProductsOnImage(productsOnImage);
};

// AdminAPIからの返り値を整形する
const formatProductsOnImage = (productsOnImage) => {
  if (!productsOnImage || productsOnImage.id === null) return null;
  const image = productsOnImage.fields.find((field) => field.key === "image");
  const x = productsOnImage.fields.find((field) => field.key === "position_x");
  const y = productsOnImage.fields.find((field) => field.key === "position_y");
  const product = productsOnImage.fields.find(
    (field) => field.key === "product",
  );
  return {
    id: productsOnImage.id,
    type: productsOnImage.type,
    handle: productsOnImage.handle,
    image: image && image.value ? image.value : null,
    x: x && x.value ? x.value : null,
    y: y && y.value ? y.value : null,
    product: {
      id: product && product.value ? product.value : null,
      title:
        product && product.reference.title ? product.reference.title : null,
    },
  };
};

export const upsertProductOnImage = async ({
  admin,
  imageSettingId,
  product,
  handle,
}) => {
  const mediaObjectType = "product_on_image";
  const mutation = `
  mutation UpsertMetaobject($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
    metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
      metaobject {
        id
        handle
        capabilities {
          publishable {
            status
          }
        }
        fields {
          key
          value
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }`;
  const fields = [
    {
      key: "image",
      value: imageSettingId,
    },
    {
      key: "position_x",
      value: product.x.toFixed(1),
    },
    {
      key: "position_y",
      value: product.y.toFixed(1),
    },
    {
      key: "product",
      value: product.product.id,
    },
  ];

  console.log("debug - fields", fields, handle);

  const variables = {
    handle: {
      type: "product_on_image",
      handle: handle,
    },
    metaobject: {
      fields,
    },
  };

  try {
    // API リクエストを送信
    const response = await admin.graphql(mutation, {
      variables,
    });
    const { data, errors } = await response.json();

    if (errors && errors.length > 0) {
      console.error("GraphQL エラー:", errors);
      return json({ errors }, { status: 400 });
    }
    if (data.metaobjectUpsert.userErrors.length > 0) {
      console.error("ユーザーエラー:", data.metaobjectUpsert.userErrors);
      return json(
        { errors: data.metaobjectUpsert.userErrors },
        { status: 400 },
      );
    }
    // 成功した場合の処理（例: リダイレクト）
    const id = data.metaobjectUpsert.metaobject.id;
    return {
      id,
    };
  } catch (error) {
    console.error("エラー:", error);
    return json({ error: "エラーが発生しました。" }, { status: 500 });
  }
};
