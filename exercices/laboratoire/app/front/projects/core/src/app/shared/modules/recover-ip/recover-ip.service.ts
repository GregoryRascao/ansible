import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecoverIpService {
  private $http = inject(HttpClient)

  async getCurrentIp() {
    return lastValueFrom(this.$http.get<{ ip: string }>('https://api.ipify.org?format=json'))
      .then(it => it.ip)
      .catch(it => '127.0.0.1')
  }
}
