import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideToastr } from 'ngx-toastr';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { environment } from 'environments/environment';
import { InsightsService } from 'app/shared/services/azureInsights.service';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { AuthGuard } from './auth-guard.service';
import { RoleGuard } from './role-guard.service';

const b64 = (o: any) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const makeToken = (payload: any) => b64({ alg: 'HS256', typ: 'JWT' }) + '.' + b64(payload) + '.sig';
const validPayload = () => ({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600, role: 'User', subrole: 'x', email: 'tester@example.org' });

describe('Auth (service, interceptor and guards)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;
  const insights = { trackEvent: vi.fn(), trackException: vi.fn() };

  beforeEach(() => {
    localStorage.clear();
    (environment as any).api = 'http://api.test';
    (environment as any).Server_Key = 'test-key';
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideTranslateService({ lang: 'en' }),
        provideToastr(),
        provideNoopAnimations(),
        { provide: InsightsService, useValue: insights }
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    insights.trackException.mockClear();
  });

  it('decodes the token on sign-in and keeps it in localStorage', () => {
    auth.setEnvironment(makeToken(validPayload()));
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getIdUser()).toBe('user-1');
    expect(auth.getRole()).toBe('User');
    expect(auth.getEmail()).toBe('tester@example.org');
    expect(auth.getRedirectUrl()).toBe('/mycondition');
    expect(localStorage.getItem('tokencollaborare')).toBeTruthy();
  });

  it('restores the session from localStorage', () => {
    localStorage.setItem('tokencollaborare', makeToken(validPayload()));
    expect(auth.getEnvironment()).toBe(true);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getIdUser()).toBe('user-1');
  });

  it('logout clears the session', async () => {
    auth.setEnvironment(makeToken(validPayload()));
    await auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.getToken()).toBeNull();
    expect(localStorage.getItem('tokencollaborare')).toBeNull();
  });

  it('sends only x-api-key to the API while nobody is signed in', () => {
    http.get('http://api.test/api/validateddiseases').subscribe();
    const req = httpMock.expectOne('http://api.test/api/validateddiseases');
    expect(req.request.headers.get('x-api-key')).toBe('test-key');
    expect(req.request.headers.has('authorization')).toBe(false);
    req.flush({});
  });

  it('does not touch calls to other hosts', () => {
    http.post('https://example.org/other', {}).subscribe();
    const req = httpMock.expectOne('https://example.org/other');
    expect(req.request.headers.has('x-api-key')).toBe(false);
    req.flush({});
  });

  it('adds the bearer token and a cache-busting timestamp once signed in', () => {
    auth.setEnvironment(makeToken(validPayload()));
    http.get('http://api.test/api/profile/user-1').subscribe();
    const req = httpMock.expectOne((r) => r.url.startsWith('http://api.test/api/profile/user-1?t='));
    expect(req.request.headers.get('authorization')).toMatch(/^Bearer /);
    expect(req.request.headers.get('x-api-key')).toBe('test-key');
    req.flush({});
  });

  it('closes the session on a 401', () => {
    auth.setEnvironment(makeToken(validPayload()));
    http.get('http://api.test/api/disease/user-1').subscribe({ error: () => {} });
    httpMock.expectOne((r) => r.url.startsWith('http://api.test/api/disease/user-1')).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isAuthenticated()).toBe(false);
    expect(insights.trackException).toHaveBeenCalled();
  });

  it('authGuard lets a signed-in user with a valid token through', () => {
    auth.setEnvironment(makeToken(validPayload()));
    const guard = TestBed.inject(AuthGuard);
    expect(guard.canActivate({ data: { expectedRole: ['User'] } } as any, { url: '/mycondition' } as any)).toBe(true);
  });

  it('authGuard sends an anonymous visitor to the home page', () => {
    const router = TestBed.inject(Router);
    const guard = TestBed.inject(AuthGuard);
    expect(guard.canActivate({ data: { expectedRole: ['User'] } } as any, { url: '/profile' } as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/.']);
  });

  it('roleGuard rejects a role that is not expected', () => {
    auth.setEnvironment(makeToken({ ...validPayload(), role: 'Clinical' }));
    const guard = TestBed.inject(RoleGuard);
    expect(guard.canActivate({ data: { expectedRole: ['User'] } } as any)).toBe(false);
  });

  it('roleGuard accepts the expected role', () => {
    auth.setEnvironment(makeToken(validPayload()));
    const guard = TestBed.inject(RoleGuard);
    expect(guard.canActivate({ data: { expectedRole: ['User'] } } as any)).toBe(true);
  });
});
