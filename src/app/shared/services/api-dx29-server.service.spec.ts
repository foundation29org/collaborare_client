import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from 'environments/environment';
import { FilterDiseasesPipe } from 'app/shared/pipes/listOfFilteredDiseases.pipe';
import { InsightsService } from './azureInsights.service';
import { ApiDx29ServerService } from './api-dx29-server.service';

describe('ApiDx29ServerService', () => {
  let api: ApiDx29ServerService;
  let httpMock: HttpTestingController;
  const insights = { trackEvent: vi.fn(), trackException: vi.fn() };

  beforeEach(() => {
    (environment as any).api = 'http://api.test';
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: InsightsService, useValue: insights }]
    });
    api = TestBed.inject(ApiDx29ServerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => insights.trackException.mockClear());

  it('lists the validated diseases', () => {
    let result: any;
    api.validatedItems().subscribe((r) => (result = r));
    const req = httpMock.expectOne('http://api.test/api/validateddiseases');
    expect(req.request.method).toBe('GET');
    req.flush({ diseases: [{ id: 'ORPHA:558' }] });
    expect(result.diseases.length).toBe(1);
  });

  it('sends the message to the validator of a list', () => {
    api.sendMsgValidator('user-2', { email: 'a@b.c', subject: 's', message: 'm' }).subscribe();
    const req = httpMock.expectOne('http://api.test/api/validator/user-2');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.subject).toBe('s');
    req.flush({});
  });

  it('saves the profile with PUT', () => {
    api.setProfile('user-1', { organization: 'Org' }).subscribe();
    const req = httpMock.expectOne('http://api.test/api/profile/user-1');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('updates the list of aspects of a condition', () => {
    api.updateItems('d1', { items: [{ name: 'a' }] }).subscribe();
    const req = httpMock.expectOne('http://api.test/api/disease/d1');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('reports the failure to Application Insights', () => {
    api.getProfile('user-1').subscribe({ error: () => {} });
    httpMock.expectOne('http://api.test/api/profile/user-1').flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });
    expect(insights.trackException).toHaveBeenCalled();
  });
});

describe('FilterDiseasesPipe', () => {
  const pipe = new FilterDiseasesPipe();
  const list = [
    { id: 'ORPHA:558', name: 'Marfan syndrome', synonyms: ['MFS'], validatorInfo: { organization: 'EURORDIS', country: 'EU' } },
    { id: 'ORPHA:586', name: 'Cystic fibrosis', synonyms: [], validatorInfo: { organization: 'EMA', country: 'Netherlands' } }
  ];

  it('returns everything without a search text', () => {
    expect(pipe.transform(list, '')).toEqual(list);
  });

  it('matches by name, orphacode, synonym, organization and country', () => {
    expect(pipe.transform(list, 'marfan').length).toBe(1);
    expect(pipe.transform(list, '586')[0].name).toBe('Cystic fibrosis');
    expect(pipe.transform(list, 'mfs')[0].id).toBe('ORPHA:558');
    expect(pipe.transform(list, 'ema')[0].name).toBe('Cystic fibrosis');
    expect(pipe.transform(list, 'netherlands').length).toBe(1);
  });

  it('copes with an empty list', () => {
    expect(pipe.transform(null as any, 'x')).toEqual([]);
  });
});
