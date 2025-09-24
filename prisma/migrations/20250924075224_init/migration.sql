-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('INDIVIDUAL', 'NON_INDIVIDUAL');

-- CreateEnum
CREATE TYPE "public"."TaxClassification" AS ENUM ('VAT', 'NON_VAT', 'WITHHOLDING', 'MIXED', 'OTHERS');

-- CreateEnum
CREATE TYPE "public"."Frequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE', 'EXEMPT');

-- CreateEnum
CREATE TYPE "public"."ScheduleStatus" AS ENUM ('DUE', 'FILED', 'LATE', 'EXEMPT');

-- CreateTable
CREATE TABLE "public"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tin" TEXT,
    "category" "public"."Category" NOT NULL,
    "subcategory" TEXT,
    "tax_classification" "public"."TaxClassification" NOT NULL,
    "registration_date" TIMESTAMP(3),
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaxObligation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" "public"."Frequency" NOT NULL,
    "due_rule" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationObligation" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "obligation_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ObligationSchedule" (
    "id" TEXT NOT NULL,
    "org_obligation_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."ScheduleStatus" NOT NULL DEFAULT 'DUE',
    "filed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObligationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationObligation_organization_id_obligation_id_key" ON "public"."OrganizationObligation"("organization_id", "obligation_id");

-- AddForeignKey
ALTER TABLE "public"."OrganizationObligation" ADD CONSTRAINT "OrganizationObligation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationObligation" ADD CONSTRAINT "OrganizationObligation_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "public"."TaxObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ObligationSchedule" ADD CONSTRAINT "ObligationSchedule_org_obligation_id_fkey" FOREIGN KEY ("org_obligation_id") REFERENCES "public"."OrganizationObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
