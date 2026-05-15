import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Version, Task } from '@/types'
import { getVersions, createVersion, updateVersion, deleteVersion, getVersionById } from '@/services/api'

export const useVersionsStore = defineStore('versions', () => {
  const versions = ref<Version[]>([])
  const loading = ref(false)
  const selectedVersion = ref<Version | null>(null)
  const versionTasks = ref<Task[]>([])

  async function fetchVersions() {
    loading.value = true
    try {
      versions.value = await getVersions()
    } catch (error) {
      console.error('Failed to fetch versions:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addVersion(name: string, description: string, releaseDate: string) {
    try {
      const newVersion = await createVersion(name, description, releaseDate)
      versions.value.unshift(newVersion)
    } catch (error) {
      console.error('Failed to create version:', error)
      throw error
    }
  }

  async function updateVersionById(id: string, name: string, description: string, releaseDate: string) {
    try {
      const updatedVersion = await updateVersion(id, name, description, releaseDate)
      const index = versions.value.findIndex(v => v.id === id)
      if (index !== -1) {
        versions.value[index] = updatedVersion
      }
    } catch (error) {
      console.error('Failed to update version:', error)
      throw error
    }
  }

  async function deleteVersionById(id: string) {
    try {
      await deleteVersion(id)
      versions.value = versions.value.filter(v => v.id !== id)
      if (selectedVersion.value?.id === id) {
        selectedVersion.value = null
        versionTasks.value = []
      }
    } catch (error) {
      console.error('Failed to delete version:', error)
      throw error
    }
  }

  async function selectVersion(version: Version) {
    selectedVersion.value = version
    loading.value = true
    try {
      const data = await getVersionById(version.id)
      versionTasks.value = data.tasks || []
    } catch (error) {
      console.error('Failed to fetch version tasks:', error)
      versionTasks.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  function clearSelection() {
    selectedVersion.value = null
    versionTasks.value = []
  }

  /** 用最新任务对象替换当前版本任务列表中的对应项（保持详情与列表一致） */
  function mergeTaskIntoVersionList(task: Task) {
    const index = versionTasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      versionTasks.value[index] = task
    }
  }

  const pendingVersionTasks = computed(() => versionTasks.value.filter(t => !t.isCompleted))
  const completedVersionTasks = computed(() => versionTasks.value.filter(t => t.isCompleted))

  return {
    versions,
    loading,
    selectedVersion,
    versionTasks,
    pendingVersionTasks,
    completedVersionTasks,
    fetchVersions,
    addVersion,
    updateVersionById,
    deleteVersionById,
    selectVersion,
    clearSelection,
    mergeTaskIntoVersionList
  }
})