<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm'
import Button from '@/components/ui/button/Button.vue'

const { state, resolve } = useConfirm()
</script>

<template>
  <Teleport to="body">
    <div v-if="state.open" class="z-overlay-confirm fixed inset-0 flex items-center justify-center bg-black/82 px-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-xl border border-border/95 bg-card p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)]">
        <h3 class="text-lg font-semibold text-card-foreground">{{ state.title }}</h3>
        <p v-if="state.description" class="mt-2 text-sm text-muted-foreground">{{ state.description }}</p>
        <div class="mt-6 flex justify-end gap-3">
          <Button variant="outline" @click="resolve(false)">{{ state.cancelText }}</Button>
          <Button variant="destructive" @click="resolve(true)">{{ state.confirmText }}</Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
