export const SelectedProducts = ({ products, onDelete }) => {
  return (
    <ul className="selectedProducts">
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
          <li className={`productList_item`} key={product.id}>
            <div>
              {productImg}
              <p>{product.title}</p>
            </div>
            <Button
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
