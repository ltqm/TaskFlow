import { QuizQuestion, generateQuiz } from '../../services/aiQuiz'

Page({
  data: {
    topic: '',
    questions: [] as QuizQuestion[],
    currentIndex: 0,
    selectedAnswer: null as number | null,
    showResult: false,
    score: 0,
    progress: 0
  },

  onLoad(options: any) {
    const topic = decodeURIComponent(options.topic || '学习主题')
    const count = Number(options.count) || 5
    const difficulty = options.difficulty || 'medium'

    this.setData({ topic })
    this.generateQuestions(topic, count, difficulty)
  },

  generateQuestions(topic: string, count: number, difficulty: string) {
    const questions = generateQuiz(topic, count, difficulty)
    this.setData({ questions })
  },

  get currentQuestion() {
    return this.data.questions[this.data.currentIndex]
  },

  get isCorrect() {
    return this.data.selectedAnswer === this.currentQuestion?.correctIndex
  },

  selectOption(e: any) {
    if (this.data.showResult) return
    
    this.setData({
      selectedAnswer: e.currentTarget.dataset.index
    })
  },

  getOptionClass(index: number) {
    if (!this.data.showResult) {
      return this.data.selectedAnswer === index ? 'selected' : ''
    }
    
    if (index === this.currentQuestion?.correctIndex) {
      return 'correct'
    }
    
    if (this.data.selectedAnswer === index) {
      return 'wrong'
    }
    
    return ''
  },

  getOptionLetter(index: number) {
    return String.fromCharCode(65 + index)
  },

  confirmAnswer() {
    if (this.data.selectedAnswer === null) return

    this.setData({ showResult: true })

    if (this.isCorrect) {
      this.setData({ score: this.data.score + 10 })
    }
  },

  nextQuestion() {
    if (this.data.currentIndex < this.data.questions.length - 1) {
      this.setData({
        currentIndex: this.data.currentIndex + 1,
        selectedAnswer: null,
        showResult: false,
        progress: ((this.data.currentIndex + 2) / this.data.questions.length) * 100
      })
    } else {
      this.showResult()
    }
  },

  showResult() {
    const { score, questions, topic } = this.data
    const totalScore = questions.length * 10
    
    wx.redirectTo({
      url: `/pages/result/result?score=${score}&total=${totalScore}&count=${questions.length}&topic=${encodeURIComponent(topic)}`
    })
  }
})