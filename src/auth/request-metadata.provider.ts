import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../users/users.schema';

@Injectable({ scope: Scope.REQUEST })
export class RequestMetadataProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getRequest(): Request {
    return this.request;
  }

  getRequestingUser(): User {
    return this.request.user as User;
  }

  getRequestingUserId(): number {
    return this.getRequestingUser().id;
  }

  isRequestingUserSystemAdmin(): boolean {
    return this.getRequestingUser().role == 'ADMIN';
  }

  isRequestingUserTenantAdmin(): boolean {
    return this.getRequestingUser()
      .tenantMemberships.filter(
        (tenantUser) => tenantUser.tenantId == this.getTenantId(),
      )
      .some((tenantUser) => tenantUser.role == 'ADMIN');
  }

  getTenantId(): number | undefined {
    // TODO: It is not recommended to transfer the tenantId in the headers.
    return Number.parseInt(this.request.headers['x-tenant-id'] as string);
  }
}
