-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE', 'EXEMPT');

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

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationObligation_organization_id_obligation_id_key" ON "public"."OrganizationObligation"("organization_id", "obligation_id");

-- AddForeignKey
ALTER TABLE "public"."OrganizationObligation" ADD CONSTRAINT "OrganizationObligation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationObligation" ADD CONSTRAINT "OrganizationObligation_obligation_id_fkey" FOREIGN KEY ("obligation_id") REFERENCES "public"."TaxObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
