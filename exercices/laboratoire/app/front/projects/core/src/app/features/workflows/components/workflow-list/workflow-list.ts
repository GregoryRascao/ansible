import {
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  OnDestroy,
  OnInit,
  output,
  TemplateRef
} from '@angular/core';
import {Table, TableFilterEvent, TableModule, TableRowReorderEvent} from 'primeng/table';
import {WorkflowState} from '@features/workflows/workflow-store';
import {DialogService} from 'primeng/dynamicdialog';
import {WorkflowService} from '@features/workflows/services/workflow.service';
import {DatePipe, NgTemplateOutlet} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {groupBy} from 'ts-array-extensions';
import {ConfirmationService, MessageService} from 'primeng/api';
import {JobHistory} from '@features/jobs/components/job-history/job-history';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {Badge} from 'primeng/badge';
import {Popover} from 'primeng/popover';
import {Button} from 'primeng/button';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {Ripple} from 'primeng/ripple';
import {WorkflowSocketService} from '@features/workflows/services/workflow-socket.service';
import {Toast} from 'primeng/toast';


@Component({
  selector: 'workflow-list',
  imports: [
    TableModule,
    DatePipe,
    TranslatePipe,
    NgTemplateOutlet,
    ConfirmDialog,
    Badge,
    Popover,
    Button,
    IconField,
    InputIcon,
    InputText,
    Ripple,
    Toast
  ],
  templateUrl: './workflow-list.html',
  styleUrl: './workflow-list.css',
  providers: [DialogService, ConfirmationService, MessageService],
})
export class WorkflowList implements OnInit, OnDestroy {
  private $dialog = inject(DialogService)
  private $confirmation = inject(ConfirmationService)
  private $message = inject(MessageService)
  private $workflow = inject(WorkflowService)
  private $workflowSocket = inject(WorkflowSocketService)

  listState = linkedSignal(() => this.workflows())

  actionsTemplate = contentChild<TemplateRef<{ $implicit: WorkflowState }>>('actions')
  captionTemplate = contentChild<TemplateRef<any>>('caption')

  refreshData = output()
  statChange = output<WorkflowState>()

  workflows = model.required<WorkflowState[]>()
  isLoading = input<boolean>(false)

  editWorkflowMutation = this.$workflow.updateWorkflow()
  editWorkflowSuccess = this.editWorkflowMutation.isSuccess

  moveWorkflowMutation = this.$workflow.moveWorkflow()
  moveWorkflowSuccess = this.moveWorkflowMutation.isSuccess

  isExpandedAll = computed(() => {
    const expandedRows = this.expandedRows()
    let expanded = true;

    for (const folder in expandedRows) {
      if (!expandedRows[folder]) {
        expanded = false;
      }
    }

    return expanded
  })
  isCollapsedAll = computed(() => !this.isExpandedAll())

  editWorkflowEffect = effect(() => {
    const e = this.editWorkflowMutation.error() as any
    if (this.editWorkflowMutation.isSuccess()) {
      this.refreshData.emit()
    } else if (e) {
      this.$message.add({severity: 'error', summary: 'Error', detail: e})
    }
  })

  ngOnInit(): void {
    this.$workflowSocket.on('new', (workflow) => this.newWorkflowFromSocket(workflow.msg))
    this.$workflowSocket.on('start', (workflow) => this.startWorkflowFromSocket(workflow.msg))
    this.$workflowSocket.on('stop', (workflow) => this.stopWorkflowFromSocket(workflow.msg))
    this.$workflowSocket.on('update', (workflow) => this.updateWorkflowFromSocket(workflow.msg))
    this.$workflowSocket.on('play', (workflow) => this.playWorkflowFromSocket(workflow.msg))
  }

  private startWorkflowFromSocket(workflow: Record<string, any>) {
    const workflowId = workflow['_id']
    const workflows = this.workflows()

    const index = workflows.findIndex(it => it._id === workflowId)

    if (index != -1) {
      workflows[index]['running'] = true
    }
    this.$message.add({
      severity: 'success',
      summary: 'Workflow',
      detail: `Workflow ${workflows[index].metadata.name} started`
    })
  }

  private stopWorkflowFromSocket(workflow: Record<string, any>) {
    const workflowName = workflow['workflowName']

    const toStartWorkflow = this.workflows().find(it => it.metadata.name === workflowName)

    if (toStartWorkflow) {
      toStartWorkflow['running'] = false
      toStartWorkflow['auditing'].active = false
    }
    this.$message.add({
      severity: 'info',
      summary: 'Workflow',
      detail: `Workflow ${workflowName} stopped`
    })
  }

  private updateWorkflowFromSocket(workflow: Record<string, any>) {

    console.log("Workflow update: ", workflow)
    this.$message.add({
      severity: 'warn',
      summary: 'Workflow',
      detail: 'A workflow has been updated by an other user => I\'m going to reload in 5 seconds'
    })
    setTimeout(() => this.refreshData.emit(), 5_000)
  }

  private newWorkflowFromSocket(workflow: Record<string, any>) {
    this.$message.add({
      severity: 'warn',
      summary: 'Workflow',
      detail: 'A new workflow has been added by an other user => I\'m going to reload in 5 seconds'
    })
    setTimeout(() => this.refreshData.emit(), 5_000)
  }

  ngOnDestroy(): void {
    this.$workflowSocket.disconnect()
  }

  async handleRowReorder($event: TableRowReorderEvent) {
    const {dragIndex, dropIndex} = $event;
    if (dragIndex === dropIndex || dragIndex === undefined || dropIndex === undefined) return;

    const allWorkflows = [...this.workflows()];
    const draggedWorkflow = {...allWorkflows[dragIndex]}; // Clone pour éviter la mutation directe
    const targetWorkflow = allWorkflows[dropIndex];

    const isFolderChange = draggedWorkflow.metadata.folder !== targetWorkflow.metadata.folder;

    const performReorder = async () => {
      // 1. Calcul du nouvel état local
      const newWorkflows = [...allWorkflows];
      const [movedItem] = newWorkflows.splice(dragIndex, 1);

      // Mise à jour du dossier si nécessaire
      if (isFolderChange) {
        movedItem.metadata.folder = targetWorkflow.metadata.folder;
      }

      newWorkflows.splice(dropIndex, 0, movedItem);

      // 2. Mise à jour des ordres (uniquement en local pour la cohérence UI)
      newWorkflows.forEach((w, index) => {
        w.metadata.order = index;
      });

      // 3. Mise à jour du Signal (L'UI se rafraîchit instantanément sans saut)
      this.listState.set(newWorkflows);

      try {
        // 4. Persistance : On n'envoie que l'objet modifié
        // Le backend doit être capable de déduire la position ou de gérer l'index envoyé
        await this.moveWorkflowMutation(movedItem);

        // Optionnel : Notification de succès (toast)
      } catch (error) {
        // 5. Rollback en cas d'erreur
        this.workflows.set(allWorkflows);
        // Afficher une erreur à l'utilisateur
      }
    };

    if (isFolderChange) {
      this.$confirmation.confirm({
        message: `Déplacer vers le dossier ${targetWorkflow.metadata.folder} ?`,
        header: 'Confirmation de déplacement',
        icon: 'pi pi-exclamation-triangle',
        accept: () => performReorder()
      });
    } else {
      await performReorder();
    }
  }

  expandedRows = linkedSignal(() => {
    const expandedRows = {} as any;
    const workflows = this.workflows()

    const grouped = groupBy(workflows, w => w.metadata.folder || 'unknow')

    grouped.forEach((group, _) => {
      expandedRows[group.key] = group.values.some(w => w.metadata.lastExecutionStatus && w.metadata.lastExecutionStatus != "SUCCESS" && w.auditing.active);
    })

    return expandedRows;
  })

  expandedRowsEffect = effect(() => {
    console.log(this.expandedRows())
  })


  toggleRow(workflow: any) {
    const expandedRows = this.expandedRows()

    expandedRows[workflow.metadata.folder] = !expandedRows[workflow.metadata.folder];

    this.expandedRows.set(expandedRows)
  }

  expandAll() {
    const expandedRows = this.expandedRows()

    console.log(expandedRows)
    for (const folder in expandedRows) {
      expandedRows[folder] = true;
    }

    this.expandedRows.set({...expandedRows})
  }

  collapseAll() {
    const expandedRows = this.expandedRows()
    for (const folder in expandedRows) {
      expandedRows[folder] = false;
    }
    this.expandedRows.set({...expandedRows})
  }


  showJobList(item: WorkflowState, acknowledged: boolean = true) {
    this.$dialog.open(JobHistory, {
      header: 'Job History',
      maximizable: true,
      closable: true,
      dismissableMask: true,
      modal: true,
      inputValues: {workflowName: item.metadata.name, acknowledged: acknowledged},
    })
  }

  protected toggleAll() {
    const isExpanded = this.isExpandedAll()

    console.log(isExpanded)
    if (isExpanded) {
      this.collapseAll()
    } else {
      this.expandAll()
    }
  }

  private playWorkflowFromSocket(msg: Record<string, any>) {
    const workflows = this.workflows();
    const workflow = workflows.find(w => w._id === msg['_id'])
    if (workflow) {
      workflow.auditing.active = true
      this.$message.add({
        severity: 'success',
        summary: 'Workflow',
        detail: `The workflow ${workflow.metadata.name} is now playing cron expression ${workflow.metadata.cronExpression}`
      })
    }


  }

  protected onFilter($event: TableFilterEvent, dt: Table<WorkflowState>) {
    const workflows = $event.filteredValue as WorkflowState[]
    const expandedRows = this.expandedRows()

    const folders = workflows.map(w => w.metadata.folder)
    for (const folder in expandedRows) {
      if (folders.includes(folder)) {
        expandedRows[folder] = true
      }
    }
    this.expandedRows.set({...expandedRows})
  }
}
