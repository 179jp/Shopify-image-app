/**
 * AdminAPI からの商品情報の取得
 */
import { json } from "@remix-run/node";
import { JsonFormat } from "./JsonFormat";

export const readImageSetting = async ({ admin, handle }) => {
  const response = await admin.graphql(`
{ 
  metaobjectByHandle(handle: { type: "image_settings" handle: "${handle}"}) {
    id
    type
    handle
    fields {
      key
      value
      type
      reference {
        __typename
        ... on Product {
          id
          title
        }
        ... on Collection {
          id
          title
        }
      }
    }
  }
}`);
  const {
    data: { metaobjectByHandle },
  } = await response.json();
  return formatImageSetting(metaobjectByHandle);
};

// AdminAPIからの返り値を整形する
const formatImageSetting = (imageSetting) => {
  if (!imageSetting || imageSetting.id === null) return null;
  const collections = imageSetting.fields.find(
    (field) => field.key === "collections",
  );
  const recommendProduct = imageSetting.fields.find(
    (field) => field.key === "recommend_product",
  );
  const selectedTags = imageSetting.fields.find(
    (field) => field.key === "tags",
  );
  return {
    id: imageSetting.id,
    type: imageSetting.type,
    handle: imageSetting.handle,
    collections: collections && collections.value ? collections.value : [],
    recommendProduct:
      recommendProduct && recommendProduct.value ? recommendProduct.value : [],
    selectedTags: selectedTags && selectedTags.value ? selectedTags.value : [],
  };
};

export const upsertImageSetting = async ({ admin, imageSetting }) => {
  const { collections, imageId, fileId, patterns, recommendProduct, tags } =
    imageSetting;
  const mutation = `
mutation UpsertMetaobject($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
    metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
      metaobject {
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
  const variables = {
    handle: {
      type: "image_settings",
      handle: imageId,
    },
    metaobject: {
      capabilities: {
        publishable: {
          status: "ACTIVE",
        },
      },
      fields: [
        {
          key: "image",
          value: fileId,
        },
        {
          key: "patterns",
          value: patterns,
        },
        {
          key: "collections",
          value: collections,
        },
        {
          key: "tags",
          value: tags,
        },
        {
          key: "recommendProduct",
          value: recommendProduct,
        },
      ],
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
    return true;
  } catch (error) {
    console.error("エラー:", error);
    return json({ error: "エラーが発生しました。" }, { status: 500 });
  }
};
