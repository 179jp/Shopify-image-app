import React from "react";
import { Icon } from "@shopify/polaris";
import {
  PinIcon,
  PinFilledIcon,
  DeleteIcon,
  EditIcon,
} from "@shopify/polaris-icons";

import { ProductSelecter } from "./ProductSelecter";

const products = [
  {
    id: 1,
    name: "商品名1",
    img: "https://cdn.shopify.com/s/files/1/0859/6278/5087/products/Main.jpg?v=1706755963",
    position: { x: 10, y: 20 },
  },
  // 他の商品データも同様に追加
];

const Product = ({ children, isEdit }) => {
  const productStyle = {
    display: "flex",
    alignItems: "center",
    backgroundColor: isEdit ? "#fff" : "transparent",
    border: "1px solid #eee",
    borderRadius: "0.75rem",
    gap: "20px",
    padding: isEdit ? "32px 16px" : "16px",
  };

  return <dl style={productStyle}>{children}</dl>;
};

const ProductLabel = ({ children, isEdit }) => {
  const productLabelStyle = {
    display: "inline-block",
    width: "32px",
    height: "32px",
    lineHeight: "28px",
    backgroundColor: isEdit ? "#111" : "#fff",
    border: "2px solid #111",
    borderRadius: "50%",
    boxSizing: "border-box",
    color: isEdit ? "#fff" : "#111",
    textAlign: "center",
  };

  return <dt style={productLabelStyle}>{children}</dt>;
};

const PositionSettings = ({ children }) => {
  const positionSettingsStyle = {
    display: "flex",
    gap: "4px",
    color: "#616161",
    fontSize: "0.75rem",
    fontWeight: "normal",
    marginTop: "4px",
  };

  return <div style={positionSettingsStyle}>{children}</div>;
};

const SaveButton = ({ children }) => {
  const [hover, setHover] = React.useState(false);

  const saveButtonStyle = {
    backgroundColor: hover ? "#333" : "#111",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8125rem",
    padding: "4px 8px",
    transition: "all 0.2s",
  };

  return (
    <button
      style={saveButtonStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
};

const ddStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "calc(100% - 32px - 20px)",
};

const iconStyle = {
  display: "block",
  height: "1rem",
  width: "1rem",
  maxHeight: "100%",
  maxWidth: "100%",
  margin: "0",
};

export const ProductUnit = ({ product, num, isEdit, editPosition }) => {
  return (
    <Product isEdit={isEdit}>
      <ProductLabel isEdit={isEdit}>{num}</ProductLabel>
      <dd style={ddStyle}>
        <ul>
          <li>
            {isEdit ? (
              <ProductSelecter
                products={products}
                selected={product}
                onSelectChange={() => {}}
              />
            ) : (
              product.name
            )}
          </li>
          <li>
            <PositionSettings>
              <Icon
                source={isEdit ? PinFilledIcon : PinIcon}
                tone="textInfo"
                style={iconStyle}
              />
              <p>
                {isEdit
                  ? `${editPosition.x}, ${editPosition.y}`
                  : `${product.positionX}, ${product.positionY}`}
              </p>
            </PositionSettings>
          </li>
        </ul>
        <div>
          {isEdit ? (
            <SaveButton>保存</SaveButton>
          ) : (
            <p>
              <button>
                <Icon source={EditIcon} tone="textInfo" style={iconStyle} />
              </button>
              <button>
                <Icon source={DeleteIcon} tone="textInfo" style={iconStyle} />
              </button>
            </p>
          )}
        </div>
      </dd>
    </Product>
  );
};
