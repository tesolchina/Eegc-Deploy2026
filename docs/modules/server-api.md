# Server API 模块

后端 API 接口模块，处理与外部服务的交互。

## 文件列表

```
server/api/
├── poe-chat.post.ts      # AI 聊天 API
└── submit-report.post.ts  # 报告提交 API
```

---

## poe-chat.post.ts

**路径**: `server/api/poe-chat.post.ts`

**端点**: `POST /api/poe-chat`

**功能**: 与 Poe API（OpenAI 兼容格式）通信，获取 AI 回复

### 请求参数

```json
{
  "chat_history": [
    { "role": "user", "content": "用户消息" },
    { "role": "assistant", "content": "AI 回复" }
  ],
  "model_name": "gpt-5.2-instant",
  "stream": true
}
```

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `chat_history` | Array | 是 | 聊天历史数组 |
| `model_name` | String | 否 | AI 模型名称 |
| `stream` | Boolean | 否 | 是否使用流式响应 |

### 支持的模型

- `gpt-5.2`
- `gemini-3-flash`
- `gpt-5.2-instant`（默认）

### 响应格式

**非流式响应**:
```json
{
  "choices": [...],
  "usage": {...}
}
```

**流式响应** (Server-Sent Events):
```
data: {"content": "AI 回复内容"}

data: [DONE]
```

### 环境变量

| 变量 | 描述 |
|------|------|
| `POE_API_KEY` | Poe API 密钥 |

---

## submit-report.post.ts

**路径**: `server/api/submit-report.post.ts`

**端点**: `POST /api/submit-report`

**功能**: 将学习报告提交到 Supabase 数据库

### 请求参数

```json
{
  "student_number": "20241234",
  "student_email": "student@example.com",
  "section_number": "1",
  "rating": 5,
  "comment": "学生反馈",
  "mode": "training",
  "teacher_name": "李老师",
  "chat_history": [...],
  "contribution_analysis": "贡献分析内容",
  "hidden_report": "隐藏报告",
  "report_info": {...}
}
```

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `student_number` | String | 是 | 学号 |
| `student_email` | String | 是 | 学生邮箱 |
| `section_number` | String | 否 | 班级编号 |
| `rating` | Number | 否 | 评分 |
| `comment` | String | 否 | 学生反馈 |
| `mode` | String | 是 | 模式（training/assessment） |
| `teacher_name` | String | 否 | 老师姓名 |
| `chat_history` | Array | 是 | 聊天历史 |
| `contribution_analysis` | String | 否 | AI 生成的贡献分析 |
| `hidden_report` | String | 否 | 隐藏报告内容 |
| `report_info` | Object | 否 | 额外报告信息 |

### 响应格式

**成功**:
```json
{
  "success": true
}
```

**失败**:
```json
{
  "statusCode": 500,
  "statusMessage": "错误信息"
}
```

### 数据库表

**表名**: `learning_reports`

| 字段 | 类型 | 描述 |
|------|------|------|
| `student_number` | text | 学号 |
| `student_email` | text | 邮箱 |
| `section_number` | integer | 班级编号 |
| `rating` | integer | 评分 |
| `comment` | text | 反馈 |
| `mode` | text | 模式 |
| `teacher_name` | text | 老师姓名 |
| `chat_history` | jsonb | 聊天历史 |
| `contribution_analysis` | jsonb | 贡献分析 |
| `metadata` | jsonb | 元数据 |

### 环境变量

| 变量 | 描述 |
|------|------|
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase 公开密钥 |
