import { TestBed } from '@angular/core/testing';
import { AppStore } from './app-store';
import { MessageService } from 'primeng/api';

describe('AppStore', () => {
  let store: ReturnType<typeof AppStore>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    messageService = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [{ provide: MessageService, useValue: messageService }]
    });

    store = TestBed.inject(AppStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('startLoading should set loading to true', () => {
    store.startLoading();
    // @ts-ignore access state via any to read current snapshot if available
    expect((store as any).loading()).toBeTrue();
  });

  it('stopLoading should set loading to false', () => {
    store.startLoading();
    store.stopLoading();
    // @ts-ignore
    expect((store as any).loading()).toBeFalse();
  });

  it('showError should call MessageService.add with severity error', () => {
    store.showError({ detail: 'Oops' });
    expect(messageService.add).toHaveBeenCalled();
    const arg = (messageService.add as jasmine.Spy).calls.mostRecent().args[0];
    expect(arg.severity).toBe('error');
    expect(arg.detail).toBe('Oops');
  });
});
