Page({
  data: {
    topic: '',
    questionCount: 5,
    difficulty: 'medium',
    questionCountOptions: [
      { label: '5题', value: 5 },
      { label: '10题', value: 10 },
      { label: '15题', value: 15 }
    ],
    difficultyOptions: [
      { label: '简单', value: 'easy' },
      { label: '中等', value: 'medium' },
      { label: '困难', value: 'hard' }
    ],
    hotTopics: [
      { name: 'Python编程', icon: '🐍' },
      { name: '中国历史', icon: '🏯' },
      { name: '地理知识', icon: '🌍' },
      { name: '英语词汇', icon: '📖' },
      { name: '科学常识', icon: '🔬' },
      { name: '数学思维', icon: '🧮' }
    ]
  },

  onTopicInput(e: any) {
    this.setData({
      topic: e.detail.value
    })
  },

  setQuestionCount(e: any) {
    this.setData({
      questionCount: Number(e.currentTarget.dataset.value)
    })
  },

  setDifficulty(e: any) {
    this.setData({
      difficulty: e.currentTarget.dataset.value
    })
  },

  selectHotTopic(e: any) {
    this.setData({
      topic: e.currentTarget.dataset.topic
    })
  },

  startQuiz() {
    const { topic, questionCount, difficulty } = this.data
    
    if (!topic.trim()) {
      wx.showToast({
        title: '请输入学习主题',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/quiz/quiz?topic=${encodeURIComponent(topic)}&count=${questionCount}&difficulty=${difficulty}`
    })
  }
})