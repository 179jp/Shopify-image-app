import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
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
import { SearchIcon, SortIcon } from "@shopify/polaris-icons";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useLoaderData } from "react-router-dom";
import { authenticate } from "../shopify.server";

import { ImagesCards } from "../components/ImageCards";
import { ImageDetailPage } from "../components/ImageDetailPage";

import prisma from "../db.server";

import "../components/default.css";
import "../components/imageFilter.css";
import { boxShadowLv2 } from "../components-styled/config";

const pageWrapStyle = {
  backgroundColor: "rgb(248, 248,248)",
  boxShadow: boxShadowLv2,
  borderRadius: ".75rem",
  padding: "20px",
};

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const filesResponse = await admin.graphql(`
    {
      files(first: 100) {
        nodes {
          id
          createdAt
            ... on MediaImage {
              id
              image {
                id
                originalSrc
                width
                height
              }
            }
        }
      }
    }`);
  const {
    data: {
      files: { nodes },
    },
  } = await filesResponse.json();
  // コレクションを取得する
  const collectionResponse = await admin.graphql(`
    {
      collections(first: 200) {
        nodes {
          id
          title
          products(first: 50) {
            nodes {
              id
              title
            }
          }
        }
      }
    }`);
  const {
    data: {
      collections: { nodes: collections },
    },
  } = await collectionResponse.json();

  // MediaObeject の image_settings を取得する
  const mediaObjectType = "image_settings";
  const imageSettingsResponse = await admin.graphql(`
    { 
    metaobjects(type:"${mediaObjectType}", first: 100) {
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

  return json({
    files: nodes,
    images: imageSettings,
  });
};

export const action = async ({ request }) => {
  // URL から filter を取得する
  const body = await request.formData();
  const filterName = body.get("name");
  const sortBy = body.get("sortBy") ? body.get("sortBy") : "first";

  const isSortReverse = sortBy === "last" ? true : false;
  const filenameQuery = filterName ? `filename:${filterName}` : "";
  const { admin } = await authenticate.admin(request);
  const filesResponse = await admin.graphql(`
    {
      files(first: 100, sortKey: CREATED_AT, reverse: ${isSortReverse}, query: "${filenameQuery}") {
        nodes {
          id
          createdAt
            ... on MediaImage {
              id
              image {
                id
                originalSrc
                width
                height
              }
            }
        }
      }
    }`);
  const {
    data: {
      files: { nodes },
    },
  } = await filesResponse.json();
  // コレクションを取得する
  const collectionResponse = await admin.graphql(`
    {
      collections(first: 200) {
        nodes {
          id
          title
          products(first: 50) {
            nodes {
              id
              title
            }
          }
        }
      }
    }`);
  const {
    data: {
      collections: { nodes: collections },
    },
  } = await collectionResponse.json();

  // DB から images を取得
  // const images = await prisma.image.findMany();
  const images = await prisma.Image.findMany();
  return json({
    files: nodes,
    images,
  });
};

export default function Index() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  // Filter
  const [fileSort, setFileSort] = useState("last");
  const [fileName, setFileName] = useState(null);
  const handleFilterChange = (e) => {
    const formData = new FormData(e.currentTarget);
    const newQuery = {
      name: formData.get("name") || "",
      sortBy: formData.get("sortBy") || "",
    };

    // 更新されたクエリでリクエストを送信
    submit(newQuery, { method: "get", action: "" });
  };

  const { files, collections, images } = fetcher.data ?? useLoaderData();

  const [selectedFile, setSelectedFile] = useState(null);
  const handleSelection = useCallback((file) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    // 画像URLからファイル名と拡張子を取得する
    const fileName = file.image.originalSrc.split("/").pop();
    const [name, ext_string] = fileName.split(".");
    let ext = ext_string;
    // 拡張子に ? が含まれている場合、? 以降を除去する。同時に大文字に変換する
    if (ext.includes("?")) {
      ext = ext.split("?")[0].toUpperCase();
    } else {
      ext = ext.toUpperCase();
    }
    // images にデータがあれば、それをセットする
    const imageData = images.find((image) => image.fileId === file.id);
    file.ext = ext;
    file.name = name;
    file.imageData = imageData;
    setSelectedFile(file);
  });

  const isDetailPage = selectedFile && selectedFile.image ? true : false;

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <Page
      fullWidth
      title="Images"
      subtitle="ファイルに登録されている内容が表示されます"
      compactTitle
    >
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
                >
                  <option value="first">新しい順</option>
                  <option value="last">古い順</option>
                </select>
              </li>
            </ul>
          </fetcher.Form>
        </div>
        <ImagesCards files={files} handleSelection={handleSelection} />
      </div>
    </Page>
  );
}
