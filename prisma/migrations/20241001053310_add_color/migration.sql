-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ImageColor" (
    "imageId" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,

    PRIMARY KEY ("imageId", "colorId"),
    CONSTRAINT "ImageColor_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ImageColor_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Color_name_key" ON "Color"("name");

-- CreateIndex
CREATE INDEX "ImageColor_imageId_idx" ON "ImageColor"("imageId");

-- CreateIndex
CREATE INDEX "ImageColor_colorId_idx" ON "ImageColor"("colorId");
