import { useState, useCallback } from "react";

import { Icon } from "@shopify/polaris";
import { CaretDownIcon, SearchIcon } from "@shopify/polaris-icons";

import "./ProductSelecter.css";

export const ProductSelecter = ({ products, selected, onSelectChange }) => {
  const [showList, setShowList] = useState(false);
  const [search, setSearch] = useState("");

  const handleShowList = useCallback(() => {
    console.log("handleShowList", showList);
    setShowList((prevShowList) => !prevShowList);
  }, [showList]);

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const filteredProducts =
    search !== ""
      ? products.filter((product) => {
          return product.name.includes(search);
        })
      : products;

  return (
    <div className={`product-selecter-wrap ${showList ? "showList" : ""}`}>
      <p className="selected-product" onClick={handleShowList}>
        {selected.name}
        <Icon source={CaretDownIcon} color="inkLighter" />
      </p>
      <div>
        <div className="product-filter">
          <Icon source={SearchIcon} color="inkLighter" />
          <input type="text" onChange={handleSearch} />
        </div>
        <div className="product-list-wrapper">
          <ul className="product-list">
            {filteredProducts.map((product) => {
              return (
                <li key={product.id}>
                  <img src={product.img} alt={product.id} />
                  {product.name}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
