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

  getTenantId(): number {
    return Number.parseInt(this.request.headers['x-tenant-id'] as string);
  }
}
