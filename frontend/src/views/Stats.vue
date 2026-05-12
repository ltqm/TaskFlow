<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { TrendingUp, Target, Calendar, Award } from 'lucide-vue-next'
import Card from '@/components/ui/card/Card.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const tasksStore = useTasksStore()

function resolveToken(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value ? `hsl(${value})` : fallback
}

const completionRate = computed(() => {
  const total = tasksStore.tasks.length
  if (total === 0) return 0
  return Math.round((tasksStore.completedTasks.length / total) * 100)
})

const tasksByCategory = computed(() => {
  const result: Record<string, { total: number; completed: number }> = {}
  
  tasksStore.categories.forEach(cat => {
    result[cat.name] = { total: 0, completed: 0 }
  })
  
  tasksStore.tasks.forEach(task => {
    const categoryName = task.category || '未分类'
    if (!result[categoryName]) {
      result[categoryName] = { total: 0, completed: 0 }
    }
    result[categoryName].total++
    if (task.isCompleted) {
      result[categoryName].completed++
    }
  })
  
  return result
})

const weeklyData = computed(() => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1)
  
  const data = days.map((_, index) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + index)
    const dateStr = date.toISOString().split('T')[0]
    return tasksStore.tasks.filter(t => t.createdAt.startsWith(dateStr)).length
  })
  
  return { labels: days, data }
})

const chartPalette = computed(() => ({
  primary: resolveToken('--chart-1', '#3b82f6'),
  secondary: resolveToken('--chart-2', '#10b981'),
  third: resolveToken('--chart-3', '#f59e0b'),
  fourth: resolveToken('--chart-4', '#8b5cf6'),
  fifth: resolveToken('--chart-5', '#ec4899'),
  muted: resolveToken('--muted-foreground', '#9ca3af'),
  grid: resolveToken('--border', '#374151')
}))

const barChartData = computed(() => ({
  labels: weeklyData.value.labels,
  datasets: [
    {
      label: '创建任务数',
      backgroundColor: chartPalette.value.primary,
      borderColor: chartPalette.value.primary,
      borderWidth: 1,
      data: weeklyData.value.data
    }
  ]
}))

const doughnutChartData = computed(() => {
  const labels = Object.keys(tasksByCategory.value)
  const data = labels.map(label => tasksByCategory.value[label].total)
  
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          chartPalette.value.primary,
          chartPalette.value.secondary,
          chartPalette.value.third,
          chartPalette.value.fourth,
          chartPalette.value.fifth,
          chartPalette.value.secondary
        ],
        borderWidth: 0
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: chartPalette.value.muted,
        padding: 20
      }
    }
  },
  scales: {
    x: {
      ticks: { color: chartPalette.value.muted },
      grid: { color: chartPalette.value.grid }
    },
    y: {
      ticks: { color: chartPalette.value.muted },
      grid: { color: chartPalette.value.grid }
    }
  }
}))

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: chartPalette.value.muted,
        padding: 20
      }
    }
  }
}))
</script>

<template>
  <div class="ml-64 min-h-screen bg-background p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">统计分析</h1>
      <p class="mt-2 text-muted-foreground">查看你的任务完成情况</p>
    </div>

    <div class="grid grid-cols-4 gap-6 mb-8">
      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-muted-foreground">完成率</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <TrendingUp class="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ completionRate }}%</div>
        <div class="mt-2 h-2 w-full rounded-full bg-secondary">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-500"
            :style="{ width: `${completionRate}%` }"
          />
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-muted-foreground">本周新增</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
            <Calendar class="w-5 h-5 text-green-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ weeklyData.data.reduce((a, b) => a + b, 0) }}</div>
        <p class="mt-1 text-sm text-muted-foreground">任务</p>
      </Card>

      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-muted-foreground">待完成</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15">
            <Target class="w-5 h-5 text-yellow-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ tasksStore.pendingTasks.length }}</div>
        <p class="mt-1 text-sm text-muted-foreground">任务</p>
      </Card>

      <Card class="p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-muted-foreground">已完成</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15">
            <Award class="w-5 h-5 text-purple-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ tasksStore.completedTasks.length }}</div>
        <p class="mt-1 text-sm text-muted-foreground">任务</p>
      </Card>
    </div>

    <div class="grid grid-cols-2 gap-8">
      <Card class="p-6">
        <h3 class="mb-6 text-lg font-semibold text-foreground">本周任务趋势</h3>
        <div class="h-64">
          <Bar :data="barChartData" :options="chartOptions" />
        </div>
      </Card>

      <Card class="p-6">
        <h3 class="mb-6 text-lg font-semibold text-foreground">任务分类分布</h3>
        <div class="h-64">
          <Doughnut :data="doughnutChartData" :options="doughnutOptions" />
        </div>
      </Card>
    </div>

    <Card class="mt-8 p-6">
      <h3 class="mb-6 text-lg font-semibold text-foreground">分类详情</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border/80">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">分类</th>
              <th class="px-4 py-3 text-center font-medium text-muted-foreground">总数</th>
              <th class="px-4 py-3 text-center font-medium text-muted-foreground">已完成</th>
              <th class="px-4 py-3 text-center font-medium text-muted-foreground">完成率</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(stats, category) in tasksByCategory" 
              :key="category"
              class="border-b border-border/70 transition-colors hover:bg-secondary/45"
            >
              <td class="px-4 py-3 text-foreground">{{ category }}</td>
              <td class="px-4 py-3 text-center text-foreground/85">{{ stats.total }}</td>
              <td class="py-3 px-4 text-center text-green-400">{{ stats.completed }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-center gap-3">
                  <div class="h-2 w-24 rounded-full bg-secondary">
                    <div 
                      class="bg-green-500 h-2 rounded-full"
                      :style="{ width: stats.total ? `${(stats.completed / stats.total) * 100}%` : '0%' }"
                    />
                  </div>
                  <span class="text-sm text-muted-foreground">
                    {{ stats.total ? Math.round((stats.completed / stats.total) * 100) : 0 }}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>