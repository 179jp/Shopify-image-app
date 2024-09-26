/*
  Warnings:

  - You are about to drop the `_CollectionToImage` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Collection` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Collection` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Collection` table. All the data in the column will be lost.
  - Added the required column `collectionId` to the `Collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageId` to the `Collection` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_CollectionToImage_B_index";

-- DropIndex
DROP INDEX "_CollectionToImage_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_CollectionToImage";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Collection" (
    "collectionId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    PRIMARY KEY ("collectionId", "imageId"),
    CONSTRAINT "Collection_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE INDEX "Collection_collectionId_idx" ON "Collection"("collectionId");
CREATE INDEX "Collection_imageId_idx" ON "Collection"("imageId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
