Page({
  data: {
    score: 0,
    total: 0,
    count: 0,
    topic: '',
    accuracy: 0,
    correctCount: 0,
    wrongCount: 0,
    grade: '',
    resultIcon: '',
    resultTitle: '',
    encourageMessage: '',
    tips: [] as string[]
  },

  onLoad(options: any) {
    const score = Number(options.score) || 0
    const total = Number(options.total) || 100
    const count = Number(options.count) || 5
    const topic = decodeURIComponent(options.topic || '')

    const accuracy = Math.round((score / total) * 100)
    const correctCount = Math.round(score / 10)
    const wrongCount = count - correctCount

    this.setData({
      score,
      total,
      count,
      topic,
      accuracy,
      correctCount,
      wrongCount,
      grade: this.getGrade(accuracy),
      resultIcon: this.getResultIcon(accuracy),
      resultTitle: this.getResultTitle(accuracy),
      encourageMessage: this.getEncourageMessage(accuracy),
      tips: this.generateTips(accuracy)
    })
  },

  getGrade(accuracy: number) {
    if (accuracy >= 90) return 'S'
    if (accuracy >= 80) return 'A'
    if (accuracy >= 70) return 'B'
    if (accuracy >= 60) return 'C'
    return 'D'
  },

  getResultIcon(accuracy: number) {
    if (accuracy >= 90) return '🏆'
    if (accuracy >= 80) return '🌟'
    if (accuracy >= 70) return '👍'
    if (accuracy >= 60) return '💪'
    return '📚'
  },

  getResultTitle(accuracy: number) {
    if (accuracy >= 90) return '太棒了！你是学习英雄！'
    if (accuracy >= 80) return '优秀！继续保持！'
    if (accuracy >= 70) return '不错！还可以更好！'
    if (accuracy >= 60) return '及格了！继续加油！'
    return '别灰心，多多练习！'
  },

  getEncourageMessage(accuracy: number) {
    if (accuracy >= 90) return '你的知识掌握得非常扎实，继续保持这种学习热情！'
    if (accuracy >= 80) return '表现出色！再巩固一下细节会更完美！'
    if (accuracy >= 70) return '基础不错，多复习错题会有更大进步！'
    if (accuracy >= 60) return '刚刚及格，多加练习一定能突破！'
    return '学习是一个过程，坚持下去你会越来越棒！'
  },

  generateTips(accuracy: number) {
    const tips: string[] = []
    
    if (accuracy < 80) {
      tips.push('建议回顾错题，重点理解错误原因')
      tips.push('可以尝试将知识整理成思维导图')
    }
    
    if (accuracy < 60) {
      tips.push('建议重新学习基础概念，循序渐进')
      tips.push('分阶段学习，每次专注一个知识点')
    }
    
    tips.push('定期复习是巩固知识的关键')
    tips.push('尝试用自己的话解释学到的知识')
    
    return tips.slice(0, 4)
  },

  restartQuiz() {
    wx.navigateBack({
      delta: 2
    })
  },

  goHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})