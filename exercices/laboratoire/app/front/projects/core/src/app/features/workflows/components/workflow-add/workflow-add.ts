import {Component, effect, inject, signal, viewChild} from '@angular/core';
import {PluginStore} from '@features/plugins/plugin-store';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {FormGroup} from '@angular/forms';
import {PluginForm} from '@features/plugins/components/plugin-form/plugin-form';
import {PluginFormTool} from '@features/plugins/tools/plugin-form-tool';
import {TranslatePipe} from '@ngx-translate/core';
import {Button} from 'primeng/button';

@Component({
  selector: 'workflow-add',
  imports: [
    PluginForm,
    TranslatePipe,
    Button
  ],
  templateUrl: './workflow-add.html',
  styleUrl: './workflow-add.css',
  providers: [DynamicDialogConfig]
})
export class WorkflowAdd {
  private $ref = inject(DynamicDialogRef)
  private $config = inject(DynamicDialogConfig)
  private $plugins = inject(PluginStore)

  private $pluginForm = viewChild<PluginForm>(PluginForm)

  metadataPlugin = this.$plugins.getPluginMetadata

  form = signal<FormGroup | undefined>(undefined)

  metadataPluginEffect = effect(() => {
    const plugin = this.metadataPlugin()

    const form = PluginFormTool.generateForm(plugin.formDefinition)
    this.form.set(form)
  })

  handleSubmit() {
    const form = this.$pluginForm()
    if (!form) return
    if (form.pluginForm?.valid) {
      this.$ref.close(form.pluginForm?.value)
    }
  }
}
