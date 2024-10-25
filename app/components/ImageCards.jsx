import { boxShadowLv2 } from "../components-styled/config";
import { Link } from "@remix-run/react";

import "./ImageCard.css";

export const ImagesCards = ({ files, handleSelection, grid = "normal" }) => {
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
        </div>
      );
    });
  const wrapClass = ["imageCradsWrap", `grid--${grid}`].join(" ");

  return <div className={wrapClass}>{cards}</div>;
};
