import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationOwnerRepository } from '../repositories/organization-owner.repository';
import { PrismaService } from '../../../database/prisma.service';

describe('OrganizationOwnerRepository', () => {
  let repository: OrganizationOwnerRepository;
  let prismaMock: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationOwnerRepository,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            organizationOwner: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<OrganizationOwnerRepository>(
      OrganizationOwnerRepository,
    );
    prismaMock = module.get(PrismaService);
  });

  it('assignOwner should fail when required fields missing', async () => {
    await expect(repository.assignOwner({} as any)).rejects.toThrow(
      'Required fields missing',
    );
  });

  it('assignOwner should create owner assignment and return the record', async () => {
    const data = {
      org_id: 'org-uuid-123',
      user_id: 'user-uuid-456',
    };
    const mockOwner = {
      id: 'owner-uuid',
      org_id: 'org-uuid-123',
      user_id: 'user-uuid-456',
      last_update: new Date(),
      assigned_date: new Date(),
    };
    (prismaMock.organizationOwner.create as jest.Mock).mockResolvedValue(
      mockOwner,
    );

    const result = await repository.assignOwner(data);
    expect(result).toEqual(mockOwner);
    expect(prismaMock.organizationOwner.create).toHaveBeenCalledWith({
      data: {
        org_id: 'org-uuid-123',
        user_id: 'user-uuid-456',
      },
    });
  });

  it('getOwnersByOrgId should return empty array for organization with no owners', async () => {
    (prismaMock.organizationOwner.findMany as jest.Mock).mockResolvedValue([]);

    const result = await repository.getOwnersByOrgId('org-uuid-123');
    expect(result).toEqual([]);
    expect(prismaMock.organizationOwner.findMany).toHaveBeenCalledWith({
      where: { org_id: 'org-uuid-123' },
    });
  });

  it('getOwnersByOrgId should return list of owners for organization', async () => {
    const mockOwners = [
      {
        id: 'owner-1',
        org_id: 'org-uuid-123',
        user_id: 'user-uuid-456',
        last_update: new Date(),
        assigned_date: new Date(),
      },
      {
        id: 'owner-2',
        org_id: 'org-uuid-123',
        user_id: 'user-uuid-789',
        last_update: new Date(),
        assigned_date: new Date(),
      },
    ];
    (prismaMock.organizationOwner.findMany as jest.Mock).mockResolvedValue(
      mockOwners,
    );

    const result = await repository.getOwnersByOrgId('org-uuid-123');
    expect(result).toEqual(mockOwners);
    expect(prismaMock.organizationOwner.findMany).toHaveBeenCalledWith({
      where: { org_id: 'org-uuid-123' },
    });
  });

  it('isOwner should return false when user is not owner of organization', async () => {
    (prismaMock.organizationOwner.findUnique as jest.Mock).mockResolvedValue(
      null,
    );

    const result = await repository.isOwner('org-uuid-123', 'user-uuid-456');
    expect(result).toBe(false);
    expect(prismaMock.organizationOwner.findUnique).toHaveBeenCalledWith({
      where: {
        org_id_user_id: {
          org_id: 'org-uuid-123',
          user_id: 'user-uuid-456',
        },
      },
    });
  });

  it('isOwner should return true when user is owner of organization', async () => {
    const mockOwner = {
      id: 'owner-1',
      org_id: 'org-uuid-123',
      user_id: 'user-uuid-456',
      last_update: new Date(),
      assigned_date: new Date(),
    };
    (prismaMock.organizationOwner.findUnique as jest.Mock).mockResolvedValue(
      mockOwner,
    );

    const result = await repository.isOwner('org-uuid-123', 'user-uuid-456');
    expect(result).toBe(true);
    expect(prismaMock.organizationOwner.findUnique).toHaveBeenCalledWith({
      where: {
        org_id_user_id: {
          org_id: 'org-uuid-123',
          user_id: 'user-uuid-456',
        },
      },
    });
  });

  it('removeOwner should delete owner assignment and return the deleted record', async () => {
    const mockOwner = {
      id: 'owner-1',
      org_id: 'org-uuid-123',
      user_id: 'user-uuid-456',
      last_update: new Date(),
      assigned_date: new Date(),
    };
    (prismaMock.organizationOwner.delete as jest.Mock).mockResolvedValue(
      mockOwner,
    );

    const result = await repository.removeOwner(
      'org-uuid-123',
      'user-uuid-456',
    );
    expect(result).toEqual(mockOwner);
    expect(prismaMock.organizationOwner.delete).toHaveBeenCalledWith({
      where: {
        org_id_user_id: {
          org_id: 'org-uuid-123',
          user_id: 'user-uuid-456',
        },
      },
    });
  });

  it('removeOwnerById should delete owner assignment by id and return the deleted record', async () => {
    const mockOwner = {
      id: 'owner-1',
      org_id: 'org-uuid-123',
      user_id: 'user-uuid-456',
      last_update: new Date(),
      assigned_date: new Date(),
    };
    (prismaMock.organizationOwner.delete as jest.Mock).mockResolvedValue(
      mockOwner,
    );

    const result = await repository.removeOwnerById('owner-1');
    expect(result).toEqual(mockOwner);
    expect(prismaMock.organizationOwner.delete).toHaveBeenCalledWith({
      where: { id: 'owner-1' },
    });
  });

  it('updateLastUpdate should update last_update timestamp', async () => {
    const mockOwner = {
      id: 'owner-1',
      org_id: 'org-uuid-123',
      user_id: 'user-uuid-456',
      last_update: new Date(),
      assigned_date: new Date(),
    };
    (prismaMock.organizationOwner.update as jest.Mock).mockResolvedValue(
      mockOwner,
    );

    const result = await repository.updateLastUpdate(
      'org-uuid-123',
      'user-uuid-456',
    );
    expect(result).toEqual(mockOwner);
    expect(prismaMock.organizationOwner.update).toHaveBeenCalledWith({
      where: {
        org_id_user_id: {
          org_id: 'org-uuid-123',
          user_id: 'user-uuid-456',
        },
      },
      data: {
        last_update: expect.any(Date),
      },
    });
  });
});
