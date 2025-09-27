-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('INDIVIDUAL', 'NON_INDIVIDUAL');

-- CreateEnum
CREATE TYPE "public"."SubCategory" AS ENUM ('SELF_EMPLOYED', 'SOLE_PROPRIETOR', 'FREELANCER', 'CORPORATION', 'PARTNERSHIP', 'BMBE', 'MIXED_INCOME', 'ESTATE', 'DONOR', 'FOREIGN_CORP', 'COOPERATIVE', 'NGO', 'GOVERNMENT', 'GOCC', 'REAL_ESTATE_DEV', 'IMPORTER', 'EXPORTER', 'OTHERS');

-- CreateEnum
CREATE TYPE "public"."TaxClassification" AS ENUM ('VAT', 'NON_VAT', 'EXCEMPT');

-- CreateEnum
CREATE TYPE "public"."Frequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE', 'EXEMPT');

-- CreateEnum
CREATE TYPE "public"."ScheduleStatus" AS ENUM ('DUE', 'FILED', 'LATE', 'EXEMPT');

-- CreateEnum
CREATE TYPE "public"."AccountingMethod" AS ENUM ('ACCRUAL', 'CASH', 'OTHERS');

-- CreateEnum
CREATE TYPE "public"."OrganizationStatusChangeReasonEnum" AS ENUM ('EXPIRED', 'OPTED_OUT', 'PAYMENT_PENDING', 'VIOLATIONS');

-- CreateEnum
CREATE TYPE "public"."BusinessStatus" AS ENUM ('REGISTERED', 'PENDING_REG', 'ACTIVE', 'INACTIVE', 'CESSATION', 'CLOSED', 'NON_COMPLIANT', 'UNDER_AUDIT', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."TaxObligationStatus" AS ENUM ('MANDATORY', 'OPTIONAL', 'EXEMPT', 'CONDITIONAL', 'ONE_TIME', 'RETIRED');

-- CreateEnum
CREATE TYPE "public"."OrganizationTaxObligationStatus" AS ENUM ('NOT_APPLICABLE', 'ASSIGNED', 'ACTIVE', 'DUE', 'FILED', 'ADMIN_REVERTED', 'BIR_REVERTED', 'PAID', 'OVERDUE', 'LATE', 'EXEMPT', 'SUSPENDED', 'CLOSED');

-- CreateTable
CREATE TABLE "public"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tin" TEXT,
    "category" "public"."Category" NOT NULL,
    "subcategory" "public"."SubCategory",
    "tax_classification" "public"."TaxClassification" NOT NULL,
    "registration_date" TIMESTAMP(3),
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationRegistration" (
    "organization_id" TEXT NOT NULL,
    "first_name" TEXT,
    "middle_name" TEXT,
    "last_name" TEXT,
    "registered_name" TEXT,
    "trade_name" TEXT,
    "line_of_business" TEXT NOT NULL,
    "address_line" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "tin" VARCHAR(12) NOT NULL,
    "rdo_code" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "tax_type" "public"."TaxClassification" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "reg_date" TIMESTAMP(3) NOT NULL,
    "update_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationRegistration_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "public"."TaxObligation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" "public"."Frequency" NOT NULL,
    "due_rule" JSONB NOT NULL,
    "status" "public"."TaxObligationStatus" NOT NULL DEFAULT 'MANDATORY',
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
    "status" "public"."OrganizationTaxObligationStatus" NOT NULL DEFAULT 'ASSIGNED',
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

-- CreateTable
CREATE TABLE "public"."OrganizationStatus" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "status" "public"."BusinessStatus" NOT NULL DEFAULT 'PENDING_REG',
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationOperation" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "fy_start" TIMESTAMP(3) NOT NULL,
    "fy_end" TIMESTAMP(3) NOT NULL,
    "vat_reg_effectivity" TIMESTAMP(3) NOT NULL,
    "registration_effectivity" TIMESTAMP(3) NOT NULL,
    "payroll_cut_off" TEXT[],
    "payment_cut_off" TEXT[],
    "quarter_closing" TEXT[],
    "has_foreign" BOOLEAN NOT NULL DEFAULT false,
    "has_employees" BOOLEAN NOT NULL DEFAULT false,
    "is_ewt" BOOLEAN NOT NULL DEFAULT false,
    "is_fwt" BOOLEAN NOT NULL DEFAULT false,
    "is_bir_withholding_agent" BOOLEAN NOT NULL DEFAULT false,
    "accounting_method" "public"."AccountingMethod" NOT NULL DEFAULT 'ACCRUAL',
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationStatusChangeReason" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "reason" "public"."OrganizationStatusChangeReasonEnum" NOT NULL,
    "description" TEXT,
    "update_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "OrganizationStatusChangeReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationOwner" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationTaxObligationHistory" (
    "id" TEXT NOT NULL,
    "org_obligation_id" TEXT NOT NULL,
    "prev_status" "public"."OrganizationTaxObligationStatus" NOT NULL,
    "new_status" "public"."OrganizationTaxObligationStatus" NOT NULL,
    "desc" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "OrganizationTaxObligationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxObligation_code_key" ON "public"."TaxObligation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationObligation_organization_id_obligation_id_key" ON "public"."OrganizationObligation"("organization_id", "obligation_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationStatus_organization_id_key" ON "public"."OrganizationStatus"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationOperation_organization_id_key" ON "public"."OrganizationOperation"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationOwner_org_id_user_id_key" ON "public"."OrganizationOwner"("org_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."OrganizationRegistration" ADD CONSTRAINT "OrganizationRegistration_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationObligation" ADD CONSTRAINT "OrganizationObligation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationObligation" ADD CONSTRAINT "OrganizationObligation_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "public"."TaxObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ObligationSchedule" ADD CONSTRAINT "ObligationSchedule_org_obligation_id_fkey" FOREIGN KEY ("org_obligation_id") REFERENCES "public"."OrganizationObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationStatus" ADD CONSTRAINT "OrganizationStatus_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationOperation" ADD CONSTRAINT "OrganizationOperation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationStatusChangeReason" ADD CONSTRAINT "OrganizationStatusChangeReason_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationOwner" ADD CONSTRAINT "OrganizationOwner_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationTaxObligationHistory" ADD CONSTRAINT "OrganizationTaxObligationHistory_org_obligation_id_fkey" FOREIGN KEY ("org_obligation_id") REFERENCES "public"."OrganizationObligation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
