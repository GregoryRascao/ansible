import {Component, computed, input} from '@angular/core';
import {marked} from 'marked';

@Component({
  selector: 'md-view',
  imports: [],
  templateUrl: './md-view.html',
  styleUrl: './md-view.css'
})
export class MdView {
  content = input.required<string>()


  htmlContent = computed(() => marked(this.content()))
}
