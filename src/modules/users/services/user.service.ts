import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserRepository } from '../repositories/user.repository';
import { OrganizationOwnerRepository } from '../../organization-owners/repositories/organization-owner.repository';
import { OrganizationObligationRepository } from '../../org-obligations/repositories/organization-obligation.repository';

export interface UserOverview {
  organizationsOwned: number;
  organizationsAssigned: number;
  obligationsDueWithin30Days: number;
  totalObligations: number;
}

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationOwnerRepository: OrganizationOwnerRepository,
    private readonly organizationObligationRepository: OrganizationObligationRepository,
    private readonly httpService: HttpService,
  ) {}

  async getUserOverview(userId: string): Promise<UserOverview> {
    // Get organizations owned by the user
    const ownedOrganizations =
      await this.organizationOwnerRepository.getOwnersByUserId(userId);
    const organizationsOwned = ownedOrganizations.length;

    // Get organizations assigned to the user via RBAC API
    let organizationsAssigned = 0;
    try {
      const rbacResponse = await firstValueFrom(
        this.httpService.get(`${process.env.RBAC_API_URL}/permissions/check`, {
          params: { userId },
        }),
      );

      const permissions =
        (rbacResponse.data as { permissions?: string[] }).permissions || [];

      // Check if user is super admin (has all permissions)
      if (permissions.includes('*')) {
        organizationsAssigned = -1; // -1 indicates all organizations
      } else {
        // Count unique organizations from permissions like "organization.read:org-1"
        const orgIds = new Set<string>();
        permissions.forEach((permission: string) => {
          const match = permission.match(
            /^organization\.(read|write|admin):(.+)$/,
          );
          if (match) {
            orgIds.add(match[2]);
          }
        });
        organizationsAssigned = orgIds.size;
      }
    } catch (error) {
      // If RBAC API fails, default to 0 assigned organizations
      console.warn(
        `Failed to fetch permissions for user ${userId}:`,
        (error as Error).message,
      );
      organizationsAssigned = 0;
    }

    // Get obligations due within 30 days
    const obligationsDueWithin30Days =
      await this.organizationObligationRepository.countObligationsDueWithinDays(
        30,
      );

    // Get total obligations
    const totalObligations =
      await this.organizationObligationRepository.countTotalObligations();

    return {
      organizationsOwned,
      organizationsAssigned,
      obligationsDueWithin30Days,
      totalObligations,
    };
  }
}
