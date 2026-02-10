import {Directive, ElementRef, inject, OnInit, signal} from '@angular/core';
import * as L from 'leaflet/dist/leaflet-src.esm.js'
import { Util } from 'leaflet/dist/leaflet-src.esm.js'
import isArray = Util.isArray;

@Directive({
  selector: '[map]'
})
export class MapDirective implements OnInit {
  private $er = inject(ElementRef<HTMLDivElement>)

  private leafletMap = signal(L.map(this.$er.nativeElement))


  ngOnInit() {
    const leafletMap = this.leafletMap()

    leafletMap.fitWorld()
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19})

    tiles.addTo(leafletMap)

    setTimeout(() => {
      leafletMap.invalidateSize()
      leafletMap.locate({setView: true, maxZoom: 8, enableHighAccuracy: true})
      this.leafletMap.update(() => leafletMap)
    }, 10)
  }

  addMarker(markers: L.Marker | L.Marker[]) {
    const leafletMap = this.leafletMap()

    if (isArray(markers)) {
      const array = markers as L.Marker[]
      array.forEach(marker => marker.addTo(leafletMap))
    } else {
      const marker = markers as L.Marker
      marker.addTo(leafletMap)
    }

    this.leafletMap.update(() => leafletMap)
  }

  clean() {
    const leafletMap = this.leafletMap()

    leafletMap.eachLayer((layer: any) => {
      if (layer['_latlng']) {
        layer.remove()
      }
    })

    this.leafletMap.update(() => leafletMap)
  }

  invalidate() {
    const leafletMap = this.leafletMap()
    leafletMap.invalidateSize()

    this.leafletMap.update(() => leafletMap)
  }

  flyTo(location: L.LatLngBounds | L.LatLngExpression | L.Marker, options: L.FitBoundsOptions | L.ZoomPanOptions = {}) {
    const leafletMap = this.leafletMap()

    if (location instanceof L.LatLngBounds) {
      leafletMap.flyToBounds(location, {...options, maxZoom: 18 })
    } else if (location instanceof L.Marker) {
      leafletMap.flyTo(location.getLatLng(), 18, options)
    } else {
      leafletMap.flyTo(location, 18, options)
    }
  }
}
