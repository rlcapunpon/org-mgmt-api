import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OrganizationOwner } from '@prisma/client';

interface AssignOwnerData {
  org_id: string;
  user_id: string;
}

@Injectable()
export class OrganizationOwnerRepository {
  constructor(private prisma: PrismaService) {}

  async assignOwner(data: AssignOwnerData): Promise<OrganizationOwner> {
    if (!data.org_id || !data.user_id) {
      throw new Error('Required fields missing');
    }

    return this.prisma.organizationOwner.create({
      data: {
        org_id: data.org_id,
        user_id: data.user_id,
      },
    });
  }

  async getOwnersByOrgId(org_id: string): Promise<OrganizationOwner[]> {
    return this.prisma.organizationOwner.findMany({
      where: { org_id },
    });
  }

  async isOwner(org_id: string, user_id: string): Promise<boolean> {
    const owner = await this.prisma.organizationOwner.findUnique({
      where: {
        org_id_user_id: {
          org_id,
          user_id,
        },
      },
    });
    return !!owner;
  }

  async removeOwner(
    org_id: string,
    user_id: string,
  ): Promise<OrganizationOwner> {
    return this.prisma.organizationOwner.delete({
      where: {
        org_id_user_id: {
          org_id,
          user_id,
        },
      },
    });
  }

  async removeOwnerById(id: string): Promise<OrganizationOwner> {
    return this.prisma.organizationOwner.delete({
      where: { id },
    });
  }

  async updateLastUpdate(
    org_id: string,
    user_id: string,
  ): Promise<OrganizationOwner> {
    return this.prisma.organizationOwner.update({
      where: {
        org_id_user_id: {
          org_id,
          user_id,
        },
      },
      data: {
        last_update: new Date(),
      },
    });
  }

  async getOwnerById(id: string): Promise<OrganizationOwner | null> {
    return this.prisma.organizationOwner.findUnique({
      where: { id },
    });
  }

  async getOwnersByUserId(user_id: string): Promise<OrganizationOwner[]> {
    return this.prisma.organizationOwner.findMany({
      where: { user_id },
    });
  }
}
