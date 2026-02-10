import { Component } from '@angular/core';
import { MIndicatorComponent } from '@shared/ui/m-indicator/m-indicator.component';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'test-indicator',
  imports: [MIndicatorComponent, CardModule],
  templateUrl: './test-indicator.component.html',
  styleUrl: './test-indicator.component.css',
})
export class TestIndicatorComponent {}
