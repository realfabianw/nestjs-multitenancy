import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtAccessTokenPayload } from '../entities/jwt-access-token-payload.entity';
import { User } from '../../drizzle/schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          let data = null;
          if (request && request.cookies) {
            data =
              request.cookies[
                this.configService.get<string>('ACCESS_TOKEN_NAME')
              ];
          }
          return data;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtAccessTokenPayload): Promise<User> {
    // Create the user object by cross-referencing the email from the JWT payload with the database.
    // This adds an extra security layer but also requires an additional database query.
    // An alternative approach is to include all required user information in the JWT payload. (Warning: Tokens are valid until expiration, even if the underlying user has been deleted or banned.)
    // TODO: The database query could be removed here and only be included in the refresh token strategy.

    const user = await this.usersService.findOneByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
