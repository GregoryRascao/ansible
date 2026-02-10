import {Component, input} from '@angular/core';

@Component({
  selector: 'm-indicator',
  imports: [],
  templateUrl: './m-indicator.component.html',
  styleUrl: './m-indicator.component.css',
  providers: [
    // {provide: mUiToken, useValue: '--p-indicator', multi: true}
  ]
})
export class MIndicatorComponent {

  // dt = input<MIndicatorTheme>({})
  shape = input<'circle' | 'square' | 'triangle'>('circle')
  pulse = input<boolean>(true)
  status = input.required<'green' | 'orange' | 'red' | 'grey'>()

  // styleEffect = effect(() => {
  //   const dt = this.dt()
  //   const el = this.$er.nativeElement as HTMLElement
  //
  //   if (dt.size) {
  //     el.style.setProperty('--p-indicator-size', dt.size)
  //   }
  //   if (dt.background) {
  //     if (dt.background.green) {
  //       el.style.setProperty('--p-indicator-background-green', dt.background.green)
  //     }
  //     if (dt.background.orange) {
  //       el.style.setProperty('--p-indicator-background-orange', dt.background.orange)
  //     }
  //     if (dt.background.red) {
  //       el.style.setProperty('--p-indicator-background-red', dt.background.red)
  //     }
  //   }
  //   if (dt.pulse) {
  //     if (dt.pulse.duration) {
  //       el.style.setProperty('--p-indicator-pulse-duration', dt.pulse.duration)
  //     }
  //   }
  //
  // })
}
