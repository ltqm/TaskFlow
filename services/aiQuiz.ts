export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const pythonQuestions: QuizQuestion[] = [
  {
    question: 'Python中，以下哪个关键字用于定义函数？',
    options: ['func', 'def', 'function', 'define'],
    correctIndex: 1,
    explanation: '在Python中，使用def关键字来定义函数，这是Python的标准语法。'
  },
  {
    question: 'Python列表的索引从哪个数字开始？',
    options: ['1', '0', '-1', '任意'],
    correctIndex: 1,
    explanation: 'Python和大多数编程语言一样，列表索引从0开始，这是计算机科学的常见约定。'
  },
  {
    question: '以下哪个不是Python的基本数据类型？',
    options: ['int', 'float', 'string', 'array'],
    correctIndex: 3,
    explanation: 'array不是Python的基本数据类型。Python的基本数据类型包括int、float、str、bool、list、dict、tuple等。'
  },
  {
    question: 'Python中，if语句的条件表达式应该返回什么类型的值？',
    options: ['字符串', '数字', '布尔值', '列表'],
    correctIndex: 2,
    explanation: 'if语句的条件表达式必须返回布尔值(True或False)，Python会根据这个值来决定是否执行if块中的代码。'
  },
  {
    question: '以下哪个方法可以向列表末尾添加元素？',
    options: ['add()', 'append()', 'insert()', 'push()'],
    correctIndex: 1,
    explanation: 'append()方法用于在列表末尾添加一个元素。insert()可以在指定位置插入元素，而push()不是Python列表的方法。'
  },
  {
    question: 'Python中的缩进有什么作用？',
    options: ['美化代码', '定义代码块', '注释代码', '声明变量'],
    correctIndex: 1,
    explanation: '在Python中，缩进不仅仅是美观问题，它用来定义代码块（如函数、循环、条件语句的体）。'
  },
  {
    question: '以下哪个运算符用于判断两个对象是否相等？',
    options: ['=', '==', '===', 'equals'],
    correctIndex: 1,
    explanation: '在Python中，==用于比较两个对象的值是否相等。=是赋值运算符，===不是Python的运算符。'
  },
  {
    question: 'Python中，range(5)会生成哪些数字？',
    options: ['1到5', '0到5', '0到4', '1到4'],
    correctIndex: 2,
    explanation: 'range(n)生成从0开始到n-1的整数序列，所以range(5)生成0,1,2,3,4。'
  }
]

const historyQuestions: QuizQuestion[] = [
  {
    question: '中国历史上第一个统一的封建王朝是？',
    options: ['夏朝', '商朝', '周朝', '秦朝'],
    correctIndex: 3,
    explanation: '秦朝是中国历史上第一个统一的封建王朝，由秦始皇于公元前221年建立。'
  },
  {
    question: '长城最初是为了抵御哪个民族的入侵而建造的？',
    options: ['匈奴', '蒙古', '女真', '契丹'],
    correctIndex: 0,
    explanation: '长城最初是为了抵御北方游牧民族匈奴的入侵而建造的，始建于春秋战国时期。'
  },
  {
    question: '四大发明不包括以下哪一项？',
    options: ['造纸术', '印刷术', '蒸汽机', '火药'],
    correctIndex: 2,
    explanation: '中国古代四大发明是造纸术、印刷术、火药和指南针。蒸汽机是英国工业革命时期的发明。'
  },
  {
    question: '唐朝的开国皇帝是谁？',
    options: ['李渊', '李世民', '李隆基', '李治'],
    correctIndex: 0,
    explanation: '唐朝的开国皇帝是唐高祖李渊，他在公元618年建立了唐朝。'
  },
  {
    question: '《史记》的作者是谁？',
    options: ['孔子', '司马迁', '班固', '司马光'],
    correctIndex: 1,
    explanation: '《史记》是中国第一部纪传体通史，作者是西汉时期的史学家司马迁。'
  },
  {
    question: '郑和下西洋发生在哪个朝代？',
    options: ['宋朝', '元朝', '明朝', '清朝'],
    correctIndex: 2,
    explanation: '郑和下西洋发生在明朝永乐年间，是中国古代规模最大的海上远航活动。'
  },
  {
    question: '鸦片战争发生在哪一年？',
    options: ['1839年', '1840年', '1842年', '1856年'],
    correctIndex: 1,
    explanation: '第一次鸦片战争发生在1840年，是中国近代史的开端。'
  },
  {
    question: '秦始皇统一六国后，统一使用的文字是？',
    options: ['甲骨文', '金文', '小篆', '隶书'],
    correctIndex: 2,
    explanation: '秦始皇统一六国后，推行书同文政策，将小篆作为全国统一的文字。'
  }
]

const geographyQuestions: QuizQuestion[] = [
  {
    question: '世界上最大的海洋是？',
    options: ['大西洋', '印度洋', '太平洋', '北冰洋'],
    correctIndex: 2,
    explanation: '太平洋是世界上最大的海洋，面积约1.65亿平方公里，占地球表面积的三分之一。'
  },
  {
    question: '中国面积最大的省级行政区是？',
    options: ['西藏', '新疆', '内蒙古', '青海'],
    correctIndex: 1,
    explanation: '新疆维吾尔自治区是中国面积最大的省级行政区，面积约166万平方公里。'
  },
  {
    question: '世界上最长的河流是？',
    options: ['长江', '亚马逊河', '尼罗河', '密西西比河'],
    correctIndex: 2,
    explanation: '尼罗河全长约6670公里，是世界上最长的河流，流经非洲11个国家。'
  },
  {
    question: '地球的赤道周长大约是多少公里？',
    options: ['20000', '30000', '40000', '50000'],
    correctIndex: 2,
    explanation: '地球的赤道周长约为40075公里，这是通过科学测量得出的近似值。'
  },
  {
    question: '以下哪个国家不在欧洲？',
    options: ['法国', '德国', '巴西', '意大利'],
    correctIndex: 2,
    explanation: '巴西位于南美洲，是南美洲最大的国家。法国、德国、意大利都是欧洲国家。'
  },
  {
    question: '中国的首都是？',
    options: ['上海', '北京', '广州', '深圳'],
    correctIndex: 1,
    explanation: '北京是中华人民共和国的首都，是中国的政治、文化中心。'
  },
  {
    question: '世界上最高的山峰是？',
    options: ['乔戈里峰', '珠穆朗玛峰', '干城章嘉峰', '洛子峰'],
    correctIndex: 1,
    explanation: '珠穆朗玛峰海拔8848.86米，是世界上最高的山峰，位于中国和尼泊尔边界。'
  },
  {
    question: '以下哪个是中国的内海？',
    options: ['东海', '南海', '渤海', '黄海'],
    correctIndex: 2,
    explanation: '渤海是中国的内海，被辽东半岛和山东半岛环抱，是中国最北的近海。'
  }
]

const englishQuestions: QuizQuestion[] = [
  {
    question: '"Hello"的中文意思是？',
    options: ['再见', '你好', '谢谢', '对不起'],
    correctIndex: 1,
    explanation: 'Hello是英语中最常用的问候语，意思是"你好"。'
  },
  {
    question: '以下哪个单词是"书"的意思？',
    options: ['book', 'pen', 'desk', 'chair'],
    correctIndex: 0,
    explanation: 'book在英语中意思是"书"，pen是笔，desk是桌子，chair是椅子。'
  },
  {
    question: '"I love you"翻译成中文是？',
    options: ['我恨你', '我喜欢你', '我爱你', '我想念你'],
    correctIndex: 2,
    explanation: 'I love you是表达爱意的常用句子，意思是"我爱你"。'
  },
  {
    question: '以下哪个是正确的英语字母顺序？',
    options: ['A, B, C', 'A, C, B', 'B, A, C', 'C, B, A'],
    correctIndex: 0,
    explanation: '英语字母表的顺序是A, B, C, D...这是基础的英语知识。'
  },
  {
    question: '"Apple"是什么水果？',
    options: ['香蕉', '苹果', '橙子', '葡萄'],
    correctIndex: 1,
    explanation: 'Apple在英语中是"苹果"的意思，这是最常见的水果词汇之一。'
  },
  {
    question: '以下哪个是动词？',
    options: ['beautiful', 'run', 'happy', 'book'],
    correctIndex: 1,
    explanation: 'run是动词，意思是"跑"。beautiful和happy是形容词，book可以是名词或动词，但这里作为名词更常见。'
  },
  {
    question: '"Water"的中文意思是？',
    options: ['火', '水', '土', '风'],
    correctIndex: 1,
    explanation: 'Water在英语中意思是"水"，是基础的自然元素词汇。'
  },
  {
    question: '以下哪个是正确的复数形式？',
    options: ['cat -> catss', 'dog -> dogs', 'book -> bookes', 'pen -> penes'],
    correctIndex: 1,
    explanation: '英语中大多数名词变复数直接加s，dog的复数是dogs。'
  }
]

const scienceQuestions: QuizQuestion[] = [
  {
    question: '水的化学式是？',
    options: ['CO2', 'H2O', 'NaCl', 'O2'],
    correctIndex: 1,
    explanation: '水的化学式是H2O，表示一个水分子由两个氢原子和一个氧原子组成。'
  },
  {
    question: '地球围绕太阳公转一周需要多长时间？',
    options: ['一天', '一个月', '一年', '一百年'],
    correctIndex: 2,
    explanation: '地球围绕太阳公转一周需要约365.25天，也就是一年的时间。'
  },
  {
    question: '以下哪个是太阳系中最大的行星？',
    options: ['地球', '火星', '木星', '土星'],
    correctIndex: 2,
    explanation: '木星是太阳系中最大的行星，体积是地球的1300多倍，质量是其他所有行星总和的2.5倍。'
  },
  {
    question: '人体最大的器官是？',
    options: ['心脏', '肝脏', '皮肤', '大脑'],
    correctIndex: 2,
    explanation: '皮肤是人体最大的器官，成年人的皮肤面积约为1.5-2平方米，重量约占体重的16%。'
  },
  {
    question: '光合作用主要发生在植物的哪个部位？',
    options: ['根', '茎', '叶', '花'],
    correctIndex: 2,
    explanation: '光合作用主要发生在植物的叶片中，叶绿体是进行光合作用的场所。'
  },
  {
    question: '以下哪个是哺乳动物？',
    options: ['鸡', '蛇', '海豚', '青蛙'],
    correctIndex: 2,
    explanation: '海豚是哺乳动物，属于鲸目。鸡是鸟类，蛇是爬行动物，青蛙是两栖动物。'
  },
  {
    question: '声音在以下哪种介质中传播速度最快？',
    options: ['空气', '水', '固体', '真空'],
    correctIndex: 2,
    explanation: '声音在固体中传播速度最快，在液体中次之，在气体中最慢，真空中不能传播声音。'
  },
  {
    question: '人类有多少对染色体？',
    options: ['22对', '23对', '24对', '25对'],
    correctIndex: 1,
    explanation: '人类正常细胞中有23对（46条）染色体，其中22对是常染色体，1对是性染色体。'
  }
]

const mathQuestions: QuizQuestion[] = [
  {
    question: '圆周率π的近似值是？',
    options: ['3.14', '3.16', '2.71', '1.61'],
    correctIndex: 0,
    explanation: '圆周率π约等于3.14159265...，通常简化为3.14进行计算。'
  },
  {
    question: '一个三角形的内角和是多少度？',
    options: ['90度', '180度', '270度', '360度'],
    correctIndex: 1,
    explanation: '任意三角形的三个内角之和恒等于180度，这是三角形的基本性质。'
  },
  {
    question: '2的10次方等于多少？',
    options: ['512', '1024', '2048', '4096'],
    correctIndex: 1,
    explanation: '2^10 = 1024，这是计算机科学中常用的数值（1KB = 1024字节）。'
  },
  {
    question: '以下哪个是质数？',
    options: ['15', '21', '23', '25'],
    correctIndex: 2,
    explanation: '23是质数，只能被1和它本身整除。15=3×5，21=3×7，25=5×5，都不是质数。'
  },
  {
    question: '正方形的面积公式是？',
    options: ['边长×2', '边长×4', '边长×边长', '边长+边长'],
    correctIndex: 2,
    explanation: '正方形的面积等于边长的平方，即边长×边长。'
  },
  {
    question: '1米等于多少厘米？',
    options: ['10厘米', '100厘米', '1000厘米', '10000厘米'],
    correctIndex: 1,
    explanation: '1米等于100厘米，这是长度单位的基本换算关系。'
  },
  {
    question: '以下哪个分数等于0.5？',
    options: ['1/3', '1/2', '1/4', '2/3'],
    correctIndex: 1,
    explanation: '1/2等于0.5，也就是一半。'
  },
  {
    question: '如果x + 5 = 12，那么x等于多少？',
    options: ['5', '6', '7', '8'],
    correctIndex: 2,
    explanation: 'x = 12 - 5 = 7，这是一个简单的一元一次方程。'
  }
]

const topicQuestions: Record<string, QuizQuestion[]> = {
  'python': pythonQuestions,
  'python编程': pythonQuestions,
  '编程': pythonQuestions,
  '历史': historyQuestions,
  '中国历史': historyQuestions,
  '历史知识': historyQuestions,
  '地理': geographyQuestions,
  '地理知识': geographyQuestions,
  '英语': englishQuestions,
  '英语词汇': englishQuestions,
  '英语学习': englishQuestions,
  '科学': scienceQuestions,
  '科学常识': scienceQuestions,
  '数学': mathQuestions,
  '数学思维': mathQuestions,
  '数学知识': mathQuestions
}

const generalQuestions: QuizQuestion[] = [
  {
    question: '以下哪个是正确的等式？',
    options: ['2+2=5', '3×4=12', '5-3=1', '6÷2=4'],
    correctIndex: 1,
    explanation: '3乘以4等于12，这是基本的乘法运算。'
  },
  {
    question: '太阳从哪个方向升起？',
    options: ['西方', '南方', '东方', '北方'],
    correctIndex: 2,
    explanation: '由于地球自西向东自转，太阳每天从东方升起，西方落下。'
  },
  {
    question: '一年有多少个季节？',
    options: ['2个', '3个', '4个', '5个'],
    correctIndex: 2,
    explanation: '一年有四个季节：春、夏、秋、冬。'
  },
  {
    question: '以下哪个是中国的传统节日？',
    options: ['圣诞节', '感恩节', '春节', '万圣节'],
    correctIndex: 2,
    explanation: '春节是中国最重要的传统节日，是农历新年的开始。'
  },
  {
    question: '以下哪种动物会飞？',
    options: ['大象', '狮子', '老鹰', '老虎'],
    correctIndex: 2,
    explanation: '老鹰是鸟类，可以飞翔。大象、狮子、老虎都是陆地动物，不会飞。'
  }
]

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function generateQuiz(topic: string, count: number, difficulty: string): QuizQuestion[] {
  const lowerTopic = topic.toLowerCase().replace(/\s+/g, '')
  
  let questions = topicQuestions[lowerTopic] || topicQuestions[topic] || generalQuestions
  
  if (difficulty === 'easy') {
    questions = questions.slice(0, Math.min(4, questions.length))
  } else if (difficulty === 'hard') {
    questions = questions.slice(-Math.min(4, questions.length))
  }
  
  const shuffled = shuffleArray(questions)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))
  
  return selected.map(q => ({
    ...q,
    options: shuffleArray([...q.options])
  }))
}