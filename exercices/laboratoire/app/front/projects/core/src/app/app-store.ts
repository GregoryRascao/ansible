import {patchState, signalStore, withMethods, withProps, withState} from "@ngrx/signals"
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {MessageService, ToastMessageOptions} from 'primeng/api';
import {inject} from "@angular/core";

export type AppState = {
  loading: boolean
}

export const initialState: AppState = {
  loading: false
}

export const AppStore = signalStore(
  {providedIn: 'root'},
  withDevtools('app'),
  withState(initialState),
  withProps((store) => ({
    $message: inject(MessageService),
  })),
  withMethods((store) => ({
    startLoading() {
      patchState(store, (state) => ({...state, loading: true}))
    },
    stopLoading() {
      patchState(store, (state) => ({...state, loading: false}))
    },
    showError(error: Partial<ToastMessageOptions>) {
      store.$message.add({severity: 'error', summary: 'Error', detail: error.detail, life: 5000})
    }
  }))
)
