import { Component, viewChild } from '@angular/core';
import { MMapComponent } from '@shared/modules/map/m-map.component';
import { Button } from 'primeng/button';
import * as L from 'leaflet/dist/leaflet-src.esm.js';
import { MapUtil } from '@shared/modules/map/util/map.util';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'test-map',
  imports: [MMapComponent, Button, CardModule],
  templateUrl: './test-map.component.html',
  styleUrl: './test-map.component.css',
})
export class TestMapComponent {
  map = viewChild.required<MMapComponent>(MMapComponent);

  addMarker() {
    this.map().clean();
    const marker = L.marker([50.660045, 4.618843], { title: 'Memoco' });
    this.map().addMarker(marker);
  }

  addMarkerWithIcon() {
    this.map().clean();
    const marker = L.marker([50.660045, 4.618843], {
      title: 'Memoco',
      icon: MapUtil.createIcon('violet'),
    });
    this.map().addMarker(marker);
  }

  zoomTo(animate: boolean = true) {
    this.map().flyToLatLnt([50.660045, 4.618843], { animate });
  }

  cleanMap() {
    this.map().clean();
  }

  addMarkerWithIconAndPopup() {
    this.map().clean();
    const marker = L.marker([50.660045, 4.618843], {
      title: 'Memoco',
      icon: MapUtil.createIcon('violet2x'),
    });
    marker.bindPopup('Hello World');
    this.map().addMarker(marker);
  }
}
