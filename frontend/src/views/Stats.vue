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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const tasksStore = useTasksStore()

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
    const categoryName = task.categoryName || '未分类'
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

const barChartData = {
  labels: weeklyData.value.labels,
  datasets: [
    {
      label: '创建任务数',
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
      data: weeklyData.value.data
    }
  ]
}

const doughnutChartData = computed(() => {
  const labels = Object.keys(tasksByCategory.value)
  const data = labels.map(label => tasksByCategory.value[label].total)
  
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#9CA3AF',
        padding: 20
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#9CA3AF' },
      grid: { color: '#374151' }
    },
    y: {
      ticks: { color: '#9CA3AF' },
      grid: { color: '#374151' }
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#9CA3AF',
        padding: 20
      }
    }
  }
}
</script>

<template>
  <div class="ml-64 p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">统计分析</h1>
      <p class="text-gray-400 mt-2">查看你的任务完成情况</p>
    </div>

    <div class="grid grid-cols-4 gap-6 mb-8">
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">完成率</span>
          <div class="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <TrendingUp class="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-white">{{ completionRate }}%</div>
        <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-500"
            :style="{ width: `${completionRate}%` }"
          />
        </div>
      </div>

      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">本周新增</span>
          <div class="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
            <Calendar class="w-5 h-5 text-green-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-white">{{ weeklyData.data.reduce((a, b) => a + b, 0) }}</div>
        <p class="text-gray-500 text-sm mt-1">任务</p>
      </div>

      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">待完成</span>
          <div class="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
            <Target class="w-5 h-5 text-yellow-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-white">{{ tasksStore.pendingTasks.length }}</div>
        <p class="text-gray-500 text-sm mt-1">任务</p>
      </div>

      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <span class="text-gray-400">已完成</span>
          <div class="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <Award class="w-5 h-5 text-purple-500" />
          </div>
        </div>
        <div class="text-3xl font-bold text-white">{{ tasksStore.completedTasks.length }}</div>
        <p class="text-gray-500 text-sm mt-1">任务</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-8">
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 class="text-lg font-semibold text-white mb-6">本周任务趋势</h3>
        <div class="h-64">
          <Bar :data="barChartData" :options="chartOptions" />
        </div>
      </div>

      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 class="text-lg font-semibold text-white mb-6">任务分类分布</h3>
        <div class="h-64">
          <Doughnut :data="doughnutChartData" :options="doughnutOptions" />
        </div>
      </div>
    </div>

    <div class="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 class="text-lg font-semibold text-white mb-6">分类详情</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="text-left py-3 px-4 text-gray-400 font-medium">分类</th>
              <th class="text-center py-3 px-4 text-gray-400 font-medium">总数</th>
              <th class="text-center py-3 px-4 text-gray-400 font-medium">已完成</th>
              <th class="text-center py-3 px-4 text-gray-400 font-medium">完成率</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(stats, category) in tasksByCategory" 
              :key="category"
              class="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
            >
              <td class="py-3 px-4 text-white">{{ category }}</td>
              <td class="py-3 px-4 text-center text-gray-300">{{ stats.total }}</td>
              <td class="py-3 px-4 text-center text-green-400">{{ stats.completed }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-center gap-3">
                  <div class="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      class="bg-green-500 h-2 rounded-full"
                      :style="{ width: stats.total ? `${(stats.completed / stats.total) * 100}%` : '0%' }"
                    />
                  </div>
                  <span class="text-gray-400 text-sm">
                    {{ stats.total ? Math.round((stats.completed / stats.total) * 100) : 0 }}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>