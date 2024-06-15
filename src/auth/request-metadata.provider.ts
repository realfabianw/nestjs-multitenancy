import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../drizzle/schema';

@Injectable({ scope: Scope.REQUEST })
export class RequestMetadataProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getRequest(): Request {
    return this.request;
  }

  getUser(): User {
    return this.request.user as User;
  }

  getUserId(): number {
    return this.getUser().id;
  }

  isSystemAdmin(): boolean {
    return this.getUser().roles.some((role) => role.role == 'SYSTEM_ADMIN');
  }

  isTenantAdmin(): boolean {
    return this.getUser()
      .tenantUsers.filter(
        (tenantUser) => tenantUser.tenantId == this.getTenantId(),
      )
      .some((tenantUser) =>
        tenantUser.roles.some((role) => role.role == 'TENANT_ADMIN'),
      );
  }

  getTenantId(): number {
    // TODO: It is not recommended to transfer the tenantId in the headers.
    return Number.parseInt(this.request.headers['x-tenant-id'] as string);
  }
}
