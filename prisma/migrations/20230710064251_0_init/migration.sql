/*
  Warnings:

  - The primary key for the `Content` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Content` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `rating` on the `Content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Content" DROP CONSTRAINT "Content_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "rating",
ADD COLUMN     "rating" INTEGER NOT NULL,
ADD CONSTRAINT "Content_pkey" PRIMARY KEY ("id");
