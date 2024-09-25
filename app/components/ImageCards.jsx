import { boxShadowLv2 } from "../components-syled/config";
import { Link } from "@remix-run/react";

const pageWrapStyle = {
  backgroundColor: "rgb(248, 248,248)",
  boxShadow: boxShadowLv2,
  borderRadius: ".75rem",
  display: "grid",
  gap: "20px",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
  padding: "20px",
};
const cardImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "10px",
};

export const ImagesCards = ({ files, handleSelection }) => {
  const cards = files
    .filter((file) => file.image && file.image.originalSrc)
    .map((file) => {
      const encodedId = encodeURIComponent(file.id);
      return (
        <div key={file.id}>
          <Link to={`/app/image/${encodedId}`}>
            <img
              src={file.image.originalSrc}
              alt={file.id}
              style={cardImgStyle}
            />
          </Link>
        </div>
      );
    });

  return <div style={pageWrapStyle}>{cards}</div>;
};
