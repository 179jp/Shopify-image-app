import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
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
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useLoaderData } from "react-router-dom";
import { authenticate } from "../shopify.server";

import { ImagesCards } from "../components/ImageCards";
import { ImageDetailPage } from "../components/ImageDetailPage";

import prisma from "../db.server";

import "../components/default.css";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  // 最新の50件のファイルを取得する
  const filesResponse = await admin.graphql(`
    {
      files(first: 50) {
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

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return json({
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
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

  const { files, collections, images } = useLoaderData();

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
      title="Image Handle App"
      subtitle="ファイルに登録されている内容が表示されます"
      compactTitle
    >
      <ImagesCards files={files} handleSelection={handleSelection} />
    </Page>
  );
}