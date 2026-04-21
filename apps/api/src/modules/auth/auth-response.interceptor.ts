import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response as ExpressResponse } from 'express';

@Injectable()
export class AuthResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data: unknown) => {
        console.log('AuthResponseInterceptor: Processing response', { data });

        // Check if response contains tokens (login/register responses)
        if (data && typeof data === 'object' && 'data' in data) {
          const responseData = data as any;
          if (responseData.data?.refreshToken) {
            console.log('AuthResponseInterceptor: Setting refresh_token cookie');

            // Set httpOnly refresh token cookie
            response.cookie('refresh_token', responseData.data.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // Remove refresh token from response body (don't send to client)
            delete responseData.data.refreshToken;
            console.log('AuthResponseInterceptor: Cookie set and token removed from response');
          } else {
            console.log('AuthResponseInterceptor: No refreshToken found in response');
          }
        } else {
          console.log('AuthResponseInterceptor: Response does not have expected structure');
        }

        return data;
      }),
    );
  }
}