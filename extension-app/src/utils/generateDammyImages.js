import dammyImages from "./dammy.json";

export const generateDammyImages = async (count) => {
  /*
  const response = await fetch(
    `https://api.unsplash.com/photos/random?count=${count}&client_id=9ytRrqIAdF78cdlDV1U25DeGXhqqB8u6yUZhabNHmAY`,
  );

  const images = await response.json();
  */
  const images = dammyImages;

  return images.map((image) => {
    return {
      id: image.id,
      url: image.urls.regular,
      altText: image.alt_description,
    };
  });
};
