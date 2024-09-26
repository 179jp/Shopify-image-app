import { Icon } from "@shopify/polaris";
import { AppsIcon, CollectionIcon, FlagIcon } from "@shopify/polaris-icons";

const unitTitleStyle = {
  display: "flex",
  gap: "4px",
  flexDirection: "row",
  flexWrap: "nowrap",
  justifyContent: "flex-start",
  fontSize: ".8125rem",
  fontWeight: "bold",
  marginBottom: "16px",
};

import "./imageDetailPage.css";

export const UnitTitle = ({ title, icon }) => {
  return (
    <div className="unit-title">
      <h2 style={unitTitleStyle}>
        <Icon source={icon} tone="textInfo" />
        {title}
      </h2>
    </div>
  );
};
