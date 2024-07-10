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
    <v-menu>
      <template #activator="{ props }">
        <!-- @vue-ignore -->
        <v-fab v-bind="props" color="primary" app icon location="bottom start">
          <v-icon>mdi-plus</v-icon>
        </v-fab>
      </template>
      <div class="d-flex flex-column" style="position: relative;">
        <v-btn size="small" class="mb-3" icon="mdi-file" color="secondary" @click="onAttachFile" />
        <v-btn size="small" class="mb-3" icon="mdi-image-multiple" color="secondary" @click="onAttachVisual" />
        <v-btn size="small" class="mb-3" icon="mdi-headphones" color="secondary" @click="onAttachAudio" />
        <v-btn size="small" class="mb-3" icon="mdi-download" color="secondary" @click="onDownload" />
      </div>
    </v-menu>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, computed, inject } from 'vue'
// @ts-ignore stupid typescript
import { useVueprint, getBootStatuses } from '@jakguru/vueprint/utilities'
// @ts-ignore stupid typescript
import { showOpenFilePicker, showSaveFilePicker } from '@jakguru/vueprint/utilities/files'
// @ts-ignore stupid typescript
import { getDebugger } from '@jakguru/vueprint/utilities/debug'
import type { SwalService, PushService } from '@jakguru/vueprint'

const debug = getDebugger('Playground')

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
    const t = (v: any) => v
    const alert = (t: string, v?: string) => {
      if (swal) {
        swal.fire({
          title: t,
          text: v,
        })
      }
    }

    const onFileUploadSuccess = (files: File[]) => {
      console.log(files)
      if (swal) {
        swal.fire({
          icon: 'success',
          title: 'Files Uploaded',
          text: files.map((f) => f.name).join(', '),
        })
      }
    }

    const onAttachFile = async () => {
      if (!window) {
        console.error(t("errors.attach.window"));
        return;
      }
      if (!showOpenFilePicker) {
        if (alert) {
          alert(
            "errors.attach.filepicker.title",
            "errors.attach.filepicker.text",
          );
        } else {
          window.alert(t("errors.attach.filepicker.title"));
        }
        return;
      }
      const handleIdFull = `-attachment-file`;
      const handleIdSub = handleIdFull.substring(0, 32);
      let handles: FileSystemFileHandle[] | undefined;
      try {
        handles = await showOpenFilePicker({
          excludeAcceptAllOption: true,
          id: handleIdSub,
          multiple: true,
          startIn: "documents",
          types: [
            {
              description: t("malarkeyChat.attachments.file"),
              accept: {
                "image/bmp": [".bmp"],
                "image/tiff": [".tif", ".tiff"],
                "text/vcard": [".vcf"],
                "text/x-vcard": [".vcf"],
                "text/csv": [".csv"],
                "text/rtf": [".rtf"],
                "text/richtext": [".rtx"],
                "text/calendar": [".ics"],
                "text/directory": [], // usually no specific file extension
                "application/pdf": [".pdf"],
                "application/vcard": [".vcf"],
                "application/vnd.apple.pkpass": [".pkpass"],
                "application/msword": [".doc"],
                "application/vnd.ms-excel": [".xls"],
                "application/vnd.ms-powerpoint": [".ppt"],
                "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                  [".pptx"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  [".xlsx"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
              },
            },
          ],
        });
      } catch (e) {
        debug("Failed to open file picker dialog", e);
        return;
      }
      if (!handles || handles.length === 0) {
        return;
      }
      const files = await Promise.all(
        handles.map(async (h) => {
          return h.getFile();
        }),
      );
      onFileUploadSuccess(files)
    };
    const onAttachVisual = async () => {
      if (!window) {
        console.error(t("errors.attach.window"));
        return;
      }
      if (!showOpenFilePicker) {
        if (alert) {
          alert(
            "errors.attach.filepicker.title",
            "errors.attach.filepicker.text",
          );
        } else {
          window.alert(t("errors.attach.filepicker.title"));
        }
        return;
      }
      const handleIdFull = `-attachment-visual`;
      const handleIdSub = handleIdFull.substring(0, 32);
      let handles: FileSystemFileHandle[] | undefined;
      try {
        handles = await showOpenFilePicker({
          excludeAcceptAllOption: true,
          id: handleIdSub,
          multiple: true,
          startIn: "pictures",
          types: [
            {
              description: t("malarkeyChat.attachments.visual"),
              accept: {
                "image/png": [".png"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/gif": [".gif"],
                "video/mpeg": [".mpg", ".mpeg"],
                "video/mp4": [".mp4"],
                "video/quicktime": [".mov"],
                "video/webm": [".webm"],
                "video/3gpp": [".3gp"],
                "video/3gpp2": [".3g2"],
                "video/3gpp-tt": [],
                "video/H261": [".h261"],
                "video/H263": [".h263"],
                "video/H263-1998": [],
                "video/H263-2000": [],
                "video/H264": [".h264"],
              },
            },
          ],
        });
      } catch (e) {
        debug("Failed to open file picker dialog", e);
        return;
      }
      if (!handles || handles.length === 0) {
        return;
      }
      const files = await Promise.all(
        handles.map(async (h) => {
          return h.getFile();
        }),
      );
      onFileUploadSuccess(files)
    };
    const onAttachAudio = async () => {
      if (!window) {
        console.error(t("errors.attach.window"));
        return;
      }
      if (!showOpenFilePicker) {
        if (alert) {
          alert(
            "errors.attach.filepicker.title",
            "errors.attach.filepicker.text",
          );
        } else {
          window.alert(t("errors.attach.filepicker.title"));
        }
        return;
      }
      const handleIdFull = `-attachment-audio`;
      const handleIdSub = handleIdFull.substring(0, 32);
      let handles: FileSystemFileHandle[] | undefined;
      try {
        handles = await showOpenFilePicker({
          excludeAcceptAllOption: true,
          id: handleIdSub,
          multiple: true,
          startIn: "music",
          types: [
            {
              description: t("malarkeyChat.attachments.audio"),
              accept: {
                "audio/basic": [".au", ".snd"],
                "audio/L24": [".l24"],
                "audio/mp4": [".mp4"],
                "audio/mpeg": [".mp3"],
                "audio/vnd.rn-realaudio": [".ra"],
                "audio/vnd.wave": [".wav"],
                "audio/3gpp": [".3gp"],
                "audio/3gpp2": [".3g2"],
                "audio/ac3": [".ac3"],
                "audio/webm": [".webm"],
                "audio/amr-nb": [".amr"],
                "audio/amr": [".amr"],
                "audio/aac": [".aac"],
                "audio/ogg": [".opus", ".ogg"],
              },
            },
          ],
        });
      } catch (e) {
        debug("Failed to open file picker dialog", e);
        return;
      }
      if (!handles || handles.length === 0) {
        return;
      }
      const files = await Promise.all(
        handles.map(async (h) => {
          return h.getFile();
        }),
      );
      onFileUploadSuccess(files)
    };

    const onDownload = async () => {
      let fileHandle: FileSystemFileHandle;
      try {
        fileHandle = await showSaveFilePicker({
          suggestedName: 'example.txt',
          types: [
            {
              description: 'Text Files',
              accept: {
                'text/plain': ['.txt'],
              },
            },
          ],
        });
      } catch (error) {
        debug("showSaveFilePicker error", error);
        return;
      }
      let writable: FileSystemWritableFileStream;
      try {
        writable = await fileHandle.createWritable();
      } catch (error) {
        debug("createWritable error", error);
        return;
      }
      try {
        await writable.write(new Blob(['Hello, world!']));
      } catch (error) {
        debug("write error", error);
        return;
      }
      try {
        await writable.close();
      } catch (error) {
        debug("close error", error);
        return;
      }
    }

    return { mounted, booted, ready, complete, updateable, doUpdate, onReadyOrCompleteClick, canRequestPush, doOnRequestPush, canPush, onAttachFile, onAttachVisual, onAttachAudio, onDownload }
  },
})
</script>
