import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Organization } from '@prisma/client';

interface CreateOrganizationData extends Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {
  // OrganizationRegistration fields
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  trade_name?: string | null;
  line_of_business: string;
  address_line: string;
  region: string;
  city: string;
  zip_code: string;
  tin_registration: string;
  rdo_code: string;
  contact_number: string;
  email_address: string;
  tax_type: any;
  start_date: Date;
  reg_date: Date;
  update_by: string;
}

@Injectable()
export class OrganizationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOrganizationData): Promise<Organization> {
    if (!data.name || !data.category || !data.tax_classification) {
      throw new Error('Required fields missing');
    }

    // Extract registration data
    const {
      first_name,
      middle_name,
      last_name,
      trade_name,
      line_of_business,
      address_line,
      region,
      city,
      zip_code,
      tin_registration,
      rdo_code,
      contact_number,
      email_address,
      tax_type,
      start_date,
      reg_date,
      update_by,
      ...orgData
    } = data;

    return this.prisma.organization.create({
      data: {
        ...orgData,
        deleted_at: null,
        status: {
          create: {
            status: 'PENDING',
          },
        },
        operation: {
          create: {
            fy_start: new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
            fy_end: new Date(new Date().getFullYear(), 11, 31), // December 31st of current year
            vat_reg_effectivity: new Date(new Date().getFullYear(), 0, 1),
            registration_effectivity: new Date(new Date().getFullYear(), 0, 1),
            payroll_cut_off: ['15/30'],
            payment_cut_off: ['15/30'],
            quarter_closing: ['03/31', '06/30', '09/30', '12/31'],
            has_foreign: false,
            has_employees: false,
            is_ewt: false,
            is_fwt: false,
            is_bir_withholding_agent: false,
            accounting_method: 'ACCRUAL',
          },
        },
        registration: {
          create: {
            first_name,
            middle_name,
            last_name,
            trade_name,
            line_of_business,
            address_line,
            region,
            city,
            zip_code,
            tin: tin_registration,
            rdo_code,
            contact_number,
            email_address,
            tax_type,
            start_date,
            reg_date,
            update_by,
          },
        },
      },
      include: {
        status: true,
        operation: true,
        registration: true,
      },
    });
  }

  async getById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        status: true,
      },
    });
  }

  async getByIdBasic(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        status: true,
      },
    });
  }

  async getOperationByOrgId(id: string) {
    return this.prisma.organizationOperation.findUnique({
      where: { organization_id: id },
    });
  }

  async update(id: string, data: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: {
        ...data,
        status: {
          update: {
            last_update: new Date(),
          },
        },
      },
      include: {
        status: true,
      },
    });
  }

  async updateBasic(id: string, data: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: {
        ...data,
        status: {
          update: {
            last_update: new Date(),
          },
        },
      },
      include: {
        status: true,
      },
    });
  }

  async updateOperation(id: string, data: any) {
    return this.prisma.organizationOperation.update({
      where: { organization_id: id },
      data: {
        ...data,
        last_update: new Date(),
      },
    });
  }

  async softDelete(id: string): Promise<Organization> {
    return this.prisma.organization.update({ where: { id }, data: { deleted_at: new Date() } });
  }

  async list(filters?: { category?: string; tax_classification?: string }): Promise<Organization[]> {
    const where = {
      deleted_at: null,
      ...(filters?.category && { category: filters.category as any }),
      ...(filters?.tax_classification && { tax_classification: filters.tax_classification as any }),
    };
    return this.prisma.organization.findMany({
      where,
      include: {
        status: true,
      },
    });
  }

  async listBasic(filters?: { category?: string; tax_classification?: string }): Promise<Organization[]> {
    const where = {
      deleted_at: null,
      ...(filters?.category && { category: filters.category as any }),
      ...(filters?.tax_classification && { tax_classification: filters.tax_classification as any }),
    };
    return this.prisma.organization.findMany({
      where,
      include: {
        status: true,
      },
    });
  }

  async getStatusByOrgId(id: string) {
    return this.prisma.organizationStatus.findUnique({
      where: { organization_id: id },
    });
  }

  async updateStatus(id: string, data: { status: string }) {
    return this.prisma.organizationStatus.update({
      where: { organization_id: id },
      data: {
        status: data.status,
        last_update: new Date(),
      },
    });
  }

  async getRegistrationByOrgId(id: string) {
    return this.prisma.organizationRegistration.findUnique({
      where: { organization_id: id },
    });
  }

  async updateRegistration(id: string, data: any) {
    return this.prisma.organizationRegistration.update({
      where: { organization_id: id },
      data: {
        ...data,
        update_date: new Date(),
      },
    });
  }
}
