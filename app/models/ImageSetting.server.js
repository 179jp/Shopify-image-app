/**
 * AdminAPI から MetaObject の ImageSetting
 */
import { json } from "@remix-run/node";
import { JsonFormat } from "./JsonFormat";

export const readImageSettingsWithReference = async ({
  admin,
  first = 250,
  after = null,
}) => {
  const mediaObjectType = "image_settings";
  const pager = after ? `, after: "${after}"` : "";
  const imageSettingsResponse = await admin.graphql(`
    { 
    metaobjects(type:"${mediaObjectType}", first: ${first}${pager}) {
      edges {
        node {
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
              ... on MediaImage {
                id
                preview {
                  image {
                    url
                    altText
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
      metaobjects: { edges: imageSettings },
    },
  } = await imageSettingsResponse.json();

  // ToDo:
  // imageSettings の整形
  return imageSettings;
};

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
  const patterns = imageSetting.fields.find(
    (field) => field.key === "patterns",
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
    patterns: patterns && patterns.value ? JSON.parse(patterns.value) : [],
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
    products,
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
  ];
  if (patterns && patterns != "null" && patterns.length > 0) {
    fields.push({
      key: "patterns",
      value: patterns,
    });
  }
  if (collections && collections != "null" && collections.length > 0) {
    fields.push({
      key: "collections",
      value: collections,
    });
  }
  if (tags && tags != "null" && tags.length > 0) {
    fields.push({
      key: "tags",
      value: tags,
    });
  }
  if (products && products != "null" && products.length > 0) {
    fields.push({
      key: "products",
      value: products,
    });
  }
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

export const updateImageSetting = async ({ admin, imageSetting }) => {
  const { id, productsOnImage } = imageSetting;
  const mutation = `
mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject {
        id
        products_on_image: field(key: "products_on_image") {
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
      key: "products_on_image",
      value: productsOnImage,
    },
  ];

  const variables = {
    id,
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
    console.log("upsertImageSetting", response);

    if (errors && errors.length > 0) {
      console.error("GraphQL エラー:", errors);
      return json({ errors }, { status: 400 });
    }
    if (data.metaobjectUpdate.userErrors.length > 0) {
      console.error("ユーザーエラー:", data.metaobjectUpdate.userErrors);
      return json(
        { errors: data.metaobjectUpdate.userErrors },
        { status: 400 },
      );
    }
    // 成功した場合の処理
    // id を取得
    const id = data.metaobjectUpdate.metaobject.id;
    console.log("upsertImageSetting - success", data);
    return {
      id,
    };
  } catch (error) {
    console.error("エラー:", error);
    return json({ error: "エラーが発生しました。" }, { status: 500 });
  }
};
