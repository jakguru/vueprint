<template>
  <v-app>
    <v-app-bar app flat color="primary">
      <v-toolbar-title>VuePrint Vue Playground</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="6">
            <v-row align="center" justify="center">
              <v-col cols="10">
                <v-img src="@/assets/icon.jpg" contain />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" sm="6">
            <v-card>
              <v-list class="bg-transparent">
                <v-list-item title="Tab Focused">
                  <template #prepend>
                    <v-switch
                      :false-value="false"
                      :true-value="true"
                      hide-details
                      readonly
                      :model-value="active"
                      class="me-3"
                      color="success"
                    />
                  </template>
                </v-list-item>
                <v-divider />
                <v-list-item title="Application Booted">
                  <template #prepend>
                    <v-switch
                      :false-value="false"
                      :true-value="true"
                      hide-details
                      readonly
                      :model-value="booted"
                      :indeterminate="booted === null"
                      class="me-3"
                      color="success"
                    />
                  </template>
                </v-list-item>
                <v-divider />
                <v-list-item title="Application Ready">
                  <template #prepend>
                    <v-switch
                      :false-value="false"
                      :true-value="true"
                      hide-details
                      readonly
                      :model-value="ready"
                      :indeterminate="ready === null"
                      class="me-3"
                      color="success"
                    />
                  </template>
                </v-list-item>
                <v-divider />
                <v-list-item title="Visitor Authenticated">
                  <template #prepend>
                    <v-switch
                      :false-value="false"
                      :true-value="true"
                      hide-details
                      readonly
                      :model-value="authenticated"
                      :indeterminate="authenticated === null"
                      class="me-3"
                      color="success"
                    />
                  </template>
                </v-list-item>
                <v-divider />
                <v-list-item title="Push Notifications">
                  <template #prepend>
                    <v-switch
                      :false-value="false"
                      :true-value="true"
                      hide-details
                      readonly
                      :model-value="pushPermissions"
                      :indeterminate="pushPermissions === null"
                      class="me-3"
                      color="success"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, computed, inject, onMounted } from 'vue'
import { getDebugger } from '@jakguru/vueprint'
import type { BusInstance, IdentityInstance, PushServiceInstance, NotyfInstance, SwalInstance } from '@jakguru/vueprint'
import { useVueprint } from '@jakguru/vueprint/composables/useVueprint'
const debug = getDebugger('App')
export default defineComponent({
  name: 'App',
  setup() {
    const bus = inject<BusInstance>('bus')
    const identity = inject<IdentityInstance>('identity')
    const push = inject<PushServiceInstance>('push')
    const notyf = inject<NotyfInstance>('notyf')
    const swal = inject<SwalInstance>('swal')
    const toast = inject<SwalInstance>('toast')
    // const authenticated = ref<boolean | null>(false)
    // const pushPermissions = ref<boolean | null>(false)
    const { mounted, booted, ready } = useVueprint({
      onBooted: {
        onTrue: () => {
          booted.value = true
          debug('Booted is true')
        },
        onFalse: () => {
          booted.value = true === booted.value ? false : null
          debug('Booted is false')
        },
      },
      onReady: {
        onTrue: () => {
          ready.value = true
          debug('Ready is true')
        },
        onFalse: () => {
          ready.value = true === ready.value ? false : null
          debug('Ready is false')
        },
      },
      onAuthenticated: {
        onTrue: () => {
          debug('Authenticated is true')
        },
        onFalse: () => {
          debug('Authenticated is false')
        },
      },
      onPushPermissions: {
        onTrue: () => {
          debug('Push Permission State is true')
        },
        onFalse: () => {
          debug('Push Permission State is false')
        },
      },
    })
    const authenticated = computed(() => {
      if (!ready.value || !identity) {
        return null
      }
      if (!identity.authenticated.value) {
        return false
      }
      return identity.authenticated.value
    })
    const pushPermissions = computed(() => {
      if (!ready.value || !push) {
        return null
      }
      if (!push.canPush.value && push.canRequestPermission.value) {
        return null
      }
      return push.canPush.value
    })
    const active = computed(() => bus && bus.active.value)
    return {
      booted,
      ready,
      authenticated,
      pushPermissions,
      active,
    }
  },
})
</script>