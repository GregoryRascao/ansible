import {patchState, signalStore, withHooks, withProps, withState} from '@ngrx/signals';
import {ActivationEnd, Router} from '@angular/router';
import {inject} from '@angular/core';
import {distinctUntilChanged, filter, Subscription} from 'rxjs';
import {withDevtools} from '@angular-architects/ngrx-toolkit';

export type RouterChangeState = {
  params: any;
  queryParams: any;
}

const initialState: RouterChangeState = {
  params: {} as any,
  queryParams: {} as any,
}

let routerEvent$$: Subscription;
export const RouterStore = signalStore(
  {providedIn: 'root'},
  withDevtools('router'),
  withState(initialState),
  withProps(() => ({
    router: inject(Router)
  })),
  withHooks((store) => ({
    onInit() {
      routerEvent$$ = store.router.events
        .pipe(
          filter(e => e instanceof ActivationEnd),
          filter(event => Object.keys(event.snapshot.params).length > 0),
          distinctUntilChanged((prev, curr) =>
            JSON.stringify(prev.snapshot.params) === JSON.stringify(curr.snapshot.params)
          )
        )
        .subscribe((event: ActivationEnd) => {
          patchState(store, (state) => ({
            params: event.snapshot.paramMap,
            queryParams: event.snapshot.queryParamMap,
          }))
        })
    },
    onDestroy() {
      routerEvent$$?.unsubscribe()
    }
  }))
)

