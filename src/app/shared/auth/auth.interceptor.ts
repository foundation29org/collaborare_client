import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { EventsService } from 'app/shared/services/events.service';
import { InsightsService } from 'app/shared/services/azureInsights.service';

// Same behaviour as the old class interceptor: every call to our API carries x-api-key, and once the
// user is signed in also the bearer token and a timestamp (to defeat caches). 401/403 close the session.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const eventsService = inject(EventsService);
  const insightsService = inject(InsightsService);

  const isApiCall = !!environment.api && req.url.indexOf(environment.api) !== -1;
  let authReq = req.clone({});

  if (authService.getToken() == undefined) {
    if (isApiCall) {
      authReq = req.clone({ headers: req.headers.set('x-api-key', environment.Server_Key) });
    }
    return next(authReq);
  }

  if (isApiCall) {
    const timestamp = Date.now();
    const urlWithTimestamp = req.url + (req.url.includes('?') ? '&' : '?') + 't=' + timestamp;
    authReq = req.clone({
      url: urlWithTimestamp,
      headers: req.headers
        .set('authorization', `Bearer ${authService.getToken()}`)
        .set('x-api-key', environment.Server_Key)
    });
    if (!tokenService.isTokenValid()) {
      authService.logout();
    }
  }

  return next(authReq).pipe(
    catchError((error) => {
      insightsService.trackException(error);
      if (error.status === 401 || error.status === 403) {
        authService.logout();
        return throwError(() => error);
      }
      if (error.status === 404 || error.status === 0) {
        let returnMessage = error.message;
        if (error.error && error.error.message) {
          returnMessage = error.error;
        }
        eventsService.broadcast('http-error', returnMessage);
        return throwError(() => error);
      }
      return throwError(() => error);
    })
  );
};
