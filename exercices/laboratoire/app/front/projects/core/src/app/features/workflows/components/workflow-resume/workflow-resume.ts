import {Component, effect, inject, input} from '@angular/core';
import {WorkflowState} from '@features/workflows/workflow-store';
import {ScrollPanel} from 'primeng/scrollpanel';
import {JsonPipe} from '@angular/common';
import {Panel} from 'primeng/panel';
import {Button} from 'primeng/button';
import {TranslatePipe} from '@ngx-translate/core';
import {WorkflowService} from '@features/workflows/services/workflow.service';
import {Router} from '@angular/router';

@Component({
  selector: 'workflow-resume',
  imports: [
    ScrollPanel,
    JsonPipe,
    Panel,
    Button,
    TranslatePipe
  ],
  templateUrl: './workflow-resume.html',
  styleUrl: './workflow-resume.css'
})
export class WorkflowResume {
  private $workflow = inject(WorkflowService)
  private $router = inject(Router)

  workflow = input.required<WorkflowState>()

  private updateWorkflowMutation = this.$workflow.updateWorkflow()
  updateWorkflowSuccess = this.updateWorkflowMutation.isSuccess

  updateWorkflowEffect = effect(() => {
    const success = this.updateWorkflowSuccess()

    if (success) {
      this.$router.navigate(['../'])
    }
  })

  async onSubmit() {
    await this.updateWorkflowMutation(this.workflow())
  }
}
