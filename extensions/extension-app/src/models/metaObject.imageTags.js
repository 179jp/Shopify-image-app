import { endpoint, storefrontAccessToken } from "./shopify.storefront";

export const fetchTags = async ({ handle }) => {
  const query = `
    query GetMetaobject($handle: MetaobjectHandleInput!) {
      metaobject(handle: $handle) {
        id
        type
        handle
        value: field(key: "value") {
          value
        }
      }
    }
  `;

  const variables = {
    handle: {
      type: "image_app_api",
      handle: "image_tags",
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  });

  const { data } = await response.json();
  const tags = JSON.parse(data.metaobject.value.value);
  const id = tags.find((tag) => tag.handle === handle).id;
  const selectedTags = tags.filter((tag) => tag.id === id || tag.parent === id);
  return selectedTags;
};
