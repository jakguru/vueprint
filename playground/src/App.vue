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
              <v-list-item title="Updateable" @click="doUpdate">
                <template #append>
                  <v-icon :color="updateable ? 'green' : 'red'">{{ updateable ? 'mdi-check' : 'mdi-close' }}</v-icon>
                </template>
              </v-list-item>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" md="3" xl="2">
            <v-card>
              <v-list-item title="Can Request Push" @click="doOnRequestPush">
                <template #append>
                  <v-icon :color="canRequestPush ? 'green' : 'red'">{{ canRequestPush ? 'mdi-check' : 'mdi-close' }}</v-icon>
                </template>
              </v-list-item>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" md="3" xl="2">
            <v-card>
              <v-list-item title="Can Push">
                <template #append>
                  <v-icon :color="canPush ? 'green' : 'red'">{{ canPush ? 'mdi-check' : 'mdi-close' }}</v-icon>
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
// @ts-ignore stupid typescript
import { useVueprint, getBootStatuses } from '@jakguru/vueprint/utilities'
import type { SwalService, PushService } from '@jakguru/vueprint'
export default defineComponent({
  setup() {
    const { mounted, booted, ready, updateable } = useVueprint({}, true)
    const complete = computed(() => mounted.value && booted.value && ready.value)
    const swal = inject<SwalService>('swal')
    const push = inject<PushService>('push')
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
    const canRequestPush = computed(() => {
      if (!mounted.value || !ready.value || !push) {
        return false
      }
      return push.canRequestPermission.value
    })

    const doOnRequestPush = () => {
      if (push && push.canRequestPermission.value) {
        push.requestPushPermission()
      }
    }

    const doUpdate = () => {
      if (updateable.value && push) {
        push.update()
      }
    }

    const canPush = computed(() => push && push.canPush.value)
    return { mounted, booted, ready, complete, updateable, doUpdate, onReadyOrCompleteClick, canRequestPush, doOnRequestPush, canPush }
  },
})
</script>
