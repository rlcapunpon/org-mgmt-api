import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TaxClassification } from '@prisma/client';

/**
 * Utility service for synchronizing Organization table fields
 * with related table updates (like OrganizationRegistration)
 */
@Injectable()
export class OrganizationSyncService {
  private readonly logger = new Logger(OrganizationSyncService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Updates Organization.tin and Organization.tax_classification
   * when OrganizationRegistration is updated
   */
  async syncOrganizationFromRegistration(
    organizationId: string,
    registrationData: {
      tin?: string;
      tax_type?: TaxClassification;
    },
  ): Promise<void> {
    try {
      // Only update if we have relevant fields to sync
      const updateData: {
        tin?: string;
        tax_classification?: TaxClassification;
      } = {};

      if (registrationData.tin !== undefined) {
        updateData.tin = registrationData.tin;
        this.logger.debug(
          `Syncing TIN for organization ${organizationId}: ${registrationData.tin}`,
        );
      }

      if (registrationData.tax_type !== undefined) {
        updateData.tax_classification = registrationData.tax_type;
        this.logger.debug(
          `Syncing tax classification for organization ${organizationId}: ${registrationData.tax_type}`,
        );
      }

      // Only perform update if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await this.prisma.organization.update({
          where: { id: organizationId },
          data: updateData,
        });

        this.logger.log(
          `Successfully synced organization ${organizationId} with registration data`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to sync organization ${organizationId} from registration:`,
        (error as Error).message,
      );
      throw error;
    }
  }

  /**
   * Validates that the Organization and OrganizationRegistration
   * have consistent TIN and tax classification values
   */
  async validateOrganizationSync(organizationId: string): Promise<{
    isValid: boolean;
    tinMatch: boolean;
    taxClassificationMatch: boolean;
    organization?: {
      tin: string | null;
      tax_classification: TaxClassification;
    };
    registration?: {
      tin: string;
      tax_type: TaxClassification;
    };
  }> {
    try {
      const [organization, registration] = await Promise.all([
        this.prisma.organization.findUnique({
          where: { id: organizationId },
          select: {
            tin: true,
            tax_classification: true,
          },
        }),
        this.prisma.organizationRegistration.findUnique({
          where: { organization_id: organizationId },
          select: {
            tin: true,
            tax_type: true,
          },
        }),
      ]);

      if (!organization) {
        throw new Error(`Organization ${organizationId} not found`);
      }

      if (!registration) {
        // No registration exists, so sync is not applicable
        return {
          isValid: true,
          tinMatch: true,
          taxClassificationMatch: true,
          organization: {
            tin: organization.tin,
            tax_classification: organization.tax_classification,
          },
        };
      }

      const tinMatch = organization.tin === registration.tin;
      const taxClassificationMatch =
        organization.tax_classification === registration.tax_type;
      const isValid = tinMatch && taxClassificationMatch;

      return {
        isValid,
        tinMatch,
        taxClassificationMatch,
        organization: {
          tin: organization.tin,
          tax_classification: organization.tax_classification,
        },
        registration: {
          tin: registration.tin,
          tax_type: registration.tax_type,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to validate organization sync for ${organizationId}:`,
        (error as Error).message,
      );
      throw error;
    }
  }

  /**
   * Repairs any inconsistencies by updating Organization table
   * to match OrganizationRegistration values
   */
  async repairOrganizationSync(organizationId: string): Promise<{
    repaired: boolean;
    changes: string[];
  }> {
    try {
      const validation = await this.validateOrganizationSync(organizationId);

      if (validation.isValid || !validation.registration) {
        return {
          repaired: false,
          changes: [],
        };
      }

      const changes: string[] = [];
      const updateData: {
        tin?: string;
        tax_classification?: TaxClassification;
      } = {};

      if (!validation.tinMatch) {
        updateData.tin = validation.registration.tin;
        changes.push(
          `TIN: ${validation.organization?.tin} → ${validation.registration.tin}`,
        );
      }

      if (!validation.taxClassificationMatch) {
        updateData.tax_classification = validation.registration.tax_type;
        changes.push(
          `Tax Classification: ${validation.organization?.tax_classification} → ${validation.registration.tax_type}`,
        );
      }

      if (Object.keys(updateData).length > 0) {
        await this.prisma.organization.update({
          where: { id: organizationId },
          data: updateData,
        });

        this.logger.log(
          `Repaired organization sync for ${organizationId}: ${changes.join(', ')}`,
        );
      }

      return {
        repaired: true,
        changes,
      };
    } catch (error) {
      this.logger.error(
        `Failed to repair organization sync for ${organizationId}:`,
        (error as Error).message,
      );
      throw error;
    }
  }
}