import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {MessageService} from 'primeng/api';
import {catchError, throwError} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {BetterStackService} from '@shared/modules/better-stack/services/better-stack.service';

export type ErrorInterceptorMessage = {
  code: RegExp;
  message: string;
}

export const errorInterceptor: (...codes: ErrorInterceptorMessage[]) => HttpInterceptorFn = (...codes: ErrorInterceptorMessage[]) => (req, next) => {
  const $message = inject(MessageService);
  const $translate = inject(TranslateService);
  const $betterStack = inject(BetterStackService)

  const betterStackMutation = $betterStack.logMutation()

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const statusCode = String(error.status ?? '');
        const match = codes.find(c => statusCode.match(c.code));
        if (match) {
          $message.add({
            severity: 'error',
            icon: 'pi pi-exclamation-triangle',
            summary: $translate.instant(match.message),
            detail: (error.error && (error.error.message || error.error.detail)) ? (error.error.message || error.error.detail) : error.message,
            life: 5000,
          });
          betterStackMutation({severity: 'error', message: error.message})
        }
      }
      return throwError(() => error);
    })
  );
};
