import {Component, computed, effect, inject, linkedSignal, OnInit, viewChildren} from '@angular/core';
import {PluginState, PluginStore} from '@features/plugins/plugin-store';
import {WorkflowStep, WorkflowStore} from '@features/workflows/workflow-store';
import {RouterStore} from '@core/src/app/router-store';
import {MessageService, PrimeIcons} from 'primeng/api';
import {PluginForm} from '@features/plugins/components/plugin-form/plugin-form';
import {PluginType} from '@features/plugins/models/plugin-form';
import {Step, StepList, Stepper} from 'primeng/stepper';
import {Accordion, AccordionContent, AccordionHeader, AccordionPanel} from 'primeng/accordion';
import {TranslatePipe} from '@ngx-translate/core';
import {Select} from 'primeng/select';
import {Button} from 'primeng/button';
import {WorkflowResume} from '@features/workflows/components/workflow-resume/workflow-resume';
import {Toast} from 'primeng/toast';
import {WorkflowService} from '@features/workflows/services/workflow.service';
import {ScrollPanel} from 'primeng/scrollpanel';

@Component({
  selector: 'workflows-edit',
  imports: [
    Stepper,
    StepList,
    Step,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    PluginForm,
    TranslatePipe,
    Select,
    Button,
    WorkflowResume,
    Toast,
    ScrollPanel
  ],
  templateUrl: './workflow-edit.html',
  styleUrl: './workflow-edit.css',
  providers: [WorkflowStore, MessageService]
})
export class WorkflowEdit implements OnInit {
  protected $store = inject(WorkflowStore)
  private $plugins = inject(PluginStore)
  private $workflow = inject(WorkflowService)
  private $route = inject(RouterStore)
  private $message = inject(MessageService)

  workflowResource = this.$workflow.getOne(this.$route.params)
  workflow = this.workflowResource.value
  workflowIsLoading = this.workflowResource.isLoading
  workflowError = this.workflowResource.error

  workflowEffect = effect(() => {
    const workflow = this.workflow()

    this.$store.updateWorkflow(workflow)
  })

  selectType = this.$plugins.selectType

  forms = viewChildren<PluginForm>(PluginForm)

  plugins = this.$plugins.getPlugins
  metadataPlugin = this.$plugins.getPluginMetadata

  workflowPlugins = linkedSignal(() => {
    const workflow = this.$store.workflow()
    if (!workflow) return []
    if (Object.keys(workflow).length == 0) return []
    const metadata = this.metadataPlugin()
    const plugins = this.plugins()
    const selectType = this.selectType()

    const workflowPlugins = [] as (PluginState & { uuid: string })[]
    workflowPlugins.push({...metadata, uuid: 'metadata'})

    for (const [index, step] of workflow.steps.entries()) {
      const plugin = plugins.find(it => it.name == step.pluginName)
      if (plugin) workflowPlugins.push({...plugin, uuid: `${plugin.name}-${index}`})
    }

    return workflowPlugins
      .filter(value => value.type === selectType)
  })
  configs = computed(() => {
    const workflow = this.$store.workflow()
    if (!workflow) return []
    if (Object.keys(workflow).length == 0) return []

    const metadata = {
      pluginName: 'metadata',
      pluginType: 'metadata',
      values: {
        id: workflow._id,
        ...workflow.metadata,
        active: workflow.auditing.active,
      },
      uuid: 'metadata',
    } as WorkflowStep
    return [metadata, ...workflow.steps]
  })
  pluginTypeConfigs = computed(() => {
    const configs = this.configs();
    const type = this.selectType();

    return configs.filter(value => value.pluginType === type).map(value => value.values)
  })

  ngOnInit(): void {
    this.$plugins.selectType.set('metadata')
  }

  addPlugin(plugin: PluginState | undefined) {
    const workflow = this.$store.workflow()

    if (plugin && workflow) {
      const step = {
        pluginName: plugin.name,
        pluginType: plugin.type,
        values: {} as any,
      } as WorkflowStep

      for (const field of plugin.formDefinition.fields) {
        for (const [key, value] of Object.entries(field)) {
          if (value.defaultValue) step.values[key] = value.defaultValue
        }
      }

      workflow.steps.push(step)
      this.$store.updateWorkflow({...workflow})
    }
  }

  removeStep(type: PluginType, filteredIndex: number) {
    const workflow = this.$store.workflow()
    if (!workflow) return

    const stepIndex = this.mapFilteredIndexToStepIndex(type, filteredIndex, workflow)
    if (stepIndex === -1) return
    workflow.steps.splice(stepIndex, 1)
    this.$store.updateWorkflow({...workflow})
  }

  onPluginValueChange(type: PluginType | 'metadata', filteredIndex: number, value: any) {
    const workflow = this.$store.workflow()
    if (!workflow) return

    if (type === 'metadata') {
      const metadata = {...value}
      delete metadata.active
      workflow.metadata = {...workflow.metadata, ...metadata}
      if (value && typeof value.active !== 'undefined') {
        workflow.auditing.active = value.active
      }
      this.$store.updateWorkflow(workflow)
      return
    }

    const stepIndex = this.mapFilteredIndexToStepIndex(type, filteredIndex, workflow)
    if (stepIndex === -1) return
    workflow.steps[stepIndex].values = value
    this.$store.updateWorkflow(workflow)
  }

  private mapFilteredIndexToStepIndex(type: PluginType, filteredIndex: number, workflow: ReturnType<typeof this.$store.workflow> extends infer T ? T : any): number {
    if (!workflow) return -1
    let count = -1
    for (let i = 0; i < workflow.steps.length; i++) {
      if (workflow.steps[i].pluginType === type) {
        count++
        if (count === filteredIndex) return i
      }
    }
    return -1
  }

  onChangeType(type: PluginType) {
    const oldType = this.selectType()
    const forms = this.forms();

    try {
      for (const [_, form] of forms.entries()) {
        if (oldType == 'metadata') {
          this.onChangeFromMetadata(form)
        } else if (oldType == 'resume') {

        } else {
          this.onChangeFormSteps(form)
        }
      }
      this.selectType.set(type)
    } catch (e: Error | any) {
      this.$message.add({severity: 'error', summary: 'Error', detail: e.message})
    }
  }

  private onChangeFromMetadata(form: PluginForm) {
    const workflow = this.$store.workflow()
    if (!workflow) return
    const formGroup = form.pluginForm
    if (!formGroup) {
      throw new Error('Form is not valid')
    }

    const metadataValue = formGroup.value
    if (!metadataValue) return
    const metadata = {...metadataValue}
    delete metadata.active;
    workflow.metadata = {...workflow.metadata, ...metadata}
    workflow.auditing.active = metadataValue.active
    this.$store.updateWorkflow(workflow)
  }

  private onChangeFormSteps(form: PluginForm) {
    const workflow = this.$store.workflow()
    if (!workflow) return

    const formGroup = form.pluginForm
    if (!formGroup) return
    if (!formGroup.valid) {
      throw new Error('Form is not valid')
    }

    const stepValues = formGroup.value
    if (!stepValues) return
    const pluginType = form.plugin().type
    const filteredIndex = form.pluginIndex()
    const stepIndex = this.mapFilteredIndexToStepIndex(pluginType, filteredIndex, workflow)
    if (stepIndex === -1) return
    workflow.steps[stepIndex].values = stepValues
    this.$store.updateWorkflow(workflow)
  }

  protected readonly PrimeIcons = PrimeIcons;

  reorder($event: MouseEvent, direction: 'up' | 'down', filteredIndex: number) {
    $event.stopPropagation();
    const type = this.selectType() as PluginType;
    const workflow = this.$store.workflow();
    if (!workflow) return;

    // Save current form values before reordering
    const forms = this.forms();
    for (const [_, form] of forms.entries()) {
      if (type != 'metadata' && type != 'resume') {
        this.onChangeFormSteps(form)
      }
    }

    const stepIndex = this.mapFilteredIndexToStepIndex(type, filteredIndex, workflow);
    if (stepIndex === -1) return;

    let targetIndex = -1;
    if (direction === 'up') {
      for (let i = stepIndex - 1; i >= 0; i--) {
        if (workflow.steps[i].pluginType === type) {
          targetIndex = i;
          break;
        }
      }
    } else {
      for (let i = stepIndex + 1; i < workflow.steps.length; i++) {
        if (workflow.steps[i].pluginType === type) {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex !== -1) {
      const steps = [...workflow.steps];
      const tmp = steps[stepIndex];
      steps[stepIndex] = steps[targetIndex];
      steps[targetIndex] = tmp;

      this.$store.updateWorkflow({...workflow, steps});
    }
  }

  private updateWorkflowMutation = this.$workflow.updateWorkflow()
  updateWorkflowSuccess = this.updateWorkflowMutation.isSuccess

  updateWorkflowEffect = effect(() => {
    const success = this.updateWorkflowSuccess()

    if (success) {
      this.$route.router.navigate(['../'])
    }
  })

  onSubmit() {
    const type = this.selectType()
    const forms = this.forms();

    for (const [_, form] of forms.entries()) {
      if (type == 'metadata') {
        this.onChangeFromMetadata(form)
      } else if (type != 'resume') {
        this.onChangeFormSteps(form)
      }
    }
    this.updateWorkflowMutation(this.workflow())
  }
}
