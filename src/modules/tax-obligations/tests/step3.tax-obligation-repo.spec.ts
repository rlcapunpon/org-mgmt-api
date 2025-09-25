import { Test, TestingModule } from '@nestjs/testing';
import { TaxObligationRepository } from '../repositories/tax-obligation.repository';
import { PrismaService } from '../../../database/prisma.service';

describe('TaxObligationRepository', () => {
  let repository: TaxObligationRepository;
  let prismaMock: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxObligationRepository,
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            taxObligation: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<TaxObligationRepository>(TaxObligationRepository);
    prismaMock = module.get(PrismaService);
  });

  it('create should fail when required fields missing', async () => {
    await expect(repository.create({} as any)).rejects.toThrow('Required fields missing');
  });

  it('create should create a record and return the new obligation with id and timestamps', async () => {
    const data = {
      code: '2550M',
      name: 'Monthly VAT',
      frequency: 'MONTHLY' as const,
      due_rule: { day: 20 },
      active: true,
    };
    const mockObligation = {
      id: 'uuid',
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };
    (prismaMock.taxObligation.create as jest.Mock).mockResolvedValue(mockObligation);

    const result = await repository.create(data);
    expect(result).toEqual(mockObligation);
    expect(prismaMock.taxObligation.create).toHaveBeenCalledWith({ data });
  });

  it('listActive should return only active obligations', async () => {
    const mockObligations = [
      {
        id: '1',
        code: '2550M',
        name: 'Monthly VAT',
        frequency: 'MONTHLY' as const,
        due_rule: { day: 20 },
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    (prismaMock.taxObligation.findMany as jest.Mock).mockResolvedValue(mockObligations);

    const result = await repository.listActive();
    expect(result).toEqual(mockObligations);
    expect(prismaMock.taxObligation.findMany).toHaveBeenCalledWith({ where: { active: true } });
  });

  it('listActive should return empty array when no active obligations', async () => {
    (prismaMock.taxObligation.findMany as jest.Mock).mockResolvedValue([]);

    const result = await repository.listActive();
    expect(result).toEqual([]);
    expect(prismaMock.taxObligation.findMany).toHaveBeenCalledWith({ where: { active: true } });
  });
});
