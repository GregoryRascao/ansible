import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource} from '@angular/common/http';
import {environment} from '@core/src/environments/environment';
import {PluginState} from '@core/src/app/features/plugins/plugin-store';
import {lastValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PluginService {
  private $http = inject(HttpClient)

  findAll() {
    return lastValueFrom(this.$http.get<PluginState[]>(`${environment.uri}/plugins`))
  }
  findByName(name: string) {
    return httpResource<PluginState>(() => `${environment.uri}/plugins/${name}`)
  }
}
