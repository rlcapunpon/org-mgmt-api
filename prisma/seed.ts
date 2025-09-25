import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding tax obligations for INDIVIDUAL > Self-Employed/Sole Proprietor/Freelancer...');

  // Income Tax obligations
  await prisma.taxObligation.upsert({
    where: { code: '1701Q' },
    update: {},
    create: {
      code: '1701Q',
      name: 'Quarterly Income Tax Return (Form 1701Q)',
      frequency: 'QUARTERLY',
      due_rule: { day: 45, relative_to: 'fiscal_quarter_end' }, // 45 days after fiscal quarter end
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: '1701' },
    update: {},
    create: {
      code: '1701',
      name: 'Annual Income Tax Return (Form 1701 or 1701A)',
      frequency: 'ANNUAL',
      due_rule: { month: 4, day: 15, relative_to: 'fiscal_year_end' }, // 15th day of 4th month after FY end
      active: true,
    },
  });

  // Business Tax obligations (Non-VAT)
  await prisma.taxObligation.upsert({
    where: { code: '2551Q' },
    update: {},
    create: {
      code: '2551Q',
      name: 'Quarterly Percentage Tax (Form 2551Q)',
      frequency: 'QUARTERLY',
      due_rule: { day: 25, relative_to: 'calendar_quarter_end' }, // 25th day after quarter end
      active: true,
    },
  });

  // Business Tax obligations (VAT)
  await prisma.taxObligation.upsert({
    where: { code: '2550Q' },
    update: {},
    create: {
      code: '2550Q',
      name: 'Quarterly VAT Return (Form 2550Q)',
      frequency: 'QUARTERLY',
      due_rule: { day: 25, relative_to: 'calendar_quarter_end' }, // 25th day after quarter end
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: '2550M' },
    update: {},
    create: {
      code: '2550M',
      name: 'Monthly VAT Return (Form 2550M)',
      frequency: 'MONTHLY',
      due_rule: { day: 20, relative_to: 'calendar_month_end' }, // 20th day of following month
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: 'SLSP' },
    update: {},
    create: {
      code: 'SLSP',
      name: 'Summary List of Sales and Purchases (SLSP)',
      frequency: 'QUARTERLY',
      due_rule: { day: 25, relative_to: 'calendar_quarter_end' }, // Due with VAT return
      active: true,
    },
  });

  // Withholding Tax obligations (Compensation - if with employees)
  await prisma.taxObligation.upsert({
    where: { code: '1601C' },
    update: {},
    create: {
      code: '1601C',
      name: 'Monthly Withholding Tax on Compensation (Form 1601C)',
      frequency: 'MONTHLY',
      due_rule: { day: 10, relative_to: 'calendar_month_end' }, // 10th day of following month
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: '1604C' },
    update: {},
    create: {
      code: '1604C',
      name: 'Annual Employee Information Return (Form 1604C) & Alphalist',
      frequency: 'ANNUAL',
      due_rule: { month: 1, day: 31 }, // On or before Jan 31 following year
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: '2316' },
    update: {},
    create: {
      code: '2316',
      name: 'BIR Form 2316 (Certificate of Compensation Payment/Tax Withheld)',
      frequency: 'ANNUAL',
      due_rule: { month: 1, day: 31 }, // Issued annually to employees
      active: true,
    },
  });

  // Withholding Tax obligations (Expanded - if paying professionals, landlords, suppliers)
  await prisma.taxObligation.upsert({
    where: { code: '0619E' },
    update: {},
    create: {
      code: '0619E',
      name: 'Monthly EWT Remittance (Form 0619E)',
      frequency: 'MONTHLY',
      due_rule: { day: 10, relative_to: 'calendar_month_end' }, // 10th day of following month
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: '1601EQ' },
    update: {},
    create: {
      code: '1601EQ',
      name: 'Quarterly EWT Return (Form 1601EQ)',
      frequency: 'QUARTERLY',
      due_rule: { day: 'last', relative_to: 'calendar_quarter_end' }, // Last day of month following quarter
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: 'QAP' },
    update: {},
    create: {
      code: 'QAP',
      name: 'Quarterly Alphalist of Payees (QAP)',
      frequency: 'QUARTERLY',
      due_rule: { day: 'last', relative_to: 'calendar_quarter_end' }, // Filed with 1601EQ
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: '2307' },
    update: {},
    create: {
      code: '2307',
      name: 'Certificate of Creditable Tax Withheld at Source (BIR Form 2307)',
      frequency: 'QUARTERLY',
      due_rule: { day: 'last', relative_to: 'calendar_quarter_end' }, // Quarterly filing
      active: true,
    },
  });

  // Withholding Tax obligations (Final)
  await prisma.taxObligation.upsert({
    where: { code: '0619F' },
    update: {},
    create: {
      code: '0619F',
      name: 'Monthly Final Tax Remittance (Form 0619F)',
      frequency: 'MONTHLY',
      due_rule: { day: 10, relative_to: 'calendar_month_end' }, // 10th day of following month
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: '1601FQ' },
    update: {},
    create: {
      code: '1601FQ',
      name: 'Quarterly Final Tax Return (Form 1601FQ)',
      frequency: 'QUARTERLY',
      due_rule: { day: 'last', relative_to: 'calendar_quarter_end' }, // Last day of month following quarter
      active: true,
    },
  });

  // Other obligations
  await prisma.taxObligation.upsert({
    where: { code: '0605' },
    update: {},
    create: {
      code: '0605',
      name: 'Annual Registration Fee',
      frequency: 'ANNUAL',
      due_rule: { month: 1, day: 31 }, // Annual registration
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: 'BOOKS' },
    update: {},
    create: {
      code: 'BOOKS',
      name: 'Registration of Books of Accounts',
      frequency: 'ONE_TIME',
      due_rule: { conditional: true }, // Conditional/one-time
      active: true,
    },
  });

  await prisma.taxObligation.upsert({
    where: { code: 'OR/INV' },
    update: {},
    create: {
      code: 'OR/INV',
      name: 'Registration of Official Receipts/Invoices',
      frequency: 'ONE_TIME',
      due_rule: { conditional: true }, // Conditional/one-time
      active: true,
    },
  });

  // SAWT - Summary Alphalist of Withholding Tax (conditional)
  await prisma.taxObligation.upsert({
    where: { code: 'SAWT' },
    update: {},
    create: {
      code: 'SAWT',
      name: 'Summary Alphalist of Withholding Tax (SAWT)',
      frequency: 'ANNUAL',
      due_rule: { conditional: true, attached_to: '1701' }, // Attached to Income Tax Return
      active: true,
    },
  });

  console.log('Tax obligations seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });