/*
  Warnings:

  - The `category` column on the `events` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "category",
ADD COLUMN     "category" TEXT;

-- CreateIndex
CREATE INDEX "events_category_idx" ON "events"("category");
