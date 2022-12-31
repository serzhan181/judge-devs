/*
  Warnings:

  - A unique constraint covering the columns `[inspirationId]` on the table `Feature` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Feature" ADD COLUMN     "inspirationId" STRING;

-- CreateIndex
CREATE UNIQUE INDEX "Feature_inspirationId_key" ON "Feature"("inspirationId");

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_inspirationId_fkey" FOREIGN KEY ("inspirationId") REFERENCES "Inspiration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
