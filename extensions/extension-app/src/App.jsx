import { useState, useEffect } from "react";
import "./styles/App.css";

// Models
import { fetchImageSettings } from "./models/metaObject.imageSettings";
import { fetchTags } from "./models/metaObject.imageTags";

import { generateDammyImages } from "./utils/generateDammyImages";

// Components
import { Gallery } from "./components/Gallery";
import { MasonaryGallery } from "./components/MasonaryGallery";
import { Tags } from "./components/Tags";

function App({ mode, handle }) {
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    // 非同期関数を useEffect 内で定義
    const fetchData = async () => {
      try {
        // タグを取得
        const tags = await fetchTags({ handle });
        console.log("tags", tags);
        setTags(tags);
        // imageIds
        let imageIds = [];
        tags.forEach((tag) => {
          imageIds = [...new Set(imageIds.concat(tag.referencedIds))];
        });
        // 画像を取得
        // const result = await fetchImageSettings();
        // const images = result.filter((image) => imageIds.includes(image.id));
        // setImages(images);
        const dammyImages = await generateDammyImages(60);
        setImages(dammyImages);
      } catch (error) {
        console.error("Error fetching image settings:", error);
      }
    };

    fetchData(); // 非同期関数を呼び出し
  }, []);

  // <Gallery images={images} mode={mode} />

  return (
    <>
      <Tags tags={tags} handle={handle} />
      <MasonaryGallery images={images} mode={mode} />
    </>
  );
}

export default App;
