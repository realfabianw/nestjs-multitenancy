import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class TenantProvider {
  isTenantRequest: boolean;
  tenantId: number;

  constructor(@Inject(REQUEST) private request: Request) {
    this.tenantId = Number.parseInt(request.headers['x-tenant-id'] as string);
    this.isTenantRequest = !!this.tenantId;
  }
}
