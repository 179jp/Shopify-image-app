import { json } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const method = request.method;

  console.log(request);

  switch (method) {
    case "GET": {
      const data = await getImage(request);
      return json(data);
    }
    case "POST": {
      return json({
        message: "POST request to the homepage",
      });
    }
    default: {
      return json({
        message: "Request to the homepage",
      });
    }
  }
};

// 画像とタグ情報を取得する
const getImage = async (request) => {
  const { fileId } = request.query;

  console.log(request);

  try {
    const image = await prisma.Image.findUnique({
      where: { fileId: fileId },
      include: {
        tags: true,
      },
    });

    const tags = await prisma.Tag.findMany();

    const imageTags = await prisma.ImageTag.findMany({
      where: { imageId: image.id },
    });

    return { image, tags, imageTags };
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};
