import { useState, useEffect, useCallback } from "react";
import { json } from "@remix-run/node";
import { useFetcher, redirect } from "@remix-run/react";

// Models
import { readCollections } from "../models/Collections.server.js";
import { readFiles, searchFiles } from "../models/File.server.js";
import {
  readImageSettingsWithReference,
  updateImageSetting,
  upsertImageSetting,
} from "../models/ImageSetting.server.js";
import { readPatterns } from "../models/Patterns.server.js";
import { readProducts } from "../models/Products.server.js";
import { upsertProductOnImage } from "../models/ProductOnImage.server.js";
import { readTags } from "../models/Tags.server.js";
import { publishApi } from "../models/Api.server.js";

// Components
import {
  Icon,
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import {
  MeasurementSizeIcon,
  SearchIcon,
  SortIcon,
} from "@shopify/polaris-icons";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useLoaderData } from "react-router-dom";
import { authenticate } from "../shopify.server";

import { BulkPanel } from "../components/BulkPanel.jsx";
import { ImagesCards } from "../components/ImageCards";
import { Loading } from "../components/Loading";

import "../components/default.css";
import "../components/css/images.css";
import { boxShadowLv2 } from "../components-styled/config";

const pageWrapStyle = {
  backgroundColor: "rgb(248, 248,248)",
  boxShadow: boxShadowLv2,
  borderRadius: ".75rem",
  padding: "20px",
};

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  // ファイルを取得する
  const files = await readFiles({ admin, first: 250 });

  // コレクションを取得する
  const collections = await readCollections({ admin });
  // 色柄の情報を取得する
  const patterns = await readPatterns({ admin });
  // タグ情報を取得する
  const tags = await readTags({ admin });
  // 商品情報を取得する
  const products = await readProducts({ admin });

  // MediaObeject の image_settings を取得する
  const imageSettings = await readImageSettingsWithReference({ admin });

  return json({
    collections,
    files,
    images: imageSettings,
    patterns,
    products,
    tags,
  });
};

export const action = async ({ request }) => {
  const method = request.method;
  if (method === "GET") {
    // URL から filter を取得する
    const body = await request.formData();
    const filterName = body.get("name");
    const sortBy = body.get("sortBy") ? body.get("sortBy") : "first";

    const isSortReverse = sortBy === "last" ? true : false;
    const filenameQuery = filterName ? `filename:${filterName}` : "";
    const { admin } = await authenticate.admin(request);
    // ファイルの検索
    const files = await searchFiles({ admin, filenameQuery, isSortReverse });

    return json({
      files,
    });
  } else if (method === "POST") {
    console.log("Bulk Change - POST");
    const body = await request.formData();
    const ids = JSON.parse(body.get("ids"));
    const productIds = JSON.parse(body.get("productIdsOnImage"));
    const productIdsOnImage = body.get("productIdsOnImage");
    const collections = body.get("collections");
    const patterns = body.get("patterns");
    const tags = body.get("tags");

    if (!ids && ids.length === 0)
      return json({ message: "No files selected" }, { status: 400 });

    const { admin } = await authenticate.admin(request);

    // idごとに更新
    const upsertPromises = ids.map((id) => {
      return upsertData({
        admin,
        data: {
          id,
          productIds,
          productIdsOnImage,
          collections,
          patterns,
          tags,
        },
      });
    });
    // 全て更新が完了したら API 書き出し
    const upsertResult = await Promise.all(upsertPromises).then((results) => {
      return true;
    });
    if (upsertResult) {
      // APIデータ書き出し
      const publishResult = await publishApi({ admin });
      if (publishResult) {
        return redirect(request.url);
      }
    }
  }
};

const upsertData = async ({ admin, data }) => {
  const { id, productIds, productIdsOnImage, collections, patterns, tags } =
    data;
  // handle
  const handle = "image_" + id.replace("gid://shopify/MediaImage/", "");
  // imageSettingのupsert
  const result = await upsertImageSetting({
    admin,
    imageSetting: {
      imageId: handle,
      collections,
      products: productIdsOnImage,
      fileId: id,
      patterns,
      recommendProduct: null,
      tags,
    },
  });
  // ProductOnImage の保存処理
  if (result && result.id && productIds && productIds.length > 0) {
    const imageSettingId = result.id;
    const upsertProductOnImagePromises = productIds.map((productId) => {
      const productHandle =
        handle.replace("image_", "") +
        "-" +
        productId.replace("gid://shopify/Product/", "");
      // 一括登録の場合、x, y は固定値（画像中央）
      const productData = {
        x: 50,
        y: 50,
        product: {
          id: productId,
        },
      };
      return upsertProductOnImage({
        admin,
        imageSettingId,
        handle: productHandle,
        product: productData,
      });
    });
    const upsertProductOnImageResult = await Promise.all(
      upsertProductOnImagePromises,
    ).then((results) => {
      const productOnImageIds = results.map((result) => result.id);
      return updateImageSetting({
        admin,
        imageSetting: {
          id: imageSettingId,
          productsOnImage: JSON.stringify(productOnImageIds),
        },
      });
    });
    if (upsertProductOnImageResult) return true;
  } else if (!productIdsOnImage || productIdsOnImage.length === 0) {
    return true;
  }
};

export default function Index() {
  const shopify = useAppBridge();
  const fetcher = useFetcher();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const loadingText =
    fetcher.state === "loading" ? "読み込み中です" : "保存しています";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  // Filter
  const [fileSort, setFileSort] = useState("first");
  const handleFilterChange = (e) => {
    const formData = new FormData(e.currentTarget);
    const newQuery = {
      name: formData.get("name") || "",
      sortBy: formData.get("sortBy") || "",
    };

    // 更新されたクエリでリクエストを送信
    submit(newQuery, { method: "get", action: "" });
  };
  // Grid size
  const [gridSize, setGridSize] = useState("normal");
  // Data
  const { collections, tags, patterns, products } = useLoaderData();
  const { files, images } = fetcher.data ?? useLoaderData();

  // ファイルの選択
  const [selectedImages, setSelectedImages] = useState([]);
  const handleSelection = useCallback((fileId) => {
    setSelectedImages((prev) => {
      if (prev.includes(fileId)) {
        return prev.filter((id) => id !== fileId);
      }
      return [...prev, fileId];
    });
  });

  // 一括操作
  const handleBulkChange = ({ products, collections, patterns, tags }) => {
    console.log("Bulk Change");
    fetcher.submit(
      {
        ids: JSON.stringify(selectedImages),
        productIdsOnImage:
          products.length > 0 ? JSON.stringify(products) : null,
        collections:
          collections.length > 0 ? JSON.stringify(collections) : null,
        patterns: patterns.length > 0 ? JSON.stringify(patterns) : null,
        tags: tags.length > 0 ? JSON.stringify(tags) : null,
      },
      {
        method: "POST",
      },
    );
  };

  return (
    <Page
      fullWidth
      title="Images"
      subtitle="ファイルに登録されている内容が表示されます"
      compactTitle
    >
      {isLoading && <p>Loading...</p>}
      <div style={pageWrapStyle}>
        <div className="imageFilter">
          <fetcher.Form method="post">
            <ul className="imageFilter_params">
              <li>
                <Icon source={SearchIcon} tone="base" />
                <input type="text" name="name" placeholder="ファイル名" />
                <button type="submit">検索</button>
              </li>
              <li>
                <p className="imageFilter_sub">
                  <Icon source={SortIcon} tone="base" />
                  <select
                    name="sortBy"
                    onChange={(e) => {
                      setFileSort(e.target.value);
                      fetcher.submit(
                        {
                          sortBy: e.target.value,
                        },
                        {
                          method: "POST",
                        },
                      );
                    }}
                    value={fileSort}
                  >
                    <option value="first">古い順</option>
                    <option value="last">新しい順</option>
                  </select>
                </p>
                <p className="imageFilter_sub">
                  <Icon source={MeasurementSizeIcon} tone="base" />
                  <select
                    name="gridSize"
                    onChange={(e) => {
                      setGridSize(e.target.value);
                    }}
                    value={gridSize}
                  >
                    <option value="big">大きめ</option>
                    <option value="normal">通常</option>
                    <option value="small">小さめ</option>
                    <option value="ex-small">極小</option>
                  </select>
                </p>
              </li>
            </ul>
          </fetcher.Form>
        </div>
        <ImagesCards
          files={files}
          handleSelection={handleSelection}
          grid={gridSize}
        />
      </div>
      <BulkPanel
        selectedImages={selectedImages}
        collections={collections}
        patterns={patterns}
        products={products}
        tags={tags}
        handleBulkChange={handleBulkChange}
      />
      {isLoading && <Loading text={loadingText} />}
    </Page>
  );
}
