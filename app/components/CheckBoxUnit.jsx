import "./css/checkboxUnit.css";

const columnStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
};

export const CheckBoxUnit = ({
  items,
  selected,
  type,
  changeHandler,
  forBulkPanel = false,
}) => {
  const wrapperStyle = {
    maxHeight: forBulkPanel ? "400px" : "200px",
  };

  return (
    <div className="checkboxUnitWrap" style={wrapperStyle}>
      <ul className={`checkboxList ${type === "colors" ? "column" : ""}`}>
        {items.map((item) => {
          const checked = selected.includes(item.id);
          return (
            <li key={item.id}>
              <label
                className={`checkboxUnit_label ${type === "colors" ? "isSmall" : ""}`}
              >
                <input
                  type="checkbox"
                  name={`${type}`}
                  checked={checked}
                  onChange={(e) => {
                    changeHandler(e.target.value);
                  }}
                  value={item.id}
                />
                {type === "tags" || type === "colors" ? item.name : item.title}
                {type === "collections" && `(${item.products.nodes.length})`}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
