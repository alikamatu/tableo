/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "cuisine_type" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "onboarding_data" JSONB,
ADD COLUMN     "onboarding_step" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");
