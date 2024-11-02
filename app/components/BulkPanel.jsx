import { useState, useEffect, useCallback } from "react";

import { Button, Icon } from "@shopify/polaris";
import {
  CircleChevronUpIcon,
  CircleChevronDownIcon,
} from "@shopify/polaris-icons";
import { CheckBoxUnit } from "./CheckBoxUnit";
import { ProductSelecter } from "./ProductSelecter";

import "./css/bulkPanel.css";
const iconStyle = {
  display: "block",
  height: "1rem",
  width: "1rem",
  maxHeight: "100%",
  maxWidth: "100%",
  margin: "0",
};

export const BulkPanel = ({
  selectedImages,
  collections,
  patterns,
  products,
  tags,
  handleBulkChange,
}) => {
  // 編集状態
  const [expandPanel, setExpandPanel] = useState(false);

  // 項目
  // - 商品
  const [selectedProducts, setSelectedProducts] = useState([]);
  const handleProductsChange = useCallback(
    (selected) => {
      if (selectedProducts.includes(selected)) {
        setSelectedProducts(selectedProducts.filter((id) => id !== selected));
      } else {
        setSelectedProducts([...selectedProducts, selected]);
      }
      console.log("handleProductsChange", selectedProducts);
    },
    [selectedProducts],
  );
  // - コレクション
  const [selectedCollections, setSelectedCollections] = useState([]);
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
  // - 色柄
  const [selectedPatterns, setSelectedPatterns] = useState([]);
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
  // - タグ
  const [selectedTags, setSelectedTags] = useState([]);
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

  const handleSubmit = useCallback(() => {
    console.log("handleSubmit", {
      selectedProducts,
      selectedCollections,
      selectedPatterns,
      selectedTags,
    });
    // 全て未選択の場合は何もしない
    if (
      selectedProducts.length === 0 &&
      selectedCollections.length === 0 &&
      selectedPatterns.length === 0 &&
      selectedTags.length === 0
    ) {
      return;
    }
    handleBulkChange({
      products: selectedProducts,
      collections: selectedCollections,
      patterns: selectedPatterns,
      tags: selectedTags,
    });
  }, [selectedProducts, selectedCollections, selectedPatterns, selectedTags]);

  return (
    <div
      className={`bulkActionPanel ${selectedImages.length > 0 ? "show" : ""} ${expandPanel ? "expand" : ""}`}
    >
      <div className="bulkActionPanel_header">
        <p className="bulkActionPanel_label">
          <span className="bulkActionPanel_labelNum">
            {selectedImages.length}
          </span>
          個の画像を...
        </p>
        <button
          className="bulkActionPanel_expandButton"
          onClick={() => setExpandPanel((prev) => !prev)}
        >
          {expandPanel ? "閉じる" : "一括編集"}
          <Icon
            source={expandPanel ? CircleChevronDownIcon : CircleChevronUpIcon}
            tone="base"
            style={iconStyle}
          />
        </button>
      </div>
      <div className={`bulkActionPanel_input ${expandPanel ? "show" : ""}`}>
        <div className={`bulkActionPanel_inputColumns`}>
          <dl className="bulkActionPanel_inputColumn">
            <dt>画像内の商品設定</dt>
            <dd>
              <ProductSelecter
                products={products}
                selected={selectedProducts}
                onSelectChange={handleProductsChange}
                handlePopover={() => console.log("hello")}
                isPopover={false}
              />
            </dd>
          </dl>
          <dl className="bulkActionPanel_inputColumn">
            <dt>色柄</dt>
            <dd>
              <CheckBoxUnit
                items={patterns}
                selected={selectedPatterns}
                type="colors"
                changeHandler={handlePatternsChange}
                forBulkPanel={true}
              />
            </dd>
          </dl>
          <dl className="bulkActionPanel_inputColumn">
            <dt>コレクション</dt>
            <dd>
              <CheckBoxUnit
                items={collections}
                selected={selectedCollections}
                type="collections"
                changeHandler={handleCollectionChange}
                forBulkPanel={true}
              />
            </dd>
          </dl>
          <dl className="bulkActionPanel_inputColumn">
            <dt>用途</dt>
            <dd>
              <CheckBoxUnit
                items={tags}
                selected={selectedTags}
                type="tags"
                changeHandler={handleTagsChange}
                forBulkPanel={true}
              />
            </dd>
          </dl>
        </div>
        <div className={`bulkActionPanel_submit`}>
          <Button variant="primary" size="large" onClick={() => handleSubmit()}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
};
