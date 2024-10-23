import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useActionData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import axios from "axios";
import {
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Icon,
  InlineStack,
  Layout,
  List,
  Page,
  Text,
} from "@shopify/polaris";
import {
  AppsIcon,
  CollectionIcon,
  FlagIcon,
  HashtagDecimalIcon,
  PlusIcon,
} from "@shopify/polaris-icons";

import { UnitTitle } from "../components/UnitTitle";
import { ProductUnit } from "../components/ProductUnit";
import { CheckBoxUnit } from "../components/CheckBoxUnit";
import { ImageDetailPage } from "../components/ImageDetailPage";
import { ProductImage } from "../components/ProductImage";
import { ProductSelecter } from "../components/ProductSelecter";
import { SelectedProducts } from "../components/SelectedProducts";

import prisma from "../db.server";

import "../components/default.css";
import "../components/imageDetailPage.css";

import {
  addNewButtonStyle,
  buttonAreaStyle,
  pageDetailStyle,
  pageDetailMainStyle,
  productSettingStyle,
  productUnitWrapStyle,
  subColumnStyle,
  subColumnUnitStyle,
  subColumnUnitDtStyle,
  polarisIconStyle,
} from "../components/imageDetailStyle.js";
import { readCollections } from "../models/Collections.js";
import { readFile } from "../models/File.js";
import { readImageSetting } from "../models/ImageSetting.js";
import { readPatterns } from "../models/Patterns.js";
import { readProducts } from "../models/Products.js";
import { createTag, readTags } from "../models/Tags.js";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { fileId } = params;

  // fileId から画像情報を取得する
  const queryFileId = decodeURIComponent(fileId).replace(
    "gid://shopify/MediaImage/",
    "",
  );
  const file = await readFile({ admin, queryFileId });
  // 商品情報を取得する
  const products = await readProducts({ admin });
  // タグ情報を取得する
  const tags = await readTags({ admin });
  // コレクションを取得する
  const collections = await readCollections({ admin });
  // mediaObject の image_settings を取得する
  const imageSetting = await readImageSetting({ admin, queryFileId });
  // 色柄の情報を取得する
  const patterns = await readPatterns({ admin });

  // fileId から画像とタグ情報を取得する
  const productsOnImage = [];

  return {
    collections,
    patterns,
    file,
    image: imageSetting,
    products,
    productsOnImage,
    recommendProducts:
      imageSetting && imageSetting.recommendProduct
        ? [imageSetting.recommendProduct]
        : [],
    tags,
  };
};

// Image データの追加
const insertImage = async (postData) => {
  try {
    await prisma.image.create({
      data: {
        fileId: postData.fileId,
      },
    });
    // 追加に成功した場合、idを取得して返す
    const image = await prisma.image.findUnique({
      where: { fileId: postData.fileId },
    });
    return image.id;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

// recommendProductsの更新
const updateRecommendProducts = async (postData) => {
  const { imageId, recommendProducts } = postData;

  try {
    // 既存の recommendProducts を削除
    await prisma.recommendProduct.deleteMany({
      where: { imageId: imageId },
    });
    // 新しい recommendProducts を追加
    await prisma.recommendProduct.createMany({
      data: recommendProducts.map((product) => {
        return {
          imageId: imageId,
          productId: product,
        };
      }),
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

const updateCollections = async (postData) => {
  const { imageId, collections } = postData;

  try {
    // 既存の recommendProducts を削除
    await prisma.collection.deleteMany({
      where: { imageId: imageId },
    });
    // 新しい recommendProducts を追加
    await prisma.collection.createMany({
      data: collections.map((id) => {
        return {
          imageId: imageId,
          collectionId: id,
        };
      }),
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

const updateTags = async (postData) => {
  const { imageId, tags } = postData;

  try {
    // 既存の recommendProducts を削除
    await prisma.ImageTag.deleteMany({
      where: { imageId: imageId },
    });
    // 新しい recommendProducts を追加
    await prisma.ImageTag.createMany({
      data: tags.map((id) => {
        return {
          imageId: imageId,
          tagId: id,
        };
      }),
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const method = request.method;

  console.log("action", request);

  switch (method) {
    case "GET": {
      const data = await getImage(request);
      return json(data);
    }
    case "POST": {
      let postData = await request.formData();
      // postData = Object.getAll(postData);

      const mode = postData.get("mode");

      // タグを追加する
      if (mode === "createTag") {
        const result = await createTag({
          admin,
          addTag: postData.get("addTag"),
        });
        if (result) {
          const tags = await readTags({ admin });
          return json({ tags });
        } else {
          return json({
            message: "タグの追加に失敗しました",
          });
        }
      } else {
        console.log("postData", postData);
        const imageId = postData.get("imageId");
        if (!imageId) {
          // Image に追加する
          const imageId = await insertImage({
            imageId,
            fileId: postData.get("fileId"),
          });
        }
        // おすすめ商品を追加する
        const recommendProducts = postData.getAll("recommendProducts");
        if (recommendProducts) {
          const result = await updateRecommendProducts({
            imageId,
            recommendProducts,
          });
        }
        // コレクション
        const collections = postData.getAll("collections");
        if (collections) {
          const result = await updateCollections({
            imageId,
            collections,
          });
        }
        // タグ
        const tags = postData.getAll("tags");
        if (tags) {
          const result = await updateTags({
            imageId,
            tags,
          });
        }
        return json({
          message: "Request to the homepage",
        });
      }
    }
    default: {
      return json({
        message: "Request to the homepage",
      });
    }
  }
};

export default function Image() {
  const fetcher = useFetcher();
  const {
    collections,
    patterns,
    file,
    image,
    products,
    productsOnImage,
    recommendProducts,
  } = useLoaderData();
  const { tags } = fetcher.data ?? useLoaderData();
  const actionData = useActionData();

  // 画像URLからファイル名と拡張子を取得する
  const fileName = file.image.originalSrc.split("/").pop();
  const [name, ext_string] = fileName.split(".");
  let ext = ext_string;
  // 拡張子に ? が含まれている場合、? 以降を除去する。同時に大文字に変換する
  if (ext.includes("?")) {
    ext = ext.split("?")[0];
  }

  const [selectedProducts, setSelectedProducts] = useState(recommendProducts);

  // 画像内の商品
  const [editProductOnImage, setEditProductOnImage] = useState(productsOnImage);

  // 編集中のプロダクトを設定する
  const [editProduct, setEditProduct] = useState(null);
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
  const handleEditProduct = useCallback(
    (product) => {
      setEditProduct(product.id);
      setEditPosition({
        x: product.positionX ? product.positionX : 50,
        y: product.positionY ? product.positionY : 50,
      });
    },
    [editProduct, editPosition],
  );
  // 編集中のプロダクトの位置を設定する
  const handleEditPosition = useCallback(
    (position) => {
      setEditPosition(position);
    },
    [editPosition],
  );

  // ポップオーバーまわりの処理
  const [isProductPopover, setIsProductPopover] = useState(false);
  const [popoverSelectedProducts, setPopoverSelectedProducts] = useState([]);
  const [productPopoverTarget, setProductPopoverTarget] =
    useState("recommendProducts");
  const [isAddTagPopover, setIsAddTagPopover] = useState(false);

  const handlePopover = useCallback(
    (type, target) => {
      if (type === "tag") {
        setIsProductPopover(false);
        setIsAddTagPopover((prevIsAddTagPopover) => !prevIsAddTagPopover);
      } else {
        setIsAddTagPopover(false);
        setIsProductPopover((prevIsProductPopover) => !prevIsProductPopover);
        console.log("handlePopover", target);
        setProductPopoverTarget(target);
      }
    },
    [productPopoverTarget],
  );

  const handleProductSelectChange = useCallback(
    (selected) => {
      // おすすめ商品への追加/削除
      if (productPopoverTarget === "recommendProducts") {
        if (selectedProducts.includes(selected.id)) {
          setSelectedProducts(
            selectedProducts.filter((id) => id !== selected.id),
          );
        } else {
          setSelectedProducts([...selectedProducts, selected.id]);
        }
      } else {
        const flag = editProductOnImage.find(
          (product) => product.id === selected.id,
        );
        console.log("handleProductSelectChange flag", flag);
        if (!flag) {
          console.log("handleProductSelectChange", selected);
          const product = selected[0];
          setEditProduct(product.id);
          setEditProductOnImage([
            ...editProductOnImage,
            {
              id: product.id,
              productTitle: product.title,
              positionX: 50,
              positionY: 50,
            },
          ]);
          setEditPosition({ x: 50, y: 50 });
        }
      }
    },
    [productPopoverTarget, editProduct, editProductOnImage, editPosition],
  );

  // タグ追加の処理
  const [addTag, setAddTag] = useState(null);

  const productUnits =
    editProductOnImage && editProductOnImage.length > 0
      ? editProductOnImage.map((product, index) => {
          return (
            <ProductUnit
              key={product.id}
              isEdit={editProduct === product.id}
              product={product}
              editPosition={editPosition}
              num={index + 1}
              handlePopover={handlePopover.bind(
                null,
                "product",
                "productOnImage",
              )}
            />
          );
        })
      : null;

  return (
    <Page
      backAction={{ content: "App", url: "/app" }}
      fullWidth
      title={`${name}.${ext}`}
      subtitle={`${file.image.width}×${file.image.height}`}
      compactTitle
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <form method="post">
        {image && image.id && (
          <input type="hidden" name="imageId" value={image.id} />
        )}
        <input type="hidden" name="fileId" value={file.id} />
        <div id="imageDetail" style={pageDetailStyle}>
          <div style={pageDetailMainStyle}>
            <ProductImage
              editProduct={editProduct}
              editPosition={editPosition}
              file={file}
              handleEditProduct={handleEditProduct}
              handleEditPosition={handleEditPosition}
              onClick={[]}
              productsOnImage={editProductOnImage}
            />
            <div style={productSettingStyle}>
              <section>
                <UnitTitle title="画像内の商品設定" icon={FlagIcon} />
                <div style={productUnitWrapStyle}>{productUnits}</div>
                <p style={addNewButtonStyle}>
                  <Button
                    icon={PlusIcon}
                    onClick={handlePopover.bind(
                      null,
                      "product",
                      "productOnImage",
                    )}
                  >
                    新規追加
                  </Button>
                </p>
              </section>
              <section>
                <UnitTitle
                  title="おすすめ商品として表示する"
                  icon={CollectionIcon}
                />
                <div>
                  <SelectedProducts
                    products={products.filter((product) => {
                      return selectedProducts.includes(product.id);
                    })}
                    onDelete={() => {}}
                  />
                  <p style={addNewButtonStyle}>
                    <Button
                      icon={PlusIcon}
                      onClick={handlePopover.bind(
                        null,
                        "product",
                        "recommendProducts",
                      )}
                    >
                      表示する商品を追加
                    </Button>
                  </p>
                </div>
              </section>
            </div>
          </div>
          <div style={subColumnStyle}>
            <dl style={subColumnUnitStyle}>
              <dt style={subColumnUnitDtStyle}>
                <Icon
                  source={HashtagDecimalIcon}
                  tone="textInfo"
                  style={polarisIconStyle}
                />
                色柄
              </dt>
              <dd>
                <CheckBoxUnit
                  items={patterns}
                  selected={[]}
                  type="colors"
                  onChange={() => {}}
                />
              </dd>
            </dl>
            <dl style={subColumnUnitStyle}>
              <dt style={subColumnUnitDtStyle}>
                <Icon
                  source={CollectionIcon}
                  tone="textInfo"
                  style={polarisIconStyle}
                />
                コレクション
              </dt>
              <dd>
                <CheckBoxUnit
                  items={collections}
                  selected={[]}
                  type="collections"
                  onChange={() => {}}
                />
              </dd>
            </dl>
            <dl style={subColumnUnitStyle}>
              <dt style={subColumnUnitDtStyle}>
                <Icon
                  source={AppsIcon}
                  tone="textInfo"
                  style={polarisIconStyle}
                />
                タグ
              </dt>
              <dd>
                <CheckBoxUnit
                  items={tags}
                  selected={[]}
                  type="tags"
                  onChange={() => {}}
                />
              </dd>
              <dd>
                <p style={addNewButtonStyle}>
                  <Button
                    icon={PlusIcon}
                    onClick={handlePopover.bind(null, "tag", "tag")}
                  >
                    新規追加
                  </Button>
                </p>
              </dd>
            </dl>
          </div>
        </div>
        <div style={buttonAreaStyle}>
          <Button variant="primary">保存する</Button>
        </div>
      </form>
      <div className={`popover ${isAddTagPopover ? "isShow" : ""}`}>
        <Form method="post">
          <input type="hidden" name="mode" value="createTag" />
          <input type="text" name="addTag" />
          <ButtonGroup className="productSelecterButtons">
            <Button onClick={handlePopover.bind(null, "tag", "tag")}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              submit
              onClick={() => {
                setIsAddTagPopover(false);
              }}
            >
              追加する
            </Button>
          </ButtonGroup>
        </Form>
      </div>
      <div className={`popover ${isProductPopover ? "isShow" : ""}`}>
        <ProductSelecter
          products={products}
          selected={popoverSelectedProducts}
          onSelectChange={handleProductSelectChange}
          handlePopover={handlePopover.bind(null, "product", "product")}
        />
      </div>
    </Page>
  );
}
