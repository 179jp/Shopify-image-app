import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@shopify/polaris";
import { AppsIcon, CollectionIcon, FlagIcon } from "@shopify/polaris-icons";

import { UnitTitle } from "./UnitTitle";
import { ProductUnit } from "./ProductUnit";
import { CheckBoxUnit } from "./CheckBoxUnit";

import "./imageDetailPage.css";

const boxShadowLv1 = "0rem .0625rem 0rem 0rem rgba(26, 26, 26, .07)";
const boxShadowLv2 = "0rem .125rem .25rem 0rem rgba(26, 26, 26, .07)";
const boxShadowInset = "0rem 0rem 0rem .0625rem rgba(0, 0, 0, .08) inset";
const appKeyGradient = "linear-gradient(45deg, #A7D3A6 0%, #ADD2C2 100%)";

const polarisIconStyle = {
  display: "block",
  height: "1.25rem",
  width: "1.25rem",
  maxHeight: "100%",
  maxWidth: "100%",
  margin: "0!important",
};

const CardUnit = ({ children }) => {
  const [hover, setHover] = useState(false);

  const cardUnitStyle = {
    background: hover ? appKeyGradient : "#FFF",
    boxShadow: boxShadowLv1,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.8s",
  };

  const imgStyle = {
    opacity: hover ? 0.8 : 1,
  };

  return (
    <div
      style={cardUnitStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {React.Children.map(children, (child) => {
        if (child.type && child.type === Image) {
          return React.cloneElement(child, { style: imgStyle });
        }
        return child;
      })}
    </div>
  );
};

const SubColumn = ({ children }) => {
  const subColumnStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  return <dl style={subColumnStyle}>{children}</dl>;
};

const SubColumnUnit = ({ children }) => {
  const subColumnUnitStyle = {
    backgroundColor: "rgb(248, 248,248)",
    boxShadow: boxShadowLv2,
    borderRadius: ".75rem",
    padding: "20px",
  };

  const dtStyle = {
    display: "flex",
    fontSize: ".8125rem",
    fontWeight: "bold",
    gap: "8px",
    justifyContent: "flex-start",
    marginBottom: "8px",
  };

  return (
    <dl style={subColumnUnitStyle}>
      {React.Children.map(children, (child) => {
        if (child.type === "dt") {
          return React.cloneElement(
            child,
            { style: dtStyle },
            React.Children.map(child.props.children, (dtChild) => {
              if (dtChild.type && dtChild.type === Icon) {
                return React.cloneElement(dtChild, { style: polarisIconStyle });
              }
              return dtChild;
            }),
          );
        }
        return child;
      })}
    </dl>
  );
};

const AddTag = ({ children }) => {
  const addTagStyle = {
    alignItems: "center",
    display: "flex",
    gap: "8px",
    padding: "8px",
    marginTop: "8px",
  };

  const inputStyle = {
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: ".8125rem",
    padding: "4px",
  };

  const buttonStyle = {
    fontSize: ".8125rem",
    fontWeight: "bold",
  };

  return (
    <p style={addTagStyle}>
      {React.Children.map(children, (child) => {
        if (child.type === "input") {
          return React.cloneElement(child, { style: inputStyle });
        }
        if (child.type === "button") {
          return React.cloneElement(child, { style: buttonStyle });
        }
        return child;
      })}
    </p>
  );
};

const ProductImage = ({ children, onClick }) => {
  const productImageStyle = {
    position: "relative",
  };

  return (
    <div style={productImageStyle} onClick={onClick}>
      {children}
    </div>
  );
};

const ProductLabel = ({ children, isEdit, style, onClick }) => {
  const [hover, setHover] = useState(false);

  const baseStyle = {
    display: "inline-block",
    width: "32px",
    height: "32px",
    lineHeight: "28px",
    backgroundColor: isEdit || hover ? "#111" : "#fff",
    border: "2px solid #111",
    borderRadius: "50%",
    boxShadow: boxShadowLv2,
    color: isEdit || hover ? "#fff" : "#111",
    cursor: "pointer",
    textAlign: "center",
    position: "absolute",
    transform: "translate(-50%, -50%)",
    transition: hover ? "all 0.2s" : "all 0.8s",
    ...style,
  };

  return (
    <span
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </span>
  );
};

const ProductUnitWrap = ({ children }) => {
  const productUnitWrapStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  return <div style={productUnitWrapStyle}>{children}</div>;
};

export const ImageDetailPage = ({ file, collections, tags, products }) => {
  const [selected, setSelected] = useState("today");
  const handleSelectChange = useCallback((value) => setSelected(value), []);

  // DB から取得する内容
  const [image, setImage] = useState(null);
  const [imageTags, setImageTags] = useState([]);

  // 編集中のプロダクトを設定する
  const [editProduct, setEditProduct] = useState(null);
  const handleEditProduct = useCallback((product) => {
    setEditProduct(product.id);
    setEditPosition(product.position);
  }, []);

  // 編集中のプロダクトの位置を設定する
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
  const handleEditPosition = useCallback((position) => {
    setEditPosition(position);
  }, []);

  const productsOnImage = [
    {
      id: "aaaaa",
      name: "Product A",
      position: {
        x: 10,
        y: 10,
      },
    },
    {
      id: "bbbbb",
      name: "Product B",
      position: {
        x: 40,
        y: 60,
      },
    },
  ];

  const productUnits = productsOnImage.map((product, index) => {
    return (
      <ProductUnit
        key={product.id}
        isEdit={editProduct === product.id}
        product={product}
        editPosition={editPosition}
        num={index + 1}
      />
    );
  });

  const productLabels = productsOnImage.map((product, index) => {
    const isEdit = editProduct === product.id;
    const style = {
      top: isEdit ? `${editPosition.y}%` : `${product.position.y}%`,
      left: isEdit ? `${editPosition.x}%` : `${product.position.x}%`,
    };
    return (
      <ProductLabel
        key={product.id}
        isEdit={isEdit}
        style={style}
        onClick={() => handleEditProduct(product)}
      >
        {index + 1}
      </ProductLabel>
    );
  });

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const posX = Math.round(x * 10) / 10;
    const posY = Math.round(y * 10) / 10;
    console.log(posX, posY);
    handleEditPosition({ x: posX, y: posY });
  };

  const pageDetailStyle = {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "3fr 1fr",
  };

  const pageDetailMainStyle = {
    backgroundColor: "rgb(248, 248,248)",
    boxShadow: boxShadowLv2,
    borderRadius: ".75rem",
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "1fr 1fr",
    padding: "20px",
  };

  const textSubStyle = {
    color: "#616161",
    fontSize: ".75rem",
    fontWeight: "normal",
    marginTop: "10px",
  };

  const productImgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "10px",
  };

  return (
    <div id="imageDetail" style={pageDetailStyle}>
      <div style={pageDetailMainStyle}>
        {file && file.image ? (
          <div>
            <ProductImage onClick={handleImageClick}>
              {productLabels}
              <img
                style={productImgStyle}
                src={file.image.originalSrc}
                alt={file.id}
              />
            </ProductImage>
            <ul style={textSubStyle}>
              <li>{`${file.image.width}×${file.image.height}`}</li>
              <li>{file.createdAt}</li>
            </ul>
          </div>
        ) : (
          <p>画像が見つかりません</p>
        )}
        <div>
          <div>
            <UnitTitle title="商品の設定" icon={FlagIcon} />
            <ProductUnitWrap>{productUnits}</ProductUnitWrap>
          </div>
          <div>
            <UnitTitle title="おすすめ商品" icon={CollectionIcon} />
            <div>
              <CheckBoxUnit
                items={products}
                selected={[]}
                type="products"
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
      <SubColumn>
        <SubColumnUnit>
          <dt>
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
        </SubColumnUnit>
        <SubColumnUnit>
          <dt>
            <Icon source={AppsIcon} tone="textInfo" style={polarisIconStyle} />
            タグ
          </dt>
          <dd>
            <CheckBoxUnit
              items={tags}
              selected={[]}
              type="tags"
              onChange={() => {}}
            />
            <AddTag>
              <input type="text" placeholder="タグを追加" />
              <button>追加</button>
            </AddTag>
          </dd>
        </SubColumnUnit>
      </SubColumn>
    </div>
  );
};
