/**
 * @module @jakguru/vueprint/utilities/files
 */

declare global {
  interface Window {
    showOpenFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle[]>
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>
  }
}

/**
 * Describes the shape of the FilePickerAcceptType object
 */
export interface FilePickerAcceptType {
  // The description of the file type
  description?: string
  // The file extensions that are accepted
  accept: Record<string, string[]>
}

/**
 * Describes the shape of the FilePickerOptions object
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker#options
 */
export interface FilePickerOptions {
  /**
   * A boolean value that defaults to `false`. By default the picker should include an option to not apply any file type filters (instigated with the type option below). Setting this option to true means that option is not available.
   */
  excludeAcceptAllOption?: boolean
  /**
   * By specifying an ID, the browser can remember different directories for different IDs. If the same ID is used for another picker, the picker opens in the same directory.
   */
  id?: string
  /**
   * A boolean value that defaults to false. When set to true multiple files may be selected.
   */
  multiple?: boolean
  /**
   * A FileSystemHandle or a well known directory ("desktop", "documents", "downloads", "music", "pictures", or "videos") to open the dialog in.
   */
  startIn?:
    | FileSystemHandle
    | 'desktop'
    | 'documents'
    | 'downloads'
    | 'music'
    | 'pictures'
    | 'videos'
  /**
   * An Array of allowed file types to pick. Each item is an object with the following options:
   */
  types?: FilePickerAcceptType[]
}

/**
 * Describes the shape of the SaveFilePickerOptions object
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker#options
 */
export interface SaveFilePickerOptions {
  /**
   * A boolean value that defaults to `false`. By default the picker should include an option to not apply any file type filters (instigated with the type option below). Setting this option to true means that option is not available.
   */
  excludeAcceptAllOption?: boolean
  /**
   * By specifying an ID, the browser can remember different directories for different IDs. If the same ID is used for another picker, the picker opens in the same directory.
   */
  id?: string
  /**
   * The suggested name for the file to save.
   */
  suggestedName?: string
  /**
   * An Array of allowed file types to pick. Each item is an object with the following options:
   */
  startIn?:
    | FileSystemHandle
    | 'desktop'
    | 'documents'
    | 'downloads'
    | 'music'
    | 'pictures'
    | 'videos'
  /**
   * An Array of allowed file types to save. Each item is an object with the following options:
   */
  types?: FilePickerAcceptType[]
}

/**
 * The showOpenFilePicker() method shows a file picker that allows a user to select a file or multiple files and returns a handle for the file(s). This function polyfills the missing functionality if the browser does not support `window.showOpenFilePicker()` natively.
 * @param options The options for the file picker
 * @returns A Promise that resolves with an array of FileSystemFileHandle objects
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker
 */
export const showOpenFilePicker = async (
  options?: FilePickerOptions
): Promise<FileSystemFileHandle[]> => {
  if (!window || !document) {
    throw new Error('showOpenFilePicker is only available in browser environments')
  }
  if (window && window.showOpenFilePicker) {
    return await window.showOpenFilePicker(options)
  }

  const opts = Object.assign(
    {},
    {
      excludeAcceptAllOption: false,
      multiple: false,
      types: [] as FilePickerAcceptType[],
    },
    options
  )
  let input: HTMLInputElement | undefined
  const ret = new Promise((resolve) => {
    input = document.createElement('input')
    input.type = 'file'
    input.style.display = 'none'

    // Apply options to the input element
    if (opts.multiple) input.multiple = true
    if (opts.types && opts.types.length) {
      input.accept = opts.types.map((type) => Object.keys(type.accept).join(',')).join(',')
    }
    input.addEventListener('change', (e: Event) => {
      if (!input) {
        return
      }
      if (input.files && input.files.length) {
        const files = Array.from(input.files)
        const handles = files.map((file) => ({
          getFile: () => Promise.resolve(file),
          kind: 'file',
          name: file.name,
        }))
        resolve(handles as FileSystemFileHandle[])
      } else {
        resolve([] as FileSystemFileHandle[])
      }
    })

    input.addEventListener('error', (e: Event) => {
      resolve([] as FileSystemFileHandle[])
    })

    input.addEventListener('cancel', (e: Event) => {
      resolve([] as FileSystemFileHandle[])
    })

    document.body.appendChild(input)
    input.click()
  })
  const res: FileSystemFileHandle[] = (await ret) as FileSystemFileHandle[]
  if (input) {
    document.body.removeChild(input)
  }
  /**
   * Because of iOS quirks (since you can technically upload something from the camera roll), we need to filter out any handles of files which do not match the types specified in the options.
   */
  if (opts.types && opts.types.length) {
    const acceptedExtensions = new Set<string>()
    opts.types.forEach((type) => {
      Object.keys(type.accept).forEach((key) => {
        type.accept[key].forEach((ext) => {
          acceptedExtensions.add(ext)
        })
      })
    })
    return res.filter((handle) => {
      const ext = handle.name.split('.').pop()
      return ext ? acceptedExtensions.has(`.${ext}`) : false
    })
  }
  return res as FileSystemFileHandle[]
}

/**
 * The showSaveFilePicker() method shows a file picker that allows a user to save a file either by selecting an existing file or entering a name for a new file. This function polyfills the missing functionality if the browser does not support `window.showSaveFilePicker()` natively.
 * @param options The options for the file picker
 * @returns A Promise that resolves with a FileSystemFileHandle object that includes a getFile() method to retrieve the Blob.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker
 */
export const showSaveFilePicker = async (options?: SaveFilePickerOptions) => {
  if (!window || !document) {
    throw new Error('showSaveFilePicker is only available in browser environments')
  }
  if (window && window.showSaveFilePicker) {
    return await window.showSaveFilePicker(options)
  }

  const opts = Object.assign(
    {},
    {
      excludeAcceptAllOption: false,
      types: [] as FilePickerAcceptType[],
      suggestedName: 'download',
    },
    options
  )

  const blobParts: Array<any> = []

  return Promise.resolve({
    async createWritable() {
      // Determines the MIME type if specified; otherwise, 'undefined'
      const mimeType =
        opts.types.length > 0 && opts.types[0].accept
          ? Object.keys(opts.types[0].accept)[0]
          : undefined

      // Simulates the FileSystemWritableFileStream
      return {
        async write(content) {
          // Adds new content to the Blob parts array
          blobParts.push(content)
        },
        async close() {
          if (blobParts.length === 0 || !mimeType) {
            throw new PollyfilledFileSystemWritableFileStreamException(
              'No content to save or MIME type is undefined'
            )
          }
          // Creates a Blob and triggers download when the stream is "closed"
          const blob = new Blob(blobParts, { type: mimeType })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = opts.suggestedName
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        },
      }
    },
    kind: 'file',
    name: opts.suggestedName,
    getFile: () => {
      const mimeType =
        opts.types.length > 0 && opts.types[0].accept
          ? Object.keys(opts.types[0].accept)[0]
          : undefined
      if (blobParts.length === 0 || !mimeType) {
        throw new PollyfilledFileSystemWritableFileStreamException(
          'No content to retrieve or MIME type is undefined'
        )
      }
      return Promise.resolve(new Blob(blobParts, { type: mimeType }))
    },
  })
}

/**
 * An exception that is thrown when a file stream is not writable
 */
export class PollyfilledFileSystemWritableFileStreamException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PollyfilledFileSystemWritableFileStreamException'
  }
}
