import { Button, Thumbnail } from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";

import "./ProductCards.css";

export const ProductCards = ({ products, onDelete }) => {
  return (
    <ul className="productCards">
      {products.map((product) => {
        const img =
          product.images.edges[0] && product.images.edges[0].node
            ? product.images.edges[0].node
            : null;
        const productImg = img ? (
          <Thumbnail source={img.originalSrc} size="large" alt={img.altText} />
        ) : (
          <Thumbnail source={NoteIcon} size="large" alt="No Image" />
        );
        return (
          <li className={`productCard`} key={product.id}>
            <div className="productCard_content">
              {productImg}
              <p>{product.title}</p>
            </div>
            <Button
              icon={DeleteIcon}
              onClick={() => {
                onDelete(product.id);
              }}
            />
          </li>
        );
      })}
    </ul>
  );
};
