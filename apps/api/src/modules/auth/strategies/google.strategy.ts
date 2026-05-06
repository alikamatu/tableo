import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

/**
 * Google OAuth strategy — optional.
 * Only registered if GOOGLE_CLIENT_ID is set in the environment.
 * Requires: npm install passport-google-oauth20 @types/passport-google-oauth20
 */

let Strategy: new (...args: unknown[]) => object;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('passport-google-oauth20') as {
    Strategy: new (...args: unknown[]) => object;
  };
  Strategy = mod.Strategy;
} catch {
  // package not installed — GoogleStrategy will be a no-op
  Strategy = class NoopStrategy {
    constructor() {}
  };
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(@Inject(ConfigService) config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID') ?? 'noop';
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET') ?? 'noop';
    const callbackURL =
      config.get<string>('GOOGLE_CALLBACK_URL') ??
      'http://localhost:4000/api/v1/auth/google/callback';

    super({ clientID, clientSecret, callbackURL, scope: ['email', 'profile'] });

    if (clientID === 'noop') {
      this.logger.warn('Google OAuth is not configured — GOOGLE_CLIENT_ID is missing.');
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (err: unknown, user?: unknown) => void,
  ) {
    const user = {
      email: profile.emails?.[0]?.value,
      fullName: profile.displayName,
      picture: profile.photos?.[0]?.value,
      accessToken: _accessToken,
    };
    done(null, user);
  }
}
