import {Component, effect, inject} from '@angular/core';
import {WorkflowService} from '@features/workflows/services/workflow.service';
import {TableModule} from 'primeng/table';
import {WorkflowList} from '@features/workflows/components/workflow-list/workflow-list';
import {Button} from 'primeng/button';
import {WorkflowState} from '@features/workflows/workflow-store';

@Component({
  selector: 'workflow-archive',
  imports: [
    TableModule,
    WorkflowList,
    Button
  ],
  templateUrl: './workflow-archive.html',
  styleUrl: './workflow-archive.css'
})
export class WorkflowArchive {
  private $workflow = inject(WorkflowService)

  workflowsResource = this.$workflow.getAll(true)
  workflows = this.workflowsResource.value
  workflowsIsLoading = this.workflowsResource.isLoading
  workflowsError = this.workflowsResource.error

  restoreWorkflowMutation = this.$workflow.restoreWorkflow()
  restoreWorkflowSuccess = this.restoreWorkflowMutation.isSuccess
  restoreWorkflowEffect = effect(() => {
    if (this.restoreWorkflowSuccess()) {
      this.workflowsResource.reload()
    }
  })

  async restoreWorkflow(item: WorkflowState) {
    await this.restoreWorkflowMutation(item)
  }
}
