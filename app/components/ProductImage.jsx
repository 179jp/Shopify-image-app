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
  const handleLabelClick = (product) => {
    handleEditProduct(product);
  };

  const productLabels =
    productsOnImage.length > 0
      ? productsOnImage.map((product, index) => {
          const isEdit = editProduct == product.id;
          const style = {
            top: isEdit ? `${editPosition.y}%` : `${product.positionY}%`,
            left: isEdit ? `${editPosition.x}%` : `${product.positionX}%`,
          };
          return (
            <span
              className={`productLabel ${isEdit ? "isEdit" : ""}`}
              key={product.id}
              isEdit={isEdit}
              style={style}
              onClick={() => handleLabelClick(product)}
            >
              {index + 1}
            </span>
          );
        })
      : null;

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    handleEditPosition({ x, y });
  };

  return (
    <div style={style}>
      {file && file.image ? (
        <div>
          <div style={style}>
            {productLabels}
            <img
              style={productImgStyle}
              src={file.image.originalSrc}
              alt={file.id}
              onClick={(e) => handleImageClick(e)}
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
