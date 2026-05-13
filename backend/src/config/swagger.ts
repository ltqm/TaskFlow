import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.3',
  info: {
    title: 'Task Reminder API',
    version: '1.0.0',
    description: 'Task Reminder backend OpenAPI document'
  },
  servers: [
    {
      url: '/api',
      description: 'Current API server'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Tasks', description: 'Task management endpoints' },
    { name: 'Categories', description: 'Category management endpoints' },
    { name: 'Versions', description: 'Version management endpoints' },
    { name: 'SubTasks', description: 'Sub-task management endpoints' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    parameters: {
      id: {
        name: 'id',
        in: 'path',
        required: true,
        description: '资源唯一 ID',
        schema: { type: 'string' }
      },
      taskId: {
        name: 'taskId',
        in: 'path',
        required: true,
        description: '任务 ID',
        schema: { type: 'string' }
      }
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        required: ['code', 'data', 'msg'],
        properties: {
          code: { type: 'integer', description: '业务状态码，0 表示成功', example: 0 },
          data: { nullable: true, description: '业务数据主体', example: null },
          msg: { type: 'string', description: '返回消息，成功时通常为空', example: '' }
        }
      },
      ApiError: {
        type: 'object',
        required: ['code', 'data', 'msg'],
        properties: {
          code: { type: 'integer', description: '业务错误码，非 0', example: 90000 },
          data: { nullable: true, description: '错误场景下通常为空', example: null },
          msg: { type: 'string', description: '错误提示信息', example: '服务器内部错误' }
        }
      },
      UserProfile: {
        type: 'object',
        required: ['id', 'username', 'email'],
        properties: {
          id: { type: 'string', description: '用户唯一 ID', example: '1715200000000' },
          username: { type: 'string', description: '用户名', example: 'demo-user' },
          email: { type: 'string', description: '用户邮箱', example: 'demo@example.com' },
          createdAt: { type: 'string', format: 'date-time', description: '用户创建时间' }
        }
      },
      AuthPayload: {
        type: 'object',
        required: ['token', 'user'],
        properties: {
          token: { type: 'string', description: 'JWT 鉴权令牌' },
          user: {
            description: '当前登录用户信息',
            $ref: '#/components/schemas/UserProfile'
          }
        }
      },
      Task: {
        type: 'object',
        required: ['id', 'title', 'priority', 'createdAt', 'isCompleted', 'userId'],
        properties: {
          id: { type: 'string', description: '任务唯一 ID' },
          title: { type: 'string', description: '任务标题' },
          description: { type: 'string', description: '任务详细描述' },
          categoryId: { type: 'string', nullable: true, description: '所属分类 ID，可为空' },
          versionId: { type: 'string', nullable: true, description: '所属版本 ID，可为空' },
          priority: { type: 'string', description: '优先级', enum: ['high', 'medium', 'low'], example: 'medium' },
          dueDate: { type: 'string', format: 'date-time', nullable: true, description: '截止时间' },
          reminderTime: { type: 'string', format: 'date-time', nullable: true, description: '提醒时间' },
          tags: { type: 'array', description: '标签列表', items: { type: 'string' } },
          notes: { type: 'string', description: '备注信息' },
          completedPomodoros: { type: 'integer', description: '已完成番茄钟数量', example: 0 },
          totalPomodoros: { type: 'integer', description: '预估番茄钟总数', example: 1 },
          createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
          isCompleted: { type: 'boolean', description: '是否已完成', example: false },
          userId: { type: 'string', description: '所属用户 ID' },
          categoryName: { type: 'string', nullable: true, description: '分类名称（展示字段）' },
          categoryColor: { type: 'string', nullable: true, description: '分类颜色（展示字段）' },
          versionName: { type: 'string', nullable: true, description: '版本名称（展示字段）' }
        }
      },
      Category: {
        type: 'object',
        required: ['id', 'name', 'color', 'userId', 'createdAt'],
        properties: {
          id: { type: 'string', description: '分类唯一 ID' },
          name: { type: 'string', description: '分类名称' },
          color: { type: 'string', description: '分类颜色（Hex）', example: '#3B82F6' },
          userId: { type: 'string', description: '所属用户 ID' },
          createdAt: { type: 'string', format: 'date-time', description: '创建时间' }
        }
      },
      Version: {
        type: 'object',
        required: ['id', 'name', 'description', 'releaseDate', 'userId', 'createdAt'],
        properties: {
          id: { type: 'string', description: '版本唯一 ID' },
          name: { type: 'string', description: '版本名称' },
          description: { type: 'string', description: '版本说明' },
          releaseDate: { type: 'string', format: 'date', description: '发布日期（YYYY-MM-DD）' },
          userId: { type: 'string', description: '所属用户 ID' },
          createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
          tasks: {
            type: 'array',
            description: '该版本关联的任务列表',
            items: { $ref: '#/components/schemas/Task' }
          }
        }
      },
      SubTask: {
        type: 'object',
        required: ['id', 'taskId', 'title', 'description', 'isCompleted', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', description: '子任务唯一 ID' },
          taskId: { type: 'string', description: '所属主任务 ID' },
          title: { type: 'string', description: '子任务标题' },
          description: { type: 'string', description: '子任务描述' },
          isCompleted: { type: 'boolean', description: '是否已完成' },
          createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
          updatedAt: { type: 'string', format: 'date-time', description: '更新时间' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', description: '用户名' },
          email: { type: 'string', format: 'email', description: '邮箱' },
          password: { type: 'string', minLength: 6, description: '密码，最少 6 位' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', description: '邮箱' },
          password: { type: 'string', description: '密码' }
        }
      },
      TaskCreateRequest: {
        type: 'object',
        required: ['title', 'versionId'],
        properties: {
          title: { type: 'string', description: '任务标题（必填）' },
          description: { type: 'string', description: '任务描述' },
          categoryId: { type: 'string', nullable: true, description: '所属分类 ID' },
          versionId: { type: 'string', description: '所属版本 ID（必填）' },
          priority: { type: 'string', description: '优先级', enum: ['high', 'medium', 'low'] },
          dueDate: { type: 'string', format: 'date-time', nullable: true, description: '截止时间' },
          reminderTime: { type: 'string', format: 'date-time', nullable: true, description: '提醒时间' },
          tags: { type: 'array', description: '标签列表', items: { type: 'string' } },
          notes: { type: 'string', description: '备注信息' },
          totalPomodoros: { type: 'integer', minimum: 1, description: '预估番茄钟总数，最小为 1' }
        }
      },
      TaskImportCommitRequest: {
        type: 'object',
        required: ['importToken', 'fileHash'],
        properties: {
          importToken: { type: 'string', description: '预检返回的导入令牌，10 分钟有效' },
          fileHash: { type: 'string', description: '预检返回的 SHA256 文件摘要' }
        }
      },
      TaskImportIssue: {
        type: 'object',
        required: ['rowIndex', 'field', 'reason'],
        properties: {
          rowIndex: { type: 'integer', description: '问题所在行号（从 2 开始，对应表格行）' },
          field: { type: 'string', description: '问题字段名' },
          reason: { type: 'string', description: '问题说明' }
        }
      },
      TaskImportPrecheckRow: {
        type: 'object',
        properties: {
          rowIndex: { type: 'integer' },
          mainTaskTitle: { type: 'string', description: '主任务标题（与 tasks 表 title 一致，用于 subtasks 关联，导入文件内须唯一）' },
          title: { type: 'string' },
          description: { type: 'string' },
          categoryId: { type: 'string', nullable: true },
          versionId: { type: 'string', nullable: true },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
          reminderTime: { type: 'string', format: 'date-time', nullable: true },
          tags: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' },
          totalPomodoros: { type: 'integer' },
          subTaskCount: { type: 'integer' }
        }
      },
      TaskImportPrecheckData: {
        type: 'object',
        required: ['totalRows', 'validRows', 'errorRows', 'warningRows', 'canCommit', 'errors', 'warnings', 'normalizedRows'],
        properties: {
          totalRows: { type: 'integer' },
          validRows: { type: 'integer' },
          errorRows: { type: 'integer' },
          warningRows: { type: 'integer' },
          canCommit: { type: 'boolean', description: '是否可直接调用 commit 接口' },
          importToken: { type: 'string', nullable: true },
          fileHash: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          errors: {
            type: 'array',
            items: { $ref: '#/components/schemas/TaskImportIssue' }
          },
          warnings: {
            type: 'array',
            items: { $ref: '#/components/schemas/TaskImportIssue' }
          },
          normalizedRows: {
            type: 'array',
            items: { $ref: '#/components/schemas/TaskImportPrecheckRow' }
          }
        }
      },
      TaskImportCommitData: {
        type: 'object',
        required: ['createdTaskCount', 'createdSubtaskCount', 'skippedRelationCount', 'createdTasks'],
        properties: {
          createdTaskCount: { type: 'integer' },
          createdSubtaskCount: { type: 'integer' },
          skippedRelationCount: { type: 'integer', description: '分类/版本未匹配置空总次数' },
          createdTasks: {
            type: 'array',
            items: { $ref: '#/components/schemas/Task' }
          }
        }
      },
      CategoryCreateRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', description: '分类名称' },
          color: { type: 'string', description: '分类颜色（Hex）' }
        }
      },
      VersionCreateRequest: {
        type: 'object',
        required: ['name', 'releaseDate'],
        properties: {
          name: { type: 'string', description: '版本名称' },
          description: { type: 'string', description: '版本说明' },
          releaseDate: { type: 'string', format: 'date', description: '发布日期（YYYY-MM-DD）' }
        }
      },
      SubTaskCreateRequest: {
        type: 'object',
        required: ['taskId', 'title'],
        properties: {
          taskId: { type: 'string', description: '所属任务 ID' },
          title: { type: 'string', description: '子任务标题' },
          description: { type: 'string', description: '子任务描述' }
        }
      }
    },
    responses: {
      Unauthorized: {
        description: '未授权',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: { code: 10001, data: null, msg: '未授权' }
          }
        }
      },
      Forbidden: {
        description: '无效 token',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: { code: 10002, data: null, msg: '无效的token' }
          }
        }
      },
      NotFound: {
        description: '资源不存在',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: { code: 90004, data: null, msg: '接口不存在' }
          }
        }
      },
      InternalError: {
        description: '服务器错误',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: { code: 90000, data: null, msg: '服务器内部错误' }
          }
        }
      }
    }
  }
}

const swaggerOptions: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts']
}

export const swaggerSpec = swaggerJSDoc(swaggerOptions)
