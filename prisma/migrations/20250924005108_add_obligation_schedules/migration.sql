-- CreateEnum
CREATE TYPE "public"."ScheduleStatus" AS ENUM ('DUE', 'FILED', 'LATE', 'EXEMPT');

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

-- AddForeignKey
ALTER TABLE "public"."ObligationSchedule" ADD CONSTRAINT "ObligationSchedule_org_obligation_id_fkey" FOREIGN KEY ("org_obligation_id") REFERENCES "public"."OrganizationObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
