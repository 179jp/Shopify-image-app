import { boxShadowLv2 } from "../components-styled/config";
import { Link } from "@remix-run/react";

import { Icon } from "@shopify/polaris";
import { ClipboardIcon } from "@shopify/polaris-icons";

import "./css/ImageCard.css";
const iconStyle = {
  display: "block",
  height: "1rem",
  width: "1rem",
  maxHeight: "100%",
  maxWidth: "100%",
  margin: "0",
};

export const ImagesCards = ({ files, handleSelection, grid = "normal" }) => {
  const showCoppyButton = grid === "normal" || grid === "large";
  const cards = files
    .filter((file) => file.image && file.image.originalSrc)
    .map((file) => {
      const encodedId = encodeURIComponent(file.id);
      return (
        <div key={file.id} className="imageCard">
          <Link to={`/app/image/${encodedId}`}>
            <img
              src={file.image.originalSrc}
              alt={file.id}
              className="imageCard_img"
              loading="lazy"
            />
          </Link>
          <input
            className="imageCrad_check"
            type="checkbox"
            onChange={() => handleSelection(file.id)}
          />
          {showCoppyButton && (
            <button
              className="imageCrad_copyButton"
              onClick={() => console.log("hello")}
            >
              <Icon source={ClipboardIcon} tone="subdued" style={iconStyle} />
            </button>
          )}
        </div>
      );
    });
  const wrapClass = ["imageCradsWrap", `grid--${grid}`].join(" ");

  return <div className={wrapClass}>{cards}</div>;
};
