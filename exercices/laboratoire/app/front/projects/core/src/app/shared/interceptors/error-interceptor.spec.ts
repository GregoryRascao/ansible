import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { errorInterceptor, ErrorInterceptorMessage } from './error-interceptor';
import { BetterStackService } from '@shared/modules/better-stack/services/better-stack.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let messageService: jasmine.SpyObj<MessageService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let betterStackService: jasmine.SpyObj<BetterStackService> & { __mutationFn: jest.Mock };

  const codes: ErrorInterceptorMessage[] = [
    { code: /^4\d\d$/, message: 'errors.http.client' },
    { code: /^5\d\d$/, message: 'errors.http.server' }
  ];

  beforeEach(() => {
    messageService = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    translateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateService.instant.and.callFake((key: string) => key);

    const mutationFn = jest.fn();
    betterStackService = Object.assign(
      jasmine.createSpyObj<BetterStackService>('BetterStackService', ['logMutation']),
      { __mutationFn: mutationFn }
    );
    (betterStackService.logMutation as jasmine.Spy).and.returnValue(mutationFn);

    TestBed.configureTestingModule({
      providers: [
        { provide: MessageService, useValue: messageService },
        { provide: TranslateService, useValue: translateService },
        { provide: BetterStackService, useValue: betterStackService },
        provideHttpClient(withInterceptors([errorInterceptor(...codes)])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should show message and log to BetterStack on matching HTTP error', () => {
    http.get('/api/test').subscribe({
      next: () => fail('should have errored'),
      error: () => {
        // swallow
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

    expect(messageService.add).toHaveBeenCalled();
    const call = (messageService.add as jasmine.Spy).calls.mostRecent().args[0];
    expect(call.severity).toBe('error');
    expect(call.summary).toBe('errors.http.client');

    expect(betterStackService.logMutation).toHaveBeenCalled();
    expect(betterStackService.__mutationFn).toHaveBeenCalled();
    const payload = (betterStackService.__mutationFn as jest.Mock).mock.calls[0][0];
    expect(payload.severity).toBe('error');
    expect(typeof payload.message).toBe('string');
  });

  it('should not show message when status does not match any code', () => {
    http.get('/api/ok').subscribe({
      next: () => fail('should have errored'),
      error: () => {}
    });

    const req = httpMock.expectOne('/api/ok');
    req.flush({ message: 'redirect' }, { status: 302, statusText: 'Found' });

    expect(messageService.add).not.toHaveBeenCalled();
    expect(betterStackService.__mutationFn).not.toHaveBeenCalled();
  });
});
