import {Component, effect, ElementRef, inject, InjectionToken, input} from '@angular/core';

export const mUiToken = new InjectionToken<string>('mui.token')

@Component({
  imports: [],
  template: ``,
  styles: ``
})
export class MUiComponent<T extends any> {
  protected $er = inject(ElementRef)
  protected $prefix = inject(mUiToken)


  dt = input<T>()

  themeEffect = effect(() => {
    const dt = this.dt();
    const prefix = this.$prefix;

    if (!dt) return
    this.handleObject(dt, prefix)
  })

  private handleObject(obj: any, prefix: string = '') {
    for (let [key, value] of Object.entries(obj)) {
      if (value instanceof Object) {
        this.handleObject(value, prefix + '-' + key)
      } else {
        this.$er.nativeElement.style.setProperty(prefix + '-' + key, value)
      }
    }
  }
}
