/**
 * AdminAPI で API 使用用のデータを書き出す
 */
import { json } from "@remix-run/node";

import { readImageSettingsWithReference } from "./ImageSetting.server";
import { readTagsWithReferencedBy } from "./Tags.server";

const makeApiData = ({ data, tags }) => {
  const apiData = {};
  tags.forEach(({ id, handle, name }) => {
    apiData[tag.handle] = [];
  });
};

export const publishApi = async ({ admin, imageSetting }) => {
  // データを取得
  const data = await readImageSettingsWithReference({ admin });

  // API 用の項目を取得
  const tags = await readTagsWithReferencedBy({ admin });

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
      key: "mode",
      value: "image_tags",
    },
    {
      key: "value",
      value: JSON.stringify(tags),
    },
  ];

  const variables = {
    handle: {
      type: "image_app_api",
      handle: "image_tags",
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
    return {
      id,
    };
  } catch (error) {
    console.error("エラー:", error);
    return json({ error: "エラーが発生しました。" }, { status: 500 });
  }
};
