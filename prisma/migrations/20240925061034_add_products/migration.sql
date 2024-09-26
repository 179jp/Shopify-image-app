-- CreateTable
CREATE TABLE "ProductOnImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "positionX" REAL NOT NULL,
    "positionY" REAL NOT NULL,
    CONSTRAINT "ProductOnImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecommendProduct" (
    "imageId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    PRIMARY KEY ("imageId", "productId"),
    CONSTRAINT "RecommendProduct_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProductOnImage_imageId_idx" ON "ProductOnImage"("imageId");

-- CreateIndex
CREATE INDEX "ProductOnImage_productId_idx" ON "ProductOnImage"("productId");

-- CreateIndex
CREATE INDEX "RecommendProduct_imageId_idx" ON "RecommendProduct"("imageId");

-- CreateIndex
CREATE INDEX "RecommendProduct_productId_idx" ON "RecommendProduct"("productId");
