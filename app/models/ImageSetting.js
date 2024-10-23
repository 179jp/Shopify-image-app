/**
 * AdminAPI からの商品情報の取得
 */
export const readImageSetting = async ({ admin, queryFileId }) => {
  const response = await admin.graphql(`
{ 
  metaobjectByHandle(handle: { type: "image_settings" handle: "aaaaaa"}) {
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
