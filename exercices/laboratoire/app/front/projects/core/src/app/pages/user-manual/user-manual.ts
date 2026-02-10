import {Component, computed, inject, resource} from '@angular/core';
import {ScrollPanel} from 'primeng/scrollpanel';
import {PluginService} from '@features/plugins/services/plugin.service';
import {groupBy} from 'ts-array-extensions';
import {TranslatePipe} from '@ngx-translate/core';
import {Dialog} from 'primeng/dialog';
import {DialogService} from 'primeng/dynamicdialog';
import {MdView} from '@shared/modules/mardown/components/md-view';

@Component({
  selector: 'user-manual',
  imports: [
    ScrollPanel,
    TranslatePipe,
    Dialog,
  ],
  templateUrl: './user-manual.html',
  styleUrl: './user-manual.css',
  providers: [DialogService, TranslatePipe]
})
export class UserManual {
  private $plugin = inject(PluginService)
  private $dialog = inject(DialogService)

  pluginResources = resource({
    loader: () => this.$plugin.findAll(),
    defaultValue: []
  })
  plugins = this.pluginResources.value

  contextualHelpers = computed(() => this.plugins()
    .map(plugin => ({
      plugin: plugin.name,
      type: plugin.type,
      contextualHelper: plugin.formDefinition.contextualHelper!
    }))
  )

  tableOfContents = computed(() => {
    const helpers = this.contextualHelpers()

    const group = groupBy(helpers, (helper) => helper.type)

    return group
  })
  protected readonly document = document;

  protected openDialog(item: {
    plugin: string;
    type: "metadata" | "source" | "transform" | "destination" | "resume";
    contextualHelper: string
  }) {
    this.$dialog.open(MdView, {
      appendTo: document.body,
      header: item.plugin,
      closable: true,
      dismissableMask: true,
      position: 'center',
      width: '50vw',
      inputValues: {content: item.contextualHelper}
    })
  }
}
