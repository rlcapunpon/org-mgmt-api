/*
  Warnings:

  - The `accounting_method` column on the `OrganizationOperation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."AccountingMethod" AS ENUM ('ACCRUAL', 'CASH');

-- AlterTable
ALTER TABLE "public"."OrganizationOperation" DROP COLUMN "accounting_method",
ADD COLUMN     "accounting_method" "public"."AccountingMethod" NOT NULL DEFAULT 'ACCRUAL';
