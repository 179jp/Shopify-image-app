import { list } from "isbot";
import React from "react";

const Wrapper = ({ children }) => {
  const wrapperStyle = {
    backgroundColor: "rgba(0,0,0,.01)",
    border: "1px solid #eee",
    borderRadius: "8px",
    boxShadow: "0rem 0rem 0rem .0625rem rgba(0, 0, 0, .08) inset",
    width: "100%",
    maxHeight: "200px",
    overflowY: "auto",
    padding: "8px",
  };

  return <div style={wrapperStyle}>{children}</div>;
};

const listStyle = {
  display: "flex",
  flexDirection: "column",
};

const columnStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
};

const Label = ({ isSmall, children }) => {
  const [hover, setHover] = React.useState(false);

  const labelStyle = {
    alignItems: "center",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: isSmall ? ".7rem" : ".8125rem",
    display: "flex",
    justifyContent: "flex-start",
    gap: "4px",
    padding: "4px 8px",
    transition: "all .8s",
    backgroundColor: hover ? "#fff" : "transparent",
  };

  return (
    <label
      style={labelStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </label>
  );
};

export const CheckBoxUnit = ({ items, selected, type, onChange }) => {
  const listClass = type === "colors" ? columnStyle : listStyle;
  return (
    <Wrapper>
      <ul style={listClass}>
        {items.map((item) => {
          return (
            <li key={item.id}>
              <Label isSmall={type === "colors"}>
                <input
                  type="checkbox"
                  name={`${type}`}
                  checked={selected.includes(item.id)}
                  onChange={() => onChange(item.id)}
                  value={item.id}
                />
                {type === "tags" || type === "colors" ? item.name : item.title}
                {type === "collections" && `(${item.products.nodes.length})`}
              </Label>
            </li>
          );
        })}
      </ul>
    </Wrapper>
  );
};
