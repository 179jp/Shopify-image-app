import { useState, useEffect } from "react";

import "../styles/masonaryGallery.css";

const layoutType = [
  { type: "ex-big", item: 1, width: 3 },
  { type: "big", item: 1, width: 2 },
  { type: "big-thin", item: 1, width: 2 },
  { type: "medium", item: 2, width: 1 },
  { type: "medium", item: 2, width: 2 },
  { type: "medium-wide", item: 2, width: 1 },
  { type: "medium-a", item: 2, width: 1 },
  { type: "medium-b", item: 2, width: 1 },
  { type: "small", item: 3, width: 1 },
  { type: "medium", item: 2, width: 1 },
  { type: "medium-wide", item: 2, width: 1 },
  { type: "medium-a", item: 2, width: 1 },
  { type: "medium-b", item: 2, width: 1 },
  { type: "small", item: 3, width: 1 },
];

function generateRandomLayout(imageCount) {
  let remainingImages = imageCount;
  const layoutPattern = [];
  let previousLayout = null; // 前回のレイアウトタイプを保持

  while (remainingImages > 0) {
    let randomLayout =
      layoutType[Math.floor(Math.random() * layoutType.length)];

    // 前回と同じレイアウトが選ばれた場合、再度選び直す
    if (previousLayout && randomLayout.type === previousLayout.type) {
      randomLayout = layoutType[Math.floor(Math.random() * layoutType.length)];
    }

    // 画像が配置できるか確認
    if (remainingImages >= randomLayout.item) {
      layoutPattern.push(randomLayout);
      remainingImages -= randomLayout.item;
      previousLayout = randomLayout; // 現在のレイアウトタイプを前回として保持
    } else {
      // 最後のコラムは残り画像数に合わせたレイアウトを追加
      layoutPattern.push({
        ...randomLayout,
        item: remainingImages,
      });
      remainingImages = 0;
    }
  }

  return layoutPattern;
}

export const MasonaryGallery = ({ mode, images }) => {
  const [layout, setLayout] = useState([]);

  useEffect(() => {
    const imageCount = images.length;
    const generatedLayout = generateRandomLayout(imageCount);
    setLayout(generatedLayout);
  }, [images]);

  return (
    <div className="masonryGalleryWrap">
      <div className="masonryLayout">
        {layout.map((column, columnIndex) => {
          const columnImages = images.slice(
            layout
              .slice(0, columnIndex)
              .reduce((acc, col) => acc + col.item, 0),
            layout
              .slice(0, columnIndex)
              .reduce((acc, col) => acc + col.item, 0) + column.item,
          );

          // 空のカラムはレンダリングしない
          return columnImages.length > 0 ? (
            <div
              key={columnIndex}
              className={`column ${column.type}`}
              style={{ flex: column.width }}
            >
              {columnImages.map((image, index) => (
                <img key={image.id} src={image.url} alt={image.altText} />
              ))}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};
