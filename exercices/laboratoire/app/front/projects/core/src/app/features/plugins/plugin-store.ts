import {patchState, signalStore, withComputed, withHooks, withMethods, withProps} from '@ngrx/signals';
import {addEntities, SelectEntityId, withEntities} from '@ngrx/signals/entities';
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {computed, inject, signal} from '@angular/core';
import {PluginService} from '@core/src/app/features/plugins/services/plugin.service';
import {AppStore} from '@core/src/app/app-store';
import {PluginFormDefinition, PluginType} from '@core/src/app/features/plugins/models/plugin-form';
import {WorkflowState} from '@features/workflows/workflow-store';

export type PluginState = {
  _id: string,
  name: string,
  type: PluginType,
  formDefinition: PluginFormDefinition,
}

const selectId: SelectEntityId<PluginState> = (plugin) => plugin._id

export const PluginStore = signalStore(
  {providedIn: "root"},
  withEntities<PluginState>(),
  withDevtools('plugins'),
  withProps((store) => ({
    selectName: signal<string | null>(null),
    selectType: signal<PluginType | null>("metadata"),
    selectByWorkflow: (workflow: WorkflowState | undefined) => {
      if (!workflow) return []
      const plugins = workflow.steps.map(it => it.pluginName)

      return store.entities().filter(it => plugins.includes(it.name))
    }
  })),
  withComputed((store) => ({
      getPlugins: computed(() => {
        const type = store.selectType()
        const entities = store.entities()

        return entities.filter(it => it.type === type)
      }),
      getPlugin: computed(() => {
        const name = store.selectName()
        const entities = store.entities()

        if (!name) return null
        return entities.find(it => it.name === name)
      }),
      getPluginMetadata: computed(() => {
        return store.entities().find(it => it.type === 'metadata')!
      })
    })
  ),
  withMethods((store, $plugin = inject(PluginService)) => ({
    selectPluginByName(name: string) {
      store.selectName.set(name)
    },
    addPlugins(plugins: PluginState[]) {
      patchState(store, addEntities(plugins, {selectId}))
    }
  })),
  withHooks((store, $plugin = inject(PluginService), $appStore = inject(AppStore)) => ({
    async onInit() {
      const plugins = await $plugin.findAll()

      patchState(store, addEntities(plugins, {selectId}))
    }
  }))
)
