import {Component, computed, input} from '@angular/core';

type Options = {
  color?: string,
}
export type ProportionOptions = { label: string, value: number } & Partial<Options>

@Component({
  selector: 'm-proportion-bar',
  imports: [],
  templateUrl: './m-proportion-bar.component.html',
  styleUrl: './m-proportion-bar.component.css'
})
export class MProportionBarComponent {
  data = input.required<ProportionOptions[]>()

  total = computed(() => Object.values(this.data()).reduce((a, b) => a + b.value, 0))

  // proportions = computed(() => {
  //   const total = this.total()
  //   return Object.entries(this.data()).map(([key, data]) => {
  //     return {
  //       key,
  //       data,
  //       percentage: data.value / total * 100
  //     }
  //   })
  // })

  randomColor(alpha: number = 1): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

}
