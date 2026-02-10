import {Injectable} from '@angular/core';
import {WebSocketService} from '@shared/services/web-socket.service';
import {environment} from '@core/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkflowSocketService extends WebSocketService {
  constructor() {
    super("waves.front.workflow", `${environment.uri}/workflow`);
  }
}
