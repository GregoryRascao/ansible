import {Component, effect, inject, linkedSignal, OnDestroy} from '@angular/core';
import {WorkflowService} from '@features/workflows/services/workflow.service';
import {WorkflowList} from '@features/workflows/components/workflow-list/workflow-list';
import {ProgressSpinner} from 'primeng/progressspinner';
import {WorkflowAdd} from '@features/workflows/components/workflow-add/workflow-add';
import {WorkflowState, WorkflowStep} from '@features/workflows/workflow-store';
import {DialogService} from 'primeng/dynamicdialog';
import {MessageService} from 'primeng/api';
import {KeycloakStore} from '@shared/modules/keycloak/keycloak-store';
import {Button} from 'primeng/button';
import {Image} from 'primeng/image';
import {TranslatePipe} from '@ngx-translate/core';
import {Tooltip} from 'primeng/tooltip';
import {RouterLink} from '@angular/router';
import {Toast} from 'primeng/toast';
import {AppStore} from '@core/src/app/app-store';

@Component({
  selector: 'workflow',
  imports: [
    WorkflowList,
    ProgressSpinner,
    Button,
    Image,
    TranslatePipe,
    Tooltip,
    RouterLink,
    Toast
  ],
  templateUrl: './workflows.html',
  styleUrl: './workflows.css',
  providers: [DialogService, MessageService],
})
export class Workflows implements OnDestroy {
  private $app = inject(AppStore)
  private $workflow = inject(WorkflowService)
  private $dialog = inject(DialogService)
  private $message = inject(MessageService)
  private $keycloak = inject(KeycloakStore)

  workflowsResource = this.$workflow.getAll()
  workflows = linkedSignal(() => this.workflowsResource.value())
  workflowsIsLoading = this.workflowsResource.isLoading
  workflowsError = this.workflowsResource.error

  addWorkflowMutation = this.$workflow.addWorkflow()
  addWorkflowSuccess = this.addWorkflowMutation.isSuccess

  startWorkflowMutation = this.$workflow.startWorkflow()
  startWorkflowSuccess = this.startWorkflowMutation.isSuccess

  stopWorkflowMutation = this.$workflow.stopWorkflow()
  stopWorkflowSuccess = this.stopWorkflowMutation.isSuccess

  executeOnceWorkflowMutation = this.$workflow.executeOnceWorkflow()
  executeOnceWorkflowSuccess = this.executeOnceWorkflowMutation.isSuccess

  archivedWorkflowMutation = this.$workflow.archiveWorkflow()
  archivedWorkflowSuccess = this.archivedWorkflowMutation.isSuccess

  addWorkflowEffect = effect(() => {
    const value = this.addWorkflowMutation.value()
    const success = this.addWorkflowSuccess()
    if (!success || !value) {
      this.$message.add({
        severity: 'error',
        summary: 'Workflow',
        detail: 'Workflow not created'
      })
    } else {
      this.$message.add({
        severity: 'success',
        summary: 'Workflow',
        detail: `Workflow ${value.metadata.name} copied, you are going to be redirected to the workflow edition`
      })
      this.workflowsResource.reload()
    }
  })
  archivedWorkflowEffect = effect(() => {
    const value = this.archivedWorkflowMutation.value()
    const success = this.archivedWorkflowSuccess()
    if (!success || !value) {
      this.$message.add({
        severity: 'error',
        summary: 'Workflow',
        detail: 'Workflow not archived'
      })
    } else {
      this.$message.add({
        severity: 'success',
        summary: 'Workflow',
        detail: `Workflow ${value.metadata.name} archived`
      })
      // this.workflowsResource.reload()
    }
  })
  startWorkflowEffect = effect(() => {
    const status = this.startWorkflowMutation.status()
    const value = this.startWorkflowMutation.value()
    const success = this.startWorkflowSuccess()

    if (status == 'error' && !value) {
      this.$message.add({
        severity: 'error',
        summary: 'Workflow',
        detail: 'Workflow not started'
      })
    } else if (success && value) {
      // this.$message.add({
      //   severity: 'success',
      //   summary: 'Workflow',
      //   detail: `Workflow ${value.metadata.name} started`
      // })
      // this.workflowsResource.reload()
    }
  })
  stopWorkflowEffect = effect(() => {
    const value = this.stopWorkflowMutation.value()
    const success = this.stopWorkflowSuccess()
    if (!success || !value) {
      this.$message.add({
        severity: 'error',
        summary: 'Workflow',
        detail: 'Workflow not stopped'
      })
    } else {
      // this.$message.add({
      //   severity: 'success',
      //   summary: 'Workflow',
      //   detail: `Workflow ${value.metadata.name} stopped`
      // })
      // this.workflowsResource.reload()
    }
  })
  executeOnceWorkflowEffect = effect(() => {
    const value = this.executeOnceWorkflowMutation.value()
    const success = this.executeOnceWorkflowSuccess()
    if (!success || !value) {
      this.$message.add({
        severity: 'error',
        summary: 'Workflow',
        detail: 'Workflow not executed'
      })
    } else {
      // this.$message.add({
      //   severity: 'success',
      //   summary: 'Workflow',
      //   detail: `Workflow ${value.metadata.name} started for one job`
      // })
    }
  })


  ngOnDestroy(): void {
    this.addWorkflowEffect?.destroy()
    this.archivedWorkflowEffect?.destroy()
    this.startWorkflowEffect?.destroy()
    this.stopWorkflowEffect?.destroy()
    this.executeOnceWorkflowEffect?.destroy()
  }

  addWorkflow() {
    const $ref = this.$dialog.open(WorkflowAdd, {
      appendTo: document.body,
      header: 'Add Workflow',
      closable: true,
      dismissableMask: true,
      position: 'center',
      width: '50vw',
    })

    $ref!.onClose.subscribe(async (result: any) => {
      if (!result) return

      const user = await this.$keycloak.getUser()
      const workflow: WorkflowState = {
        metadata: {
          name: result.name,
          cronExpression: result.cronExpression,
          description: result.description,
          folder: result.folder || "unknow",
        },
        steps: [] as WorkflowStep[],
        auditing: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: `${user.firstName} ${user.lastName}`,
          updatedBy: `${user.firstName} ${user.lastName}`,
          active: result.active,
          archived: false
        }
      }

      const res = await this.addWorkflowMutation(workflow)
      if (res.status == "error") {

      } else if (res.status == "success") {
        this.$message.add({severity: 'success', summary: 'Workflow', detail: `Workflow ${result.name} created`})
        this.workflowsResource.reload()
      }
    })
  }

  async copyWorkflow(workflow: WorkflowState) {
    const user = await this.$keycloak.getUser()

    const createdBy = `${user.firstName} ${user.lastName}`
    const updatedBy = createdBy
    const createdAt = new Date()
    const updatedAt = new Date()

    const copy = {
      metadata: {
        name: workflow.metadata.name + ' copy',
        folder: 'unknow'
      },
      steps: [...workflow.steps],
      auditing: {...workflow.auditing, active: false, archived: false, createdBy, updatedBy, createdAt, updatedAt},
    } as WorkflowState

    await this.addWorkflowMutation(copy)
  }

  async stopWorkflow(item: WorkflowState) {
    await this.stopWorkflowMutation(item)
    item.auditing.active = false
  }

  async playWorkflow(item: WorkflowState) {
    await this.startWorkflowMutation(item)
    item.auditing.active = true
  }

  async oneTimeWorkflow(item: WorkflowState) {
    await this.executeOnceWorkflowMutation(item)
  }

  async archiveWorkflow(item: WorkflowState) {
    await this.archivedWorkflowMutation(item)
  }

  refreshWorkflow() {
    this.workflowsResource.reload()
  }
}
