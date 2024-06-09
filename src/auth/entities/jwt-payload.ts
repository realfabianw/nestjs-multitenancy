import { UserRole } from '../../drizzle/schema';

export interface JwtPayload {
  sub: number;
  roles: UserRole[];
}
