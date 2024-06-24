/*
  Warnings:

  - You are about to drop the column `rating` on the `Comments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comments" DROP COLUMN "rating",
ADD COLUMN     "comment" TEXT;
