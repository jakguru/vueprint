<template>
  <v-app>
    <v-app-bar app flat color="primary">
      <v-toolbar-title>VuePrint Nuxt Playground</v-toolbar-title>
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
                <v-list-item title="Application Mounted">
                  <template #prepend>
                    <v-switch
                      :false-value="false"
                      :true-value="true"
                      hide-details
                      readonly
                      :model-value="mounted"
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
                  <template #append>
                    <v-btn v-if="!authenticated" :disabled="disabled" color="secondary" variant="tonal" @click="authenticateVisitor">Authenticate</v-btn>
                    <v-btn v-if="authenticated" :disabled="disabled" color="secondary" variant="tonal" @click="deauthenticateVisitor">Log Out</v-btn>
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
                  <template #append>
                    <v-btn v-if="canRequestPush" :disabled="disabled" color="secondary" variant="tonal" @click="doRequestPush">Permit</v-btn>
                    <v-btn v-if="canPush" :disabled="disabled" color="secondary" variant="tonal" @click="doPushNotification">Push</v-btn>
                  </template>
                </v-list-item>
              </v-list>
              <v-divider />
              <v-card-actions>
                <v-btn :disabled="disabled" color="secondary" variant="tonal" @click="doNotyf">Notyf</v-btn>
                <v-btn :disabled="disabled" color="secondary" variant="tonal" @click="doSwal">Swal</v-btn>
                <v-btn :disabled="disabled" color="secondary" variant="tonal" @click="doToast">Swal Toast</v-btn>
                <v-btn :disabled="disabled" color="secondary" variant="tonal" @click="doSound">Sound</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, computed, inject, onMounted } from 'vue'
import { getDebugger } from '@jakguru/vueprint/utilities/debug'
import type { BusService, IdentityService, PushService, NotyfService, SwalService, ToastService, SoundsService } from '@jakguru/vueprint'
import { useVueprint } from '@jakguru/vueprint/utilities'
import screamMp3 from '@/assets/scream.mp3'
import iconJpg from '@/assets/icon.jpg'
const debug = getDebugger('App')
export default defineComponent({
  name: 'App',
  setup() {
    const bus = inject<BusService>('bus')
    const identity = inject<IdentityService>('identity')
    const push = inject<PushService>('push')
    const notyf = inject<NotyfService>('notyf')
    const swal = inject<SwalService>('swal')
    const toast = inject<ToastService>('toast')
    const sounds = inject<SoundsService>('sounds')
    onMounted(() => {
      if (sounds) {
        sounds.add({ scream: screamMp3 })
      }
    })
    const { mounted, booted, ready } = useVueprint({
      onBooted: {
        onTrue: () => {
          debug('Booted is true')
        },
        onFalse: () => {
          debug('Booted is false')
        },
      },
      onReady: {
        onTrue: () => {
          debug('Ready is true')
        },
        onFalse: () => {
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
      if (!mounted.value || !ready.value || !identity) {
        return null
      }
      if (!identity.authenticated.value) {
        return false
      }
      return identity.authenticated.value
    })
    const pushPermissions = computed(() => {
      if (!mounted.value || !ready.value || !push) {
        return null
      }
      if (!push.canPush.value && push.canRequestPermission.value) {
        return null
      }
      return push.canPush.value
    })
    const canRequestPush = computed(() => {
      if (!mounted.value || !ready.value || !push) {
        return false
      }
      return push.canRequestPermission.value
    })
    const canPush = computed(() => {
      if (!mounted.value || !ready.value || !push) {
        return false
      }
      return push.canPush.value
    })
    const active = computed(() => mounted.value && bus && bus.active.value)
    const disabled = computed(() => !mounted.value || !ready.value || !booted.value || !active.value)
    const authenticateVisitor = () => {
      if (!identity) {
        return
      }
      identity.login('Bearer', '2030-01-01T00:00:00Z', {
        id: 0,
        name: 'Playground User',
        email: 'playground@example.com',
      })
    }
    const deauthenticateVisitor = () => {
      if (!identity) {
        return
      }
      identity.logout()
    }
    const doNotyf = () => {
      if (!notyf) {
        return
      }
      notyf.success('This is a test notyf notification')
    }
    const doSwal = () => {
      if (!swal) {
        return
      }
      swal.fire({
        icon: 'success',
        title: 'This is a test alert',
        text: 'This is a test alert message',
      })
    }
    const doToast = () => {
      if (!toast) {
        return
      }
      toast.fire({
        icon: 'success',
        title: 'This is a test toast',
        text: 'This is a test toast message',
      })
    }
    const doSound = () => {
      if (!sounds) {
        return
      }
      sounds.play('scream')
    }
    const doRequestPush = () => {
      if (!push) {
        return
      }
      push.requestPushPermission()
    }
    const doPushNotification = () => {
      if (!push) {
        return
      }
      push.createWebPushNotification({
        title: 'This is a test push notification',
        body: 'This is a test push notification message',
        icon: iconJpg,
      })
    }
    return {
      mounted,
      booted,
      ready,
      authenticated,
      pushPermissions,
      active,
      disabled,
      authenticateVisitor,
      deauthenticateVisitor,
      doNotyf,
      doSwal,
      doToast,
      doSound,
      canRequestPush,
      doRequestPush,
      canPush,
      doPushNotification,
    }
  },
})
</script>