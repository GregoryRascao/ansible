import { Component } from '@angular/core';
import { MProportionBarComponent } from '@shared/ui/m-proportion-bar/m-proportion-bar.component';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'test-proportion-bar',
  imports: [MProportionBarComponent, CardModule],
  templateUrl: './test-proportion-bar.component.html',
  styleUrl: './test-proportion-bar.component.css',
})
export class TestProportionBarComponent {}
