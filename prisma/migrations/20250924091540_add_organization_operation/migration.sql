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
    "accounting_method" TEXT,
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationOperation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationOperation_organization_id_key" ON "public"."OrganizationOperation"("organization_id");

-- AddForeignKey
ALTER TABLE "public"."OrganizationOperation" ADD CONSTRAINT "OrganizationOperation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
