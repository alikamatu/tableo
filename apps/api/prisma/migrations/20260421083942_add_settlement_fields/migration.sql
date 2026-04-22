-- CreateEnum
CREATE TYPE "SettlementType" AS ENUM ('bank', 'momo');

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "paystack_subaccount_code" TEXT,
ADD COLUMN     "settlement_account_number" TEXT,
ADD COLUMN     "settlement_bank" TEXT,
ADD COLUMN     "settlement_type" "SettlementType";
