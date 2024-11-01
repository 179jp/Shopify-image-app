import GridLayout from "react-grid-layout";
import "../styles/gallery.css";

export const Gallery = ({ mode, images }) => {
  const layout = [
    { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
    { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 },
  ];
  return (
    <div className="gallery">
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
      >
        {images.map((image) => (
          <div key={image.id} className="image">
            <img src={image.url} alt={image.altText} />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
