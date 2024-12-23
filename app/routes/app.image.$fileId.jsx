import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useActionData,
} from "@remix-run/react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import axios from "axios";

// Models
import { readCollections } from "../models/Collections.server.js";
import { readFile } from "../models/File.server.js";
import {
  readImageSetting,
  updateImageSetting,
  upsertImageSetting,
} from "../models/ImageSetting.server.js";
import { readPatterns } from "../models/Patterns.server.js";
import { readProducts } from "../models/Products.server.js";
import {
  readProductOnImage,
  upsertProductOnImage,
} from "../models/ProductOnImage.server.js";
import { createTag, readTags } from "../models/Tags.server.js";
import { publishApi } from "../models/Api.server.js";

// Components
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
import { Loading } from "../components/Loading";
import { ProductCards } from "../components/ProductCards";
import { ProductImage } from "../components/ProductImage";
import { ProductSelecter } from "../components/ProductSelecter";

// Styles
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

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { fileId } = params;
  const handle = "image_" + fileId.replace("gid://shopify/MediaImage/", "");

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
  const imageSetting = await readImageSetting({ admin, handle });
  // 色柄の情報を取得する
  const patterns = await readPatterns({ admin });
  // fileId から画像とタグ情報を取得する
  let productsOnImage = [];
  if (imageSetting && imageSetting.productsOnImage.length > 0) {
    const productsOnImagePromises = imageSetting.productsOnImage.map(
      (product) => {
        return readProductOnImage({
          admin,
          productOnImageId: product,
        });
      },
    );
    // すべての非同期処理が完了するまで待機し、結果を取得する
    productsOnImage = await Promise.all(productsOnImagePromises);
    console.log("productsOnImage", productsOnImage);
  }
  const image =
    !imageSetting || !imageSetting.id
      ? {
          collections: [],
          recommendProducts: [],
          selectedTags: [],
          patterns: [],
          iproductsOnImage: [],
        }
      : imageSetting;

  return {
    collections,
    patterns,
    file,
    handle,
    image,
    products,
    productsOnImage,
    recommendProducts:
      imageSetting && imageSetting.recommendProducts
        ? [imageSetting.recommendProducts]
        : [],
    tags,
  };
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

      if (mode === "createTag") {
        // タグを追加する
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
      } else if (mode == "saveImageSetting") {
        // 画像設定を保存する（新規保存）
        const imageId = postData.get("id");
        const collections = postData.get("collections");
        const fileId = postData.get("fileId");
        const patterns = postData.get("patterns");
        const recommendProduct = postData.get("recommendProduct");
        const tags = postData.get("tags");
        const productsOnImage = postData.get("productsOnImage");
        const productIdsOnImage = postData.get("productIdsOnImage");
        const result = await upsertImageSetting({
          admin,
          imageSetting: {
            imageId,
            collections,
            products: productIdsOnImage,
            fileId,
            patterns,
            recommendProduct,
            tags,
          },
        });

        // ProductOnImage の保存処理
        if (result && result.id && productsOnImage) {
          const imageSettingId = result.id;
          const products = JSON.parse(productsOnImage);
          const upsertProductOnImagePromises = products.map((product) => {
            const productHandle =
              imageId.replace("image_", "") +
              "-" +
              product.product.id.replace("gid://shopify/Product/", "");
            return upsertProductOnImage({
              admin,
              imageSettingId,
              handle: productHandle,
              product,
            });
          });
          // すべての非同期処理が完了するまで待機し、結果を取得する
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
          if (upsertProductOnImageResult) {
            // APIデータ書き出し
            const publishResult = await publishApi({ admin });
            if (publishResult) {
              const tags = await readTags({ admin });
              return json({ tags });
            }
          } else {
            return json({
              message: "タグの追加に失敗しました",
            });
          }
        } else if (result) {
          const tags = await readTags({ admin });
          return json({ tags });
        } else {
          return json({
            message: "タグの追加に失敗しました",
          });
        }
      } else {
        console.log("postData", postData);
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
  const shopify = useAppBridge();
  const fetcher = useFetcher();
  const {
    collections,
    patterns,
    file,
    handle,
    image,
    products,
    productsOnImage,
    recommendProducts,
  } = useLoaderData();
  const { tags } = fetcher.data ?? useLoaderData();

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const loadingText =
    fetcher.state === "loading" ? "読み込み中です" : "保存しています";

  // 画像URLからファイル名と拡張子を取得する
  const fileName = file.image.originalSrc.split("/").pop();
  const [name, ext_string] = fileName.split(".");
  let ext = ext_string;
  // 拡張子に ? が含まれている場合、? 以降を除去する。同時に大文字に変換する
  if (ext.includes("?")) {
    ext = ext.split("?")[0];
  }

  // おすすめ商品
  const [selectedProducts, setSelectedProducts] = useState(recommendProducts);

  // 画像内の商品
  const [editProductsOnImage, setEditProductsOnImage] =
    useState(productsOnImage);

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
        setProductPopoverTarget(target);
      }
    },
    [productPopoverTarget],
  );

  const handleProductSelectChange = useCallback(
    (selected) => {
      // おすすめ商品への追加/削除
      if (productPopoverTarget === "recommendProducts") {
        console.log("recommendProducts", selected, selectedProducts);
        setSelectedProducts(selected.map((product) => product.id));
      } else {
        const flag = editProductsOnImage.find(
          (product) => product.id === selected.id,
        );
        if (!flag) {
          console.log("handleProductSelectChange", selected);
          const product = selected[0];
          setEditProduct(product.id);
          setEditProductsOnImage([
            ...editProductsOnImage,
            {
              id: null,
              product: {
                id: product.id,
                title: product.title,
              },
              x: 50,
              y: 50,
            },
          ]);
          setEditPosition({ x: 50, y: 50 });
        }
      }
    },
    [
      productPopoverTarget,
      editProduct,
      editProductsOnImage,
      editPosition,
      selectedProducts,
    ],
  );

  // タグ追加の処理
  const [addTag, setAddTag] = useState(null);

  const productUnits =
    editProductsOnImage && editProductsOnImage.length > 0
      ? editProductsOnImage.map((product, index) => {
          console.log("product-editProductsOnImage.map", product);
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

  // 選択している色柄
  const [selectedPatterns, setSelectedPatterns] = useState(image.patterns);
  const handlePatternsChange = useCallback(
    (selected) => {
      if (selectedPatterns.includes(selected)) {
        setSelectedPatterns(selectedPatterns.filter((id) => id !== selected));
      } else {
        setSelectedPatterns([...selectedPatterns, selected]);
      }
    },
    [selectedPatterns],
  );
  // 選択しているコレクション
  const [selectedCollections, setSelectedCollections] = useState(
    image.collections,
  );
  const handleCollectionChange = useCallback(
    (selected) => {
      if (selectedCollections.includes(selected)) {
        setSelectedCollections(
          selectedCollections.filter((id) => id !== selected),
        );
      } else {
        setSelectedCollections([...selectedCollections, selected]);
      }
    },
    [selectedCollections],
  );
  // 選択している用途（タグ）
  const [selectedTags, setSelectedTags] = useState(image.selectedTags);
  const handleTagsChange = useCallback(
    (selected) => {
      if (selectedTags.includes(selected)) {
        setSelectedTags(selectedTags.filter((id) => id !== selected));
      } else {
        setSelectedTags([...selectedTags, selected]);
      }
    },
    [selectedTags],
  );

  // 保存するための処理
  const handlePageSubmit = () => {
    fetcher.submit(
      {
        id: handle,
        productsOnImage: JSON.stringify(editProductsOnImage),
        productIdsOnImage: JSON.stringify(
          editProductsOnImage.map((product) => product.product.id),
        ),
        fileId: file.id,
        collections: JSON.stringify(selectedCollections),
        mode: "saveImageSetting",
        patterns: JSON.stringify(selectedPatterns),
        recommendProduct:
          selectedProducts.length > 0 ? selectedProducts[0] : null,
        tags: JSON.stringify(selectedTags),
      },
      {
        method: "POST",
      },
    );
  };

  return (
    <Page
      backAction={{ content: "App", url: "/app" }}
      fullWidth
      title={`${name}.${ext}`}
      subtitle={image ? image.id : ""}
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
              productsOnImage={editProductsOnImage}
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
                  <ProductCards
                    products={products.filter((product) =>
                      selectedProducts.includes(product.id),
                    )}
                    onDelete={setSelectedProducts}
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
                  selected={selectedPatterns}
                  type="colors"
                  changeHandler={handlePatternsChange}
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
                  selected={selectedCollections}
                  type="collections"
                  changeHandler={handleCollectionChange}
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
                用途
              </dt>
              <dd>
                <CheckBoxUnit
                  items={tags}
                  selected={selectedTags}
                  type="tags"
                  changeHandler={handleTagsChange}
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
          <Button variant="primary" onClick={() => handlePageSubmit()}>
            保存する
          </Button>
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
      {isLoading && <Loading text={loadingText} />}
    </Page>
  );
}
