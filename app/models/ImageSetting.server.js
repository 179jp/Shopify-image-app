/**
 * AdminAPI から MetaObject の ImageSetting
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
  const recommendProducts = imageSetting.fields.find(
    (field) => field.key === "recommend_products",
  );
  const selectedTags = imageSetting.fields.find(
    (field) => field.key === "tags",
  );
  const productsOnImage = imageSetting.fields.find(
    (field) => field.key === "products_on_image",
  );
  return {
    id: imageSetting.id,
    type: imageSetting.type,
    handle: imageSetting.handle,
    collections:
      collections && collections.value ? JSON.parse(collections.value) : [],
    recommendProducts:
      recommendProducts && recommendProducts.value
        ? JSON.parse(recommendProducts.value)
        : [],
    selectedTags:
      selectedTags && selectedTags.value ? JSON.parse(selectedTags.value) : [],
    productsOnImage:
      productsOnImage && productsOnImage.value
        ? JSON.parse(productsOnImage.value)
        : [],
  };
};

export const upsertImageSetting = async ({ admin, imageSetting }) => {
  const {
    collections,
    imageId,
    productsOnImage,
    fileId,
    patterns,
    recommendProduct,
    tags,
  } = imageSetting;
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
      key: "products",
      value: productsOnImage,
    },
  ];
  if (
    recommendProduct &&
    recommendProduct != "null" &&
    recommendProduct.length > 0
  ) {
    fields.push({
      key: "recommend_products",
      value: recommendProduct,
    });
  }

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
      fields,
    },
  };
  try {
    // API リクエストを送信
    const response = await admin.graphql(mutation, {
      variables,
    });
    const { data, errors } = await response.json();
    console.log("upsertImageSetting", response);

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
    // 成功した場合の処理
    // id を取得
    const id = data.metaobjectUpsert.metaobject.id;
    console.log("upsertImageSetting - success", data);
    return {
      id,
    };
  } catch (error) {
    console.error("エラー:", error);
    return json({ error: "エラーが発生しました。" }, { status: 500 });
  }
};
