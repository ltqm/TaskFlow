import { reactive } from 'vue'

type ConfirmResolver = (value: boolean) => void

interface ConfirmState {
  open: boolean
  title: string
  description: string
  confirmText: string
  cancelText: string
  resolver: ConfirmResolver | null
}

const state = reactive<ConfirmState>({
  open: false,
  title: '',
  description: '',
  confirmText: '确认',
  cancelText: '取消',
  resolver: null
})

export function useConfirm() {
  function confirm(options: {
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
  }) {
    state.title = options.title
    state.description = options.description ?? ''
    state.confirmText = options.confirmText ?? '确认'
    state.cancelText = options.cancelText ?? '取消'
    state.open = true

    return new Promise<boolean>((resolve) => {
      state.resolver = resolve
    })
  }

  function resolve(value: boolean) {
    state.open = false
    const resolver = state.resolver
    state.resolver = null
    resolver?.(value)
  }

  return {
    state,
    confirm,
    resolve
  }
}
