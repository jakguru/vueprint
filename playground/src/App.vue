<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>VuePrint Playground</v-toolbar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row justify="center">
          <v-col cols="12" sm="4" md="3" xl="2">
            <v-card>
              <v-list-item title="Mounted">
                <template #append>
                  <v-icon :color="mounted ? 'green' : 'red'">{{ mounted ? 'mdi-check' : 'mdi-close' }}</v-icon>
                </template>
              </v-list-item>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" md="3" xl="2">
            <v-card>
              <v-list-item title="Booted" @click="onReadyOrCompleteClick">
                <template #append>
                  <v-icon :color="booted ? 'green' : 'red'">{{ booted ? 'mdi-check' : 'mdi-close' }}</v-icon>
                </template>
              </v-list-item>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" md="3" xl="2">
            <v-card>
              <v-list-item title="Ready" @click="onReadyOrCompleteClick">
                <template #append>
                  <v-icon :color="ready ? 'green' : 'red'">{{ ready ? 'mdi-check' : 'mdi-close' }}</v-icon>
                </template>
              </v-list-item>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" md="3" xl="2">
            <v-card>
              <v-list-item title="Complete" @click="onReadyOrCompleteClick">
                <template #append>
                  <v-icon :color="complete ? 'green' : 'red'">{{ complete ? 'mdi-check' : 'mdi-close' }}</v-icon>
                </template>
              </v-list-item>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" md="3" xl="2">
            <v-card>
              <v-list-item title="Updateable">
                <template #append>
                  <v-icon :color="updateable ? 'green' : 'red'">{{ updateable ? 'mdi-check' : 'mdi-close' }}</v-icon>
                </template>
              </v-list-item>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, computed, inject } from 'vue'
import { useVueprint, getBootStatuses } from '@jakguru/vueprint/utilities'
import type { SwalService } from '@jakguru/vueprint'
export default defineComponent({
  setup() {
    const { mounted, booted, ready, updateable } = useVueprint({}, true)
    const complete = computed(() => mounted.value && booted.value && ready.value)
    const swal = inject<SwalService>('swal')
    const onReadyOrCompleteClick = () => {
      const status = getBootStatuses()
      status.mounted = mounted.value
      status.booted = booted.value
      status.ready = ready.value
      status.complete = complete.value
      console.log(status)
      if (swal) {
        swal.fire({
          title: 'Boot Statuses',
          text: JSON.stringify(status, null, 2),
        })
      }
    }
    return { mounted, booted, ready, complete, updateable, onReadyOrCompleteClick }
  },
})
</script>
