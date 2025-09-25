import * as jwt from 'jsonwebtoken';

export function signPayload(payload: any, secret: string) {
  return jwt.sign(payload, secret);
}
