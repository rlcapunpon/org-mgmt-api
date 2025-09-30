/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Organization, BusinessStatus, OrganizationStatusChangeReasonEnum } from '@prisma/client';

interface CreateOrganizationData
  extends Omit<
    Organization,
    'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'address' | 'name'
  > {
  // OrganizationRegistration fields
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  registered_name?: string; // Now optional, required based on category
  trade_name?: string | null;
  line_of_business: string;
  address_line: string;
  region: string;
  city: string;
  zip_code: string;
  rdo_code: string;
  contact_number: string;
  email_address: string;
  start_date: Date;
  update_by: string;
  // OrganizationOperation fields (optional)
  fy_start?: Date;
  fy_end?: Date;
  vat_reg_effectivity?: Date;
  registration_effectivity?: Date;
  payroll_cut_off?: string[];
  payment_cut_off?: string[];
  quarter_closing?: string[];
  has_foreign?: boolean;
  has_employees?: boolean;
  is_ewt?: boolean;
  is_fwt?: boolean;
  is_bir_withholding_agent?: boolean;
  accounting_method?: string;
}

@Injectable()
export class OrganizationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOrganizationData): Promise<Organization> {
    if (!data.category || !data.tax_classification) {
      throw new Error('Required fields missing');
    }

    // Extract registration data
    const {
      first_name,
      middle_name,
      last_name,
      registered_name,
      trade_name,
      line_of_business,
      address_line,
      region,
      city,
      zip_code,
      rdo_code,
      contact_number,
      email_address,
      start_date,
      update_by,
      // OrganizationOperation fields
      fy_start,
      fy_end,
      vat_reg_effectivity,
      registration_effectivity,
      payroll_cut_off,
      payment_cut_off,
      quarter_closing,
      has_foreign,
      has_employees,
      is_ewt,
      is_fwt,
      is_bir_withholding_agent,
      accounting_method,

      // Extract other fields
      ...orgData
    } = data;

    // Construct organization name based on category
    let organizationName: string;
    let finalRegisteredName = registered_name;
    if (data.category === 'INDIVIDUAL') {
      if (!first_name || !last_name) {
        throw new Error(
          'first_name and last_name are required for INDIVIDUAL category',
        );
      }
      // For INDIVIDUAL, construct name from first_name + middle_name + last_name
      organizationName = [first_name, middle_name, last_name]
        .filter(Boolean)
        .join(' ');
    } else if (data.category === 'NON_INDIVIDUAL') {
      // For NON_INDIVIDUAL, registered_name is required and used as organization name
      if (!registered_name) {
        throw new Error(
          'registered_name is required for NON_INDIVIDUAL category',
        );
      }
      organizationName = registered_name;
      finalRegisteredName = registered_name;
    } else {
      throw new Error('Invalid category');
    }

    // Set default values for OrganizationOperation if not provided
    const defaultFyStart = fy_start || new Date('2024-12-31T16:00:00.000Z');
    const defaultFyEnd = fy_end || new Date('2025-12-30T16:00:00.000Z');
    const defaultVatRegEffectivity =
      vat_reg_effectivity || new Date('2024-12-31T16:00:00.000Z');
    const defaultRegistrationEffectivity =
      registration_effectivity || new Date('2024-12-31T16:00:00.000Z');
    const defaultPayrollCutOff = payroll_cut_off || ['15/30'];
    const defaultPaymentCutOff = payment_cut_off || ['15/30'];
    const defaultQuarterClosing = quarter_closing || [
      '03/31',
      '06/30',
      '09/30',
      '12/31',
    ];
    const defaultHasForeign = has_foreign ?? false;
    const defaultHasEmployees = has_employees ?? false;
    const defaultIsEwt = is_ewt ?? false;
    const defaultIsFwt = is_fwt ?? false;
    const defaultIsBirWithholdingAgent = is_bir_withholding_agent ?? false;
    const defaultAccountingMethod = accounting_method || 'ACCRUAL';

    return this.prisma.organization.create({
      data: {
        name: organizationName,
        ...orgData,
        address: `${address_line}, ${city}, ${region}, ${zip_code}`,
        deleted_at: null,
        status: {
          create: {
            status: BusinessStatus.PENDING_REG,
          },
        },
        operation: {
          create: {
            fy_start: defaultFyStart,
            fy_end: defaultFyEnd,
            vat_reg_effectivity: defaultVatRegEffectivity,
            registration_effectivity: defaultRegistrationEffectivity,
            payroll_cut_off: defaultPayrollCutOff,
            payment_cut_off: defaultPaymentCutOff,
            quarter_closing: defaultQuarterClosing,
            has_foreign: defaultHasForeign,
            has_employees: defaultHasEmployees,
            is_ewt: defaultIsEwt,
            is_fwt: defaultIsFwt,
            is_bir_withholding_agent: defaultIsBirWithholdingAgent,
            accounting_method: defaultAccountingMethod as any,
          },
        },
        registration: {
          create: {
            first_name: first_name || '',
            middle_name,
            last_name: last_name || '',
            registered_name: finalRegisteredName || '',
            trade_name,
            line_of_business,
            address_line,
            region,
            city,
            zip_code,
            tin: orgData.tin!,
            rdo_code,
            contact_number,
            email_address,
            tax_type: orgData.tax_classification,
            start_date,
            reg_date: orgData.registration_date!,
            update_by,
          },
        },
        // owners: {
        //   create: {
        //     user_id: creator_user_id,
        //   },
        // },
      },
      include: {
        status: true,
        operation: true,
        registration: true,
        // owners: true,
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

  async update(
    id: string,
    data: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Organization> {
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

  async updateBasic(
    id: string,
    data: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Organization> {
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
    // First check if the organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Check if operation exists
    const existing = await this.prisma.organizationOperation.findUnique({
      where: { organization_id: id },
    });

    if (existing) {
      // Update existing record
      return this.prisma.organizationOperation.update({
        where: { organization_id: id },
        data: {
          ...data,
          last_update: new Date(),
        },
      });
    } else {
      // Create new record
      return this.prisma.organizationOperation.create({
        data: {
          organization_id: id,
          ...data,
          last_update: new Date(),
        },
      });
    }
  }

  async softDelete(id: string): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async list(filters?: {
    category?: string;
    tax_classification?: string;
  }): Promise<Organization[]> {
    const where = {
      deleted_at: null,

      ...(filters?.category && { category: filters.category as any }),

      ...(filters?.tax_classification && {
        tax_classification: filters.tax_classification as any,
      }),
    };
    return this.prisma.organization.findMany({
      where,
      include: {
        status: true,
      },
    });
  }

  async listBasic(filters?: {
    category?: string;
    tax_classification?: string;
  }): Promise<Organization[]> {
    const where = {
      deleted_at: null,

      ...(filters?.category && { category: filters.category as any }),

      ...(filters?.tax_classification && {
        tax_classification: filters.tax_classification as any,
      }),
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

  async updateStatus(id: string, data: { status: BusinessStatus }) {
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
    // First check if the organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      // Use P2025 error format to match Prisma's "Record not found" error
      const error = new Error('Record to update not found.');
      (error as any).code = 'P2025';
      throw error;
    }

    // Check if registration exists
    const existing = await this.prisma.organizationRegistration.findUnique({
      where: { organization_id: id },
    });

    if (existing) {
      // Update existing record
      return this.prisma.organizationRegistration.update({
        where: { organization_id: id },
        data: {
          ...data,
          update_date: new Date(),
        },
      });
    } else {
      // Create new record
      return this.prisma.organizationRegistration.create({
        data: {
          organization_id: id,
          ...data,
          update_date: new Date(),
        },
      });
    }
  }

  async createStatusChangeReason(data: {
    organization_id: string;
    reason: OrganizationStatusChangeReasonEnum;
    description?: string;
    updated_by: string;
  }) {
    return this.prisma.organizationStatusChangeReason.create({
      data: {
        organization_id: data.organization_id,
        reason: data.reason,
        description: data.description,
        updated_by: data.updated_by,
      },
    });
  }

  async getStatusChangeReasonsByOrgId(organization_id: string) {
    return this.prisma.organizationStatusChangeReason.findMany({
      where: { organization_id },
      orderBy: { update_date: 'desc' },
    });
  }
}
