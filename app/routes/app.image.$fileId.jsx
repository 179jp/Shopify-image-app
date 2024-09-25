import React, { useState, useEffect, useCallback } from "react";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import axios from "axios";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  InlineStack,
} from "@shopify/polaris";

import { UnitTitle } from "../components/UnitTitle";
import { ProductUnit } from "../components/ProductUnit";
import { CheckBoxUnit } from "../components/CheckBoxUnit";
import { ImageDetailPage } from "../components/ImageDetailPage";

import prisma from "../db.server";

import "../components/default.css";
import "../components/imageDetailPage.css";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { fileId } = params;

  // fileId から画像情報を取得する
  const queryFileId = decodeURIComponent(fileId).replace(
    "gid://shopify/MediaImage/",
    "",
  );
  const fileResponse = await admin.graphql(`
    {
      files(first: 1, query: "id:${queryFileId}") {
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
      files: {
        nodes: [file],
      },
    },
  } = await fileResponse.json();

  // 商品情報を取得する
  const productResponse = await admin.graphql(`
    {
      products(first: 50) {
        nodes {
          id
          title
        }
      }
    }`);
  const {
    data: {
      products: { nodes: products },
    },
  } = await productResponse.json();

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

  // fileId から画像とタグ情報を取得する
  const image = await prisma.Image.findUnique({
    where: { fileId: fileId },
    include: {
      tags: true,
    },
  });
  const tags = await prisma.tag.findMany();
  return { collections, file, image, products, tags };
};

export const action = async ({ request }) => {};

export default function Image() {
  const { collections, file, image, products, tags } = useLoaderData();

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

  return (
    <Page
      backAction={{ content: "Products", url: "#" }}
      fullWidth
      title={`${name}.${ext}`}
      subtitle={`${file.image.width}×${file.image.height}`}
      compactTitle
      primaryAction={{ content: "Save", disabled: true }}
      secondaryActions={[
        {
          content: "Duplicate",
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
        {
          content: "View on your store",
          onAction: () => alert("View on your store action"),
        },
      ]}
      actionGroups={[
        {
          title: "Promote",
          actions: [
            {
              content: "Share on Facebook",
              accessibilityLabel: "Individual action label",
              onAction: () => alert("Share on Facebook action"),
            },
          ],
        },
      ]}
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <ImageDetailPage
        file={file}
        collections={collections}
        products={products}
        tags={tags}
      />
    </Page>
  );
}
