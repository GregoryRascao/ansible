import {InputSignal, OutputEmitterRef} from "@angular/core";

export type PopupFactoryOptions<T> = {
  params: InputSignal<T>,
  onClose?: (data: any) => void,
}

export type ComponentInputs<T> = {
  [P in keyof T]: T[P] extends InputSignal<infer A> ? A : never
}
export type ComponentOutputs<T> = {
  [P in keyof T]: T[P] extends OutputEmitterRef<infer A> ? A : never
}
