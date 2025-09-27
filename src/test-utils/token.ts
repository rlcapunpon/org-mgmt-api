import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../common/interfaces/auth.interface';

export function signPayload(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, secret);
}
