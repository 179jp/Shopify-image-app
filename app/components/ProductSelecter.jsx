import { useState, useCallback } from "react";

import { Button, ButtonGroup, Icon, Thumbnail } from "@shopify/polaris";
import { CaretDownIcon, NoteIcon, SearchIcon } from "@shopify/polaris-icons";

import "./ProductSelecter.css";

export const ProductSelecter = ({
  products,
  selected,
  onSelectChange,
  handlePopover,
}) => {
  const [showList, setShowList] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredProducts, setfilteredProducts] = useState(products);
  const [selectedProducts, setSelectedProducts] = useState(selected);

  const handleShowList = useCallback(() => {
    console.log("handleShowList", showList);
    setShowList((prevShowList) => !prevShowList);
  }, [showList]);

  const handleSelectedProducts = (product) => {
    if (selectedProducts.includes(product)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product.id]);
    }
  };

  const handleProductSearch = useCallback(
    (e) => {
      console.log("handleProductSearch", e.target.value);
      setSearch(e.target.value);
      const filtered = products.filter((product) =>
        product.title.toLowerCase().includes(e.target.value.toLowerCase()),
      );
      setfilteredProducts(filtered);
    },
    [filteredProducts],
  );

  const handleSubmit = useCallback(() => {
    console.log("handleSubmit", selectedProducts);
    onSelectChange(
      products.filter((product) => selectedProducts.includes(product.id)),
    );
    handlePopover();
  });

  return (
    <div className={`product-selecter-wrap showList`}>
      <p className="selected-product" onClick={handleShowList}>
        {selected.name}
      </p>
      <div>
        <div className="productFilter">
          <Icon source={SearchIcon} color="inkLighter" />
          <input type="text" onChange={handleProductSearch} />
        </div>
        <div className="productsListWrapper">
          <ul className="productsList">
            {filteredProducts.map((product) => {
              const img =
                product.images.edges[0] && product.images.edges[0].node
                  ? product.images.edges[0].node
                  : null;
              const productImg = img ? (
                <Thumbnail
                  source={img.originalSrc}
                  size="large"
                  alt={img.altText}
                />
              ) : (
                <Thumbnail source={NoteIcon} size="large" alt="No Image" />
              );
              return (
                <li
                  className={`productList_item ${selectedProducts.includes(product.id) ? "isSelected" : ""}`}
                  key={product.id}
                  onClick={handleSelectedProducts.bind(null, product)}
                >
                  {productImg}
                  <p>{product.title}</p>
                </li>
              );
            })}
          </ul>
        </div>
        <ButtonGroup className="productSelecterButtons">
          <Button onClick={handlePopover}>キャンセル</Button>
          <Button variant="primary" onClick={handleSubmit}>
            決定
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};
