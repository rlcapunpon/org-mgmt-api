/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OrganizationRepository } from '../repositories/organization.repository';
import { OrganizationSyncService } from '../../../common/services/organization-sync.service';
import { RbacUtilityService } from '../../../common/services/rbac-utility.service';
import {
  CreateOrganizationRequestDto,
  UpdateOrganizationRequestDto,
  UpdateOrganizationOperationRequestDto,
  UpdateOrganizationStatusRequestDto,
  UpdateOrganizationRegistrationRequestDto,
} from '../dto/organization-request.dto';
import { Organization } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(
    private repo: OrganizationRepository,
    private httpService: HttpService,
    private syncService: OrganizationSyncService,
    private rbacUtilityService: RbacUtilityService,
  ) {}

  async create(
    data: CreateOrganizationRequestDto,
    userId: string,
    jwtToken?: string,
  ): Promise<Organization> {
    // Transform undefined subcategory to null for database compatibility
    const transformedData = {
      ...data,
      subcategory: data.subcategory ?? null,
      update_by: userId,
    };
    const organization = await this.repo.create(transformedData);

    // Call RBAC API to create resource if JWT token is provided and not in test environment
    if (jwtToken && process.env.NODE_ENV !== 'test') {
      try {
        await firstValueFrom(
          this.httpService.post(
            `${process.env.RBAC_API_URL}/resources`,
            {
              id: organization.id,
              name: organization.name,
              description: `Organization ${organization.name} (${organization.tin})`,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            },
          ),
        );
      } catch (error) {
        // Log the error but don't fail the organization creation
        console.error('Failed to create resource in RBAC API:', error);
      }
    }

    return organization;
  }

  async findById(id: string): Promise<Organization | null> {
    return this.repo.getByIdBasic(id);
  }

  async findByIdWithOperation(id: string): Promise<Organization | null> {
    return this.repo.getById(id);
  }

  async update(
    id: string,
    data: UpdateOrganizationRequestDto,
  ): Promise<Organization> {
    try {
      // Transform undefined subcategory to null for database compatibility
      const transformedData = {
        ...data,
        subcategory: data.subcategory ?? null,
      };

      // Separate organization data from related data
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
        tin: registrationTin,
        rdo_code,
        contact_number,
        email_address,
        start_date,
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
        ...orgData
      } = transformedData;

      // Handle organization name update based on category
      const finalOrgData: any = { ...orgData };

      // If category is being updated or if we have name-related fields, recalculate the name
      if (
        orgData.category ||
        first_name ||
        middle_name ||
        last_name ||
        data.registered_name
      ) {
        const category =
          orgData.category || (await this.repo.getByIdBasic(id))?.category;
        const registeredName = data.registered_name;

        if (category === 'INDIVIDUAL') {
          // For INDIVIDUAL, construct name from first_name + middle_name + last_name
          const currentRegistration =
            await this.repo.getRegistrationByOrgId(id);
          const finalFirstName =
            first_name || (currentRegistration as any)?.first_name || '';
          const finalMiddleName =
            middle_name !== undefined
              ? middle_name
              : (currentRegistration as any)?.middle_name || '';
          const finalLastName =
            last_name || (currentRegistration as any)?.last_name || '';
          finalOrgData.name = [finalFirstName, finalMiddleName, finalLastName]
            .filter(Boolean)
            .join(' ');
        } else if (category === 'NON_INDIVIDUAL') {
          // For NON_INDIVIDUAL, use registered_name as organization name
          const currentRegistration =
            await this.repo.getRegistrationByOrgId(id);
          finalOrgData.name =
            registeredName ||
            (currentRegistration as any)?.registered_name ||
            'TBD';
        }
      }

      // Update organization basic data
      const updatedOrg = await this.repo.updateBasic(id, finalOrgData);

      // Update organization registration if registration fields are provided
      const registrationData = {
        first_name,
        middle_name,
        last_name,
        registered_name: data.registered_name,
        trade_name,
        line_of_business,
        address_line,
        region,
        city,
        zip_code,
        tin: registrationTin,
        rdo_code,
        contact_number,
        email_address,
        start_date,
        reg_date: orgData.registration_date,
        tax_type: orgData.tax_classification,
      };

      // Only update registration if at least one field is provided
      const hasRegistrationData = Object.values(registrationData).some(
        (value) => value !== undefined && value !== null,
      );

      if (hasRegistrationData) {
        await this.repo.updateRegistration(id, registrationData);
      }

      // Update organization operation if operation fields are provided
      const operationData = {
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
      };

      // Only update operation if at least one field is provided
      const hasOperationData = Object.values(operationData).some(
        (value) => value !== undefined && value !== null,
      );

      if (hasOperationData) {
        await this.repo.updateOperation(id, operationData);
      }

      return updatedOrg;
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.repo.softDelete(id);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async list(
    filters: {
      category?: string;
      tax_classification?: string;
    },
    userId: string,
    isSuperAdmin: boolean,
    jwtToken?: string,
  ): Promise<Organization[]> {
    // Log the user attempt to access organizations
    console.log(`[GET /organizations] SERVICE: Starting list operation`);
    console.log(`User ${userId} (super admin: ${isSuperAdmin}) attempting to GET /organizations with filters:`, JSON.stringify(filters));
    console.log(`[GET /organizations] SERVICE: JWT token provided: ${!!jwtToken}`);
    console.log(`[GET /organizations] SERVICE: Environment: ${process.env.NODE_ENV}`);

    // If super admin, return all organizations
    if (isSuperAdmin) {
      console.log(`[GET /organizations] SERVICE: User is super admin, bypassing RBAC filtering`);
      console.log(`[GET /organizations] SERVICE: Calling repository.listBasic with filters:`, JSON.stringify(filters));

      const result = await this.repo.listBasic(filters);

      console.log(`[GET /organizations] SERVICE: Repository returned ${result.length} organizations for super admin`);
      console.log(`[GET /organizations] SERVICE: Super admin flow completed successfully`);

      return result;
    }

    // Skip RBAC filtering in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log(`[GET /organizations] SERVICE: Test environment detected, skipping RBAC filtering`);
      console.log(`[GET /organizations] SERVICE: Calling repository.listBasic with filters:`, JSON.stringify(filters));

      const result = await this.repo.listBasic(filters);

      console.log(`[GET /organizations] SERVICE: Repository returned ${result.length} organizations for test environment`);
      console.log(`[GET /organizations] SERVICE: Test environment flow completed successfully`);

      return result;
    }

    // For non-super admin users, get their accessible resources and filter organizations
    console.log(`[GET /organizations] SERVICE: User is not super admin, proceeding with RBAC filtering`);
    console.log(`[GET /organizations] SERVICE: Calling RBAC utility service to get user resources`);

    try {
      const userResources = await this.rbacUtilityService.getUserResources(
        userId,
        jwtToken || '',
      );

      console.log(`[GET /organizations] SERVICE: RBAC utility returned user resources:`, JSON.stringify(userResources, null, 2));

      // Extract resource IDs (organization IDs) from user resources
      const accessibleOrgIds = userResources.resources.map(
        (resource) => resource.resourceId,
      );

      console.log(`[GET /organizations] SERVICE: Extracted ${accessibleOrgIds.length} accessible organization IDs:`, accessibleOrgIds);

      // If user has no accessible resources, return empty array
      if (accessibleOrgIds.length === 0) {
        console.log(`[GET /organizations] SERVICE: User has no accessible organization resources, returning empty array`);
        console.log(`[GET /organizations] SERVICE: RBAC filtering completed - no access`);
        return [];
      }

      // Filter organizations by accessible IDs and apply other filters
      console.log(`[GET /organizations] SERVICE: Calling repository.listBasicWithIds with filters:`, JSON.stringify(filters), `and IDs:`, accessibleOrgIds);

      const result = await this.repo.listBasicWithIds(filters, accessibleOrgIds);

      console.log(`[GET /organizations] SERVICE: Repository returned ${result.length} organizations after RBAC filtering`);
      console.log(`[GET /organizations] SERVICE: RBAC filtering completed successfully`);

      return result;
    } catch (error) {
      // If RBAC API fails, log error and return empty array for security
      console.warn(
        `[GET /organizations] SERVICE: Failed to fetch permissions for user ${userId}:`,
        (error as Error).message,
      );
      console.warn(`[GET /organizations] SERVICE: Full error details:`, error);
      console.log(`[GET /organizations] SERVICE: RBAC API failure - returning empty array for security`);
      return [];
    }
  }

  async getOperationByOrgId(id: string) {
    return this.repo.getOperationByOrgId(id);
  }

  async updateOperation(
    id: string,
    data: UpdateOrganizationOperationRequestDto,
  ) {
    return this.repo.updateOperation(id, data);
  }

  async getStatusByOrgId(id: string) {
    try {
      return await this.repo.getStatusByOrgId(id);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async updateStatus(
    id: string,
    data: UpdateOrganizationStatusRequestDto,
    userId: string,
  ) {
    try {
      // Update the status
      const result = await this.repo.updateStatus(id, { status: data.status });

      // Create status change reason record
      await this.repo.createStatusChangeReason({
        organization_id: id,
        reason: data.reason,
        description: data.description,
        updated_by: userId,
      });

      return result;
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async getRegistrationByOrgId(id: string) {
    try {
      return await this.repo.getRegistrationByOrgId(id);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async updateRegistration(
    id: string,
    data: UpdateOrganizationRegistrationRequestDto,
  ) {
    try {
      // Update the registration
      const result = await this.repo.updateRegistration(id, data);

      // Sync Organization table fields with registration data
      if (data.tin !== undefined || data.tax_type !== undefined) {
        await this.syncService.syncOrganizationFromRegistration(id, {
          tin: data.tin,
          tax_type: data.tax_type,
        });
      }

      return result;
    } catch (error) {
      if ((error as { code?: string }).code === 'P2025') {
        // Record not found
        throw new NotFoundException();
      }
      throw error;
    }
  }
}
