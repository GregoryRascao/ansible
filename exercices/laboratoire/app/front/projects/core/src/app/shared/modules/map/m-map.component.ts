import {
  ApplicationRef,
  Component,
  EmbeddedViewRef,
  inject,
  input,
  OutputEmitterRef,
  Type,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import {MapDirective} from "./directives/map.directive";
import * as L from 'leaflet/dist/leaflet-src.esm.js'
import { latLngBounds, Util } from 'leaflet/dist/leaflet-src.esm.js'
import type { MarkerOptions } from 'leaflet'
import {ComponentInputs} from "./models/popup.model";
import {MUiComponent, mUiToken} from '@shared/ui/m-ui-component/m-ui.component';
import {MMapTheme} from '@shared/modules/map/m-map.theme';
import isArray = Util.isArray;

@Component({
  selector: 'm-map',
  templateUrl: './m-map.component.html',
  imports: [
    MapDirective
  ],
  styleUrl: './m-map.component.css',
  providers: [
    {provide: mUiToken, useValue: '--p-map', multi: true}
  ]
})
export class MMapComponent extends MUiComponent<MMapTheme> {
  private $appRef = inject(ApplicationRef)
  private $factory = inject(ViewContainerRef)

  style = input<any>({})

  private mapDirective = viewChild.required<MapDirective>(MapDirective)

  clean() {
    this.mapDirective().clean()
  }

  addMarker(marker: L.Marker | L.Marker[]) {
    this.mapDirective().addMarker(marker);
  }

  invalidate() {
    this.mapDirective().invalidate()
  }

  flyToBounds(bounds: L.LatLngBounds, options: L.FitBoundsOptions | L.ZoomPanOptions = {}) {
    this.mapDirective().flyTo(bounds, options)
  }

  flyToMarker(marker: L.Marker | L.Marker[], options: L.FitBoundsOptions | L.ZoomPanOptions = {}) {
    const directive = this.mapDirective()
    if (!directive) return
    if (isArray(marker)) {
      const a = marker as L.Marker[]
      const bounds = latLngBounds(a.map(m => m.getLatLng()))
      directive.flyTo(bounds, options)
    } else {
      directive.flyTo(marker as L.Marker, options)
    }
  }

  flyToLatLnt(location: L.LatLngExpression, options: L.FitBoundsOptions | L.ZoomPanOptions = {}) {
    this.mapDirective().flyTo(location, options)
  }

  createMarker(location: L.LatLngExpression, opts: Partial<MarkerOptions>) {
    return L.marker(location, {...opts})
  }

  createPopup<T, TInput>(
    marker: L.Marker,
    component: Type<T>,
    inputs: ComponentInputs<any>,
    output: keyof T,
    onOutput?: <U>(data: U) => void
  ) {
    const ref = this.$factory.createComponent(component)
    const outputField = ref.instance[output] as OutputEmitterRef<any>
    outputField.subscribe(data => {
      marker.closePopup()
      this.$appRef.detachView(ref.hostView)
      if (onOutput) {
        onOutput(data)
      }
    })

    for (let field in inputs) {
      ref.setInput(field, inputs[field])
    }

    return L.popup({content: (<EmbeddedViewRef<T>>ref.hostView).rootNodes[0]})
  }
}
