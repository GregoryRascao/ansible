import { TestBed } from '@angular/core/testing';
import { BetterStackService } from './better-stack.service';
import { BetterStackModuleOptionToken } from '@shared/modules/better-stack/better-stack.provider';

// Capture httpMutation options passed by the service
let capturedOptions: any;

jest.mock('@angular-architects/ngrx-toolkit', () => ({
  httpMutation: (opts: any) => {
    capturedOptions = opts;
    // return a mutation function to be called by consumers
    return (_payload: any) => void 0;
  }
}));

describe('BetterStackService', () => {
  let service: BetterStackService;

  const opts = {
    endpoint: 'https://logs.example.com/ingest',
    token: 'secret-token',
    source: 'front-core'
  };

  beforeEach(() => {
    capturedOptions = undefined;
    TestBed.configureTestingModule({
      providers: [
        BetterStackService,
        { provide: BetterStackModuleOptionToken, useValue: opts }
      ]
    });
    service = TestBed.inject(BetterStackService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('logMutation should configure httpMutation with correct request builder', () => {
    const mut = service.logMutation();
    expect(typeof mut).toBe('function');
    expect(capturedOptions).toBeTruthy();
    expect(typeof capturedOptions.request).toBe('function');

    const req = capturedOptions.request({ severity: 'error', message: 'Broken' });
    expect(req.url).toBe(opts.endpoint);
    expect(req.method).toBe('POST');
    expect(req.headers.Authorization).toBe(`Bearer ${opts.token}`);
    expect(req.headers.ContentType).toBe('application/json');
    expect(req.body.severity).toBe('error');
    expect(req.body.message).toBe('Broken');
    expect(req.body.source).toBe(opts.source);
    expect(typeof req.body.timestamp).toBe('string');
  });
});
