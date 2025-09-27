import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationOwnerResponseDto {
  @ApiProperty({ description: 'Owner assignment unique identifier' })
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  org_id: string;

  @ApiProperty({ description: 'User ID (from JWT)' })
  user_id: string;

  @ApiProperty({ description: 'Last update timestamp' })
  last_update: Date;

  @ApiProperty({ description: 'Assignment date' })
  assigned_date: Date;
}

export class OrganizationOwnerListResponseDto {
  @ApiProperty({
    type: [OrganizationOwnerResponseDto],
    description: 'Array of organization owners',
  })
  owners: OrganizationOwnerResponseDto[];
}

export class AssignOrganizationOwnerRequestDto {
  @ApiProperty({
    description: 'Organization ID to assign ownership to',
    example: 'clx123abc456def',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  org_id: string;

  @ApiProperty({
    description: 'User ID to assign as owner (from JWT)',
    example: 'user-uuid-123',
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;
}

export class CheckOwnershipResponseDto {
  @ApiProperty({
    description: 'Whether the user is an owner of the organization',
  })
  is_owner: boolean;

  @ApiProperty({ description: 'Organization ID checked' })
  org_id: string;

  @ApiProperty({ description: 'User ID checked' })
  user_id: string;
}
