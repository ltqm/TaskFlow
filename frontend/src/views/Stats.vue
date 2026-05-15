<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useStatsStore } from '@/stores/stats'
import { resolveTaskCategoryLabel } from '@/utils/task-display'
import { startOfWeekMonday, toLocalYMD, parsedIsoToLocalYmd } from '@/utils/calendar-week'
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
import { TrendingUp, Target, Calendar, Award, Timer } from 'lucide-vue-next'
import Card from '@/components/ui/card/Card.vue'
import Button from '@/components/ui/button/Button.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const tasksStore = useTasksStore()
const statsStore = useStatsStore()

const weekdayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const

/** 趋势图是否叠「本机番茄」柱（与计时器 localStorage 一致） */
const showPomodoroOnTrend = ref(true)

/** 环形图：按分类 | 按版本 */
const distributionMode = ref<'category' | 'version'>('category')

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
    const categoryName = resolveTaskCategoryLabel(task, tasksStore.categories)
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

const tasksByVersion = computed(() => {
  const result: Record<string, { total: number; completed: number }> = {}
  tasksStore.tasks.forEach(task => {
    const name =
      task.versionName && task.versionName.trim() ? task.versionName.trim() : '未关联版本'
    if (!result[name]) {
      result[name] = { total: 0, completed: 0 }
    }
    result[name].total++
    if (task.isCompleted) {
      result[name].completed++
    }
  })
  return result
})

const distributionStats = computed(() =>
  distributionMode.value === 'category' ? tasksByCategory.value : tasksByVersion.value
)

/** 本周按本地日、以周一为周首的「新建任务」数（与番茄周对齐） */
const weeklyCreatedByDay = computed(() => {
  const monday = startOfWeekMonday(new Date())
  return weekdayLabels.map((_, i) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    const ymd = toLocalYMD(day)
    return tasksStore.tasks.filter(t => parsedIsoToLocalYmd(t.createdAt) === ymd).length
  })
})

const weeklyNewTasksTotal = computed(() =>
  weeklyCreatedByDay.value.reduce((a, b) => a + b, 0)
)

const chartPalette = computed(() => ({
  primary: resolveToken('--chart-1', '#3b82f6'),
  secondary: resolveToken('--chart-2', '#10b981'),
  third: resolveToken('--chart-3', '#f59e0b'),
  fourth: resolveToken('--chart-4', '#8b5cf6'),
  fifth: resolveToken('--chart-5', '#ec4899'),
  muted: resolveToken('--muted-foreground', '#9ca3af'),
  grid: resolveToken('--border', '#374151')
}))

const barChartData = computed(() => {
  const datasets = [
    {
      label: '新建任务',
      backgroundColor: chartPalette.value.primary,
      borderColor: chartPalette.value.primary,
      borderWidth: 1,
      data: weeklyCreatedByDay.value
    }
  ]
  if (showPomodoroOnTrend.value) {
    datasets.push({
      label: '完成番茄(本机)',
      backgroundColor: chartPalette.value.secondary,
      borderColor: chartPalette.value.secondary,
      borderWidth: 1,
      data: statsStore.weeklyStats.map(d => d.pomodoros)
    })
  }
  return {
    labels: [...weekdayLabels],
    datasets
  }
})

const doughnutChartData = computed(() => {
  const labels = Object.keys(distributionStats.value)
  if (labels.length === 0) {
    return {
      labels: ['暂无数据'],
      datasets: [
        {
          data: [1],
          backgroundColor: [chartPalette.value.muted],
          borderWidth: 0
        }
      ]
    }
  }
  const data = labels.map(label => distributionStats.value[label].total)
  const cycle = [
    chartPalette.value.primary,
    chartPalette.value.secondary,
    chartPalette.value.third,
    chartPalette.value.fourth,
    chartPalette.value.fifth
  ]
  const backgroundColor = labels.map((_, i) => cycle[i % cycle.length])

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
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
      beginAtZero: true,
      ticks: {
        color: chartPalette.value.muted,
        precision: 0
      },
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
      <p class="mt-2 text-muted-foreground">查看任务完成情况；趋势周以「周一至周日」对齐本机番茄记录。</p>
    </div>

    <div
      v-if="tasksStore.tasks.length === 0"
      class="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground"
    >
      当前还没有任务。请先在「任务」中创建任务后，统计与分类分布将基于真实数据展示。
    </div>

    <div class="grid grid-cols-4 gap-6 mb-8">
      <Card class="p-6">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-muted-foreground">完成率</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <TrendingUp class="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ completionRate }}%</div>
        <div class="mt-2 h-2 w-full rounded-full bg-secondary">
          <div
            class="h-2 rounded-full bg-blue-600 transition-all duration-500"
            :style="{ width: `${completionRate}%` }"
          />
        </div>
      </Card>

      <Card class="p-6">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-muted-foreground">本周新增</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
            <Calendar class="h-5 w-5 text-green-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ weeklyNewTasksTotal }}</div>
        <p class="mt-1 text-sm text-muted-foreground">任务（按创建日）</p>
      </Card>

      <Card class="p-6">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-muted-foreground">待完成</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15">
            <Target class="h-5 w-5 text-yellow-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ tasksStore.pendingTasks.length }}</div>
        <p class="mt-1 text-sm text-muted-foreground">任务</p>
      </Card>

      <Card class="p-6">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-muted-foreground">已完成</span>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15">
            <Award class="h-5 w-5 text-purple-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-foreground">{{ tasksStore.completedTasks.length }}</div>
        <p class="mt-1 text-sm text-muted-foreground">任务</p>
      </Card>
    </div>

    <Card class="mb-6 border-border/80 p-4">
      <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div class="flex items-center gap-2">
          <Timer class="h-4 w-4 text-emerald-400" />
          <span>本周本机番茄：<strong class="text-foreground">{{ statsStore.totalWeeklyPomodoros }}</strong> 个</span>
        </div>
        <span class="hidden sm:inline" aria-hidden="true">·</span>
        <span>专注约 {{ statsStore.totalWeeklyMinutes }} 分钟（与首页计时器写入一致）</span>
      </div>
    </Card>

    <div class="grid grid-cols-2 gap-8">
      <Card class="p-6">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-foreground">本周趋势</h3>
            <p class="mt-1 text-xs text-muted-foreground">蓝柱：新建任务；绿柱：本机完成的番茄（可选显示）</p>
          </div>
          <div class="flex shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              :variant="showPomodoroOnTrend ? 'default' : 'outline'"
              @click="showPomodoroOnTrend = true"
            >
              任务+番茄
            </Button>
            <Button
              type="button"
              size="sm"
              :variant="!showPomodoroOnTrend ? 'default' : 'outline'"
              @click="showPomodoroOnTrend = false"
            >
              仅任务
            </Button>
          </div>
        </div>
        <div class="h-64">
          <Bar :data="barChartData" :options="chartOptions" />
        </div>
      </Card>

      <Card class="p-6">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-foreground">任务分布</h3>
            <p class="mt-1 text-xs text-muted-foreground">按分类或按关联版本聚合任务数量</p>
          </div>
          <div class="flex shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              :variant="distributionMode === 'category' ? 'default' : 'outline'"
              @click="distributionMode = 'category'"
            >
              按分类
            </Button>
            <Button
              type="button"
              size="sm"
              :variant="distributionMode === 'version' ? 'default' : 'outline'"
              @click="distributionMode = 'version'"
            >
              按版本
            </Button>
          </div>
        </div>
        <div class="h-64">
          <Doughnut :data="doughnutChartData" :options="doughnutOptions" />
        </div>
      </Card>
    </div>

    <Card class="mt-8 p-6">
      <h3 class="mb-6 text-lg font-semibold text-foreground">
        {{ distributionMode === 'category' ? '分类详情' : '版本详情' }}
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border/80">
              <th class="px-4 py-3 text-left font-medium text-muted-foreground">
                {{ distributionMode === 'category' ? '分类' : '版本' }}
              </th>
              <th class="px-4 py-3 text-center font-medium text-muted-foreground">总数</th>
              <th class="px-4 py-3 text-center font-medium text-muted-foreground">已完成</th>
              <th class="px-4 py-3 text-center font-medium text-muted-foreground">完成率</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(stats, rowKey) in distributionStats"
              :key="rowKey"
              class="border-b border-border/70 transition-colors hover:bg-secondary/45"
            >
              <td class="px-4 py-3 text-foreground">{{ rowKey }}</td>
              <td class="px-4 py-3 text-center text-foreground/85">{{ stats.total }}</td>
              <td class="px-4 py-3 text-center text-green-400">{{ stats.completed }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-3">
                  <div class="h-2 w-24 rounded-full bg-secondary">
                    <div
                      class="h-2 rounded-full bg-green-500"
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
