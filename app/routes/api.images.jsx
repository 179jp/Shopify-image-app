import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader = async ({ request }) => {
  const method = request.method;
  if (method !== "GET") {
    return json({
      message: "Request to the homepage",
    });
  }

  const data = await getImages();
  return json(data);
};

// 画像とタグ情報を取得する
const getImages = async () => {
  try {
    const images = await prisma.image.findMany();

    return { images };
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};
