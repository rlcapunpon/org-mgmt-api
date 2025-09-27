export interface JwtPayload {
  userId: string;
  username: string;
  isSuperAdmin: boolean;
  permissions: string[];
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest {
  user?: JwtPayload;
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
  params: {
    id?: string;
    orgId?: string;
    [key: string]: string | undefined;
  };
}
