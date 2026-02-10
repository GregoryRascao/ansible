import {Injectable} from '@angular/core';
import {marked} from 'marked';

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {

  parse(md: string) {
    const rendered = new marked.Renderer();

    // rendered.heading = ()
  }
}
