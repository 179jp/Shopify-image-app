import React, { useState, useEffect, useCallback } from "react";

const style = {
  position: "relative",
};
const productImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "10px",
};
const textSubStyle = {
  color: "#616161",
  fontSize: ".75rem",
  fontWeight: "normal",
  marginTop: "10px",
};

import "./ProductImage.css";

export const ProductImage = ({
  editProduct,
  editPosition,
  file,
  handleEditProduct,
  handleEditPosition,
  onClick,
  productsOnImage,
}) => {
  const productLabels = productsOnImage.map((product, index) => {
    const isEdit = editProduct === product.id;
    const style = {
      top: isEdit ? `${editPosition.y}%` : `${product.positionY}%`,
      left: isEdit ? `${editPosition.x}%` : `${product.positionX}%`,
    };
    return (
      <span
        className="productLabel"
        key={product.id}
        isEdit={isEdit}
        style={style}
        onClick={() => handleEditProduct(product)}
      >
        {index + 1}
      </span>
    );
  });

  return (
    <div style={style}>
      {file && file.image ? (
        <div>
          <div style={style} onClick={onClick}>
            {productLabels}
            <img
              style={productImgStyle}
              src={file.image.originalSrc}
              alt={file.id}
            />
          </div>
          <ul style={textSubStyle}>
            <li>{`${file.image.width}×${file.image.height}`}</li>
            <li>{file.createdAt}</li>
          </ul>
        </div>
      ) : (
        <p>画像が見つかりません</p>
      )}
    </div>
  );
};
