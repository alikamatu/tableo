/*
  Warnings:

  - You are about to drop the column `cuisine_type` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `onboarding_data` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `onboarding_step` on the `restaurants` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `restaurants` table. All the data in the column will be lost.
  - Made the column `slug` on table `restaurants` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "OnboardStep" AS ENUM ('welcome', 'restaurant_info', 'location_hours', 'payment', 'done');

-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "cuisine_type",
DROP COLUMN "onboarding_data",
DROP COLUMN "onboarding_step",
DROP COLUMN "website",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Ghana',
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "cuisine" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GHS',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "onboard_complete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboard_step" "OnboardStep" NOT NULL DEFAULT 'welcome',
ADD COLUMN     "opening_hours" JSONB,
ADD COLUMN     "paystack_public_key" TEXT,
ADD COLUMN     "paystack_secret_key" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboard_step" "OnboardStep" NOT NULL DEFAULT 'welcome';

-- CreateIndex
CREATE INDEX "restaurants_slug_idx" ON "restaurants"("slug");
