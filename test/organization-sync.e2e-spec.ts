import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/database/prisma.service';
import { AppModule } from '../src/app.module';
import { TaxClassification, Category, SubCategory, BusinessStatus } from '@prisma/client';

describe('Organization Sync (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let organizationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up
    if (organizationId) {
      await prisma.organizationRegistration.deleteMany({
        where: { organization_id: organizationId },
      });
      await prisma.organizationStatus.deleteMany({
        where: { organization_id: organizationId },
      });
      await prisma.organization.deleteMany({
        where: { id: organizationId },
      });
    }
    
    await app.close();
  });

  beforeEach(async () => {
    // Clean up first in case of failed previous tests
    if (organizationId) {
      await prisma.organizationRegistration.deleteMany({
        where: { organization_id: organizationId },
      });
      await prisma.organizationStatus.deleteMany({
        where: { organization_id: organizationId },
      });
      await prisma.organization.deleteMany({
        where: { id: organizationId },
      });
    }

    // Create a test organization
    const orgData = {
      name: 'Test Organization',
      tin: '123456789000',
      category: Category.INDIVIDUAL,
      subcategory: SubCategory.SELF_EMPLOYED,
      tax_classification: TaxClassification.VAT,
      registration_date: new Date('2024-01-01'),
    };

    const organization = await prisma.organization.create({
      data: orgData,
    });
    organizationId = organization.id;

    // Create organization status
    await prisma.organizationStatus.create({
      data: {
        organization_id: organizationId,
        status: BusinessStatus.ACTIVE,
      },
    });

    // Create initial registration
    await prisma.organizationRegistration.create({
      data: {
        organization_id: organizationId,
        first_name: 'John',
        last_name: 'Doe',
        line_of_business: '6201',
        address_line: '123 Main St',
        region: 'NCR',
        city: 'Makati',
        zip_code: '1223',
        tin: '123456789000',
        rdo_code: '001',
        contact_number: '+639123456789',
        email_address: 'john@example.com',
        tax_type: TaxClassification.VAT,
        start_date: new Date('2024-01-01'),
        reg_date: new Date('2024-01-01'),
        update_by: 'test-user',
      },
    });
  });

  afterEach(async () => {
    if (organizationId) {
      await prisma.organizationRegistration.deleteMany({
        where: { organization_id: organizationId },
      });
      await prisma.organizationStatus.deleteMany({
        where: { organization_id: organizationId },
      });
      await prisma.organization.deleteMany({
        where: { id: organizationId },
      });
    }
  });

  describe('PUT /api/org/organizations/:id/registration', () => {
    it('should update registration and sync TIN to Organization table', async () => {
      const newTin = '987654321000';

      await request(app.getHttpServer())
        .put(`/api/org/organizations/${organizationId}/registration`)
        .send({
          tin: newTin,
          first_name: 'Jane',
          last_name: 'Smith',
        })
        .expect(200);

      // Verify registration was updated
      const registration = await prisma.organizationRegistration.findUnique({
        where: { organization_id: organizationId },
      });
      expect(registration?.tin).toBe(newTin);

      // Verify organization TIN was synced
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      expect(organization?.tin).toBe(newTin);
    });

    it('should update registration and sync tax classification to Organization table', async () => {
      await request(app.getHttpServer())
        .put(`/api/org/organizations/${organizationId}/registration`)
        .send({
          tax_type: TaxClassification.NON_VAT,
          line_of_business: '6202',
        })
        .expect(200);

      // Verify registration was updated
      const registration = await prisma.organizationRegistration.findUnique({
        where: { organization_id: organizationId },
      });
      expect(registration?.tax_type).toBe(TaxClassification.NON_VAT);

      // Verify organization tax classification was synced
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      expect(organization?.tax_classification).toBe(TaxClassification.NON_VAT);
    });

    it('should update registration and sync both TIN and tax classification', async () => {
      const newTin = '555666777888';

      await request(app.getHttpServer())
        .put(`/api/org/organizations/${organizationId}/registration`)
        .send({
          tin: newTin,
          tax_type: TaxClassification.EXCEMPT,
          contact_number: '+639987654321',
        })
        .expect(200);

      // Verify registration was updated
      const registration = await prisma.organizationRegistration.findUnique({
        where: { organization_id: organizationId },
      });
      expect(registration?.tin).toBe(newTin);
      expect(registration?.tax_type).toBe(TaxClassification.EXCEMPT);
      expect(registration?.contact_number).toBe('+639987654321');

      // Verify organization fields were synced
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      expect(organization?.tin).toBe(newTin);
      expect(organization?.tax_classification).toBe(TaxClassification.EXCEMPT);
    });

    it('should update registration without syncing when TIN and tax_type are not provided', async () => {
      const originalTin = '123456789000';
      const originalTaxClassification = TaxClassification.VAT;

      await request(app.getHttpServer())
        .put(`/api/org/organizations/${organizationId}/registration`)
        .send({
          first_name: 'Updated',
          last_name: 'Name',
          contact_number: '+639111222333',
        })
        .expect(200);

      // Verify registration was updated
      const registration = await prisma.organizationRegistration.findUnique({
        where: { organization_id: organizationId },
      });
      expect(registration?.first_name).toBe('Updated');
      expect(registration?.last_name).toBe('Name');
      expect(registration?.contact_number).toBe('+639111222333');

      // Verify organization fields remained unchanged
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      expect(organization?.tin).toBe(originalTin);
      expect(organization?.tax_classification).toBe(originalTaxClassification);
    });

    it('should handle validation errors for invalid TIN length', async () => {
      await request(app.getHttpServer())
        .put(`/api/org/organizations/${organizationId}/registration`)
        .send({
          tin: '123', // Too short
          first_name: 'Test',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('tin must be longer than or equal to 9 characters');
        });

      // Verify organization TIN was not changed
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      expect(organization?.tin).toBe('123456789000'); // Original TIN
    });

    it('should return 404 for non-existent organization', async () => {
      const nonExistentId = 'non-existent-id';

      await request(app.getHttpServer())
        .put(`/api/org/organizations/${nonExistentId}/registration`)
        .send({
          tin: '987654321000',
          first_name: 'Test',
        })
        .expect(404);
    });
  });
});