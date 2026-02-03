# EEGC-Nuxt 功能盘点 (Take Stock)

**更新时间**: 2026-02-02 08:00 UTC  
**项目版本**: Nuxt 4.3.0 + Vue 3  
**部署状态**: Replit 生产环境运行中

---

## 项目结构概览

```
EEGC-Nuxt/
├── app/
│   ├── pages/              # 页面路由
│   ├── components/eegc/    # UI 组件
│   ├── composables/eegc/   # 业务逻辑 hooks
│   └── constants/          # 常量配置
├── server/api/             # 后端 API
├── docs/                   # 项目文档
└── public/                 # 静态资源
```

---

## 1. 页面 (Pages)

### 1.1 主页面
| 文件路径 | 功能描述 |
|---------|---------|
| `app/pages/index.vue` | 网站首页，跳转入口 |
| `app/pages/eegc.vue` | **核心页面** - AI 写作辅导界面，包含模式选择、聊天、报告生成 |

### 1.2 eegc.vue 主要功能
- 三种学习模式切换 (Briefing / Training / Assessment)
- API 连接管理
- 课程信息和评分标准输入
- 聊天界面集成
- 学习报告生成和提交

---

## 2. UI 组件 (Components)

### 2.1 核心组件
| 文件路径 | 功能描述 |
|---------|---------|
| `app/components/eegc/ChatInterface.vue` | 聊天界面 - 消息显示、输入框、草稿编辑区 |
| `app/components/eegc/ModeSelector.vue` | 模式选择器 - 侧边栏切换三种模式 |
| `app/components/eegc/CourseHeader.vue` | 页面顶部标题栏 |
| `app/components/eegc/BriefMode.vue` | Briefing 模式内容展示 |
| `app/components/eegc/BriefingModeContent.vue` | API 连接控制和模型选择 |
| `app/components/eegc/BackgroundAndRubrics.vue` | 课程背景和评分标准输入表单 |
| `app/components/eegc/TrainingTutorialSection.vue` | 训练模式教程说明 |
| `app/components/eegc/WritingBotReport.vue` | **学习报告弹窗** - 报告预览、下载、提交 |

### 2.2 报告子组件
| 文件路径 | 功能描述 |
|---------|---------|
| `app/components/eegc/report/ReportStudentInfo.vue` | 学生信息输入表单 (学号、邮箱、班级) |
| `app/components/eegc/report/ReportFeedback.vue` | 学生反馈评分 |
| `app/components/eegc/report/ReportChatHistory.vue` | 聊天记录展示 |
| `app/components/eegc/report/ReportActions.vue` | 报告操作按钮 (下载/复制/提交) |
| `app/components/eegc/report/reportUtils.js` | 报告工具函数 (PDF生成、Markdown导出) |

### 2.3 配置文件
| 文件路径 | 功能描述 |
|---------|---------|
| `app/components/eegc/base_url.js` | API 基础 URL 配置 |
| `app/components/eegc/section_info_map.json` | 班级信息映射 |
| `app/components/eegc/student_section_map.json` | 学生-班级映射 |

---

## 3. 业务逻辑 (Composables)

### 3.1 核心 Composables
| 文件路径 | 功能描述 |
|---------|---------|
| `app/composables/eegc.ts` | 入口文件 - 导出所有 composables |
| `app/composables/eegc/useChatFunctions.js` | **聊天功能** - 消息发送、流式响应、AI 对话 |
| `app/composables/eegc/useModeManager.js` | **模式管理** - 状态切换、历史记录管理 |
| `app/composables/eegc/useReportGenerator.js` | **报告生成** - AI 生成学习评估报告 |
| `app/composables/eegc/useApiConnection.js` | API 连接管理 - 连接状态、模型选择 |
| `app/composables/eegc/useNotification.js` | 通知系统 |
| `app/composables/eegc/promptAndEssay.js` | **AI Prompts** - 所有 AI 系统提示词和示例文章 |

### 3.2 useChatFunctions.js 核心功能
```javascript
// 主要导出函数:
- talkToChatbot(chat_history)      // 非流式 AI 对话
- talkToChatbotStream(chat_history, onChunk)  // 流式 AI 对话
- sendMessage()                     // 发送用户消息
- extractAndUpdateEssay()          // 提取修改建议要点
```

### 3.3 useReportGenerator.js 核心功能
```javascript
// 主要导出函数:
- generateAssessmentReport(mode)   // 生成评估报告
- submitAssessment()               // 提交最终评估
- confirmFinalDraft()              // 确认最终草稿
```

---

## 4. 后端 API (Server)

### 4.1 API 端点
| 文件路径 | 端点 | 功能描述 |
|---------|------|---------|
| `server/api/poe-chat.post.ts` | `POST /api/poe-chat` | **AI 聊天代理** - 连接 Poe API，支持流式响应 |
| `server/api/submit-report.post.ts` | `POST /api/submit-report` | **报告提交** - 保存学习报告到 Supabase |

### 4.2 poe-chat.post.ts 功能详情
- 接收参数: `chat_history`, `model_name`, `stream`
- 支持模型: `gpt-5.2`, `gemini-3-flash`, `gpt-5.2-instant`
- 流式响应: Server-Sent Events (SSE)
- 错误处理: 返回详细错误信息

### 4.3 submit-report.post.ts 功能详情
- 保存到 Supabase `learning_reports` 表
- 存储字段:
  - `student_number` - 学号
  - `student_email` - 学生邮箱
  - `section_number` - 班级
  - `rating` - 评分
  - `comment` - 评论
  - `mode` - 学习模式
  - `teacher_name` - 教师姓名
  - `chat_history` - 完整聊天记录
  - `contribution_analysis` - AI 贡献分析
  - `metadata` - 隐藏报告和报告信息

---

## 5. 常量配置 (Constants)

| 文件路径 | 功能描述 |
|---------|---------|
| `app/constants/eegcModes.ts` | 模式标签和颜色配置 (MODE_LABELS, MODE_COLORS) |

---

## 6. 环境配置

### 6.1 环境变量 (Secrets)
| 变量名 | 用途 |
|-------|------|
| `POE_API_KEY` | Poe API 密钥 (AI 服务) |
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase 公开密钥 |
| `SESSION_SECRET` | 会话密钥 |

### 6.2 配置文件
| 文件路径 | 功能描述 |
|---------|---------|
| `nuxt.config.ts` | Nuxt 配置 - 运行时配置、模块加载 |
| `tsconfig.json` | TypeScript 配置 |
| `package.json` | 依赖管理 |

---

## 7. 数据库 Schema

### 7.1 learning_reports 表
```sql
CREATE TABLE learning_reports (
  id SERIAL PRIMARY KEY,
  student_number VARCHAR,
  student_email VARCHAR,
  section_number INTEGER,
  rating INTEGER,
  comment TEXT,
  mode VARCHAR,
  teacher_name VARCHAR,
  chat_history JSONB,
  contribution_analysis JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. 已完成功能总结

| 功能 | 状态 | 关键文件 |
|------|------|----------|
| AI 聊天 (流式响应) | ✅ | `server/api/poe-chat.post.ts`, `useChatFunctions.js` |
| 三种学习模式 | ✅ | `eegc.vue`, `useModeManager.js` |
| 学习报告生成 | ✅ | `useReportGenerator.js`, `WritingBotReport.vue` |
| 报告数据库存储 | ✅ | `server/api/submit-report.post.ts` |
| PDF/Markdown 导出 | ✅ | `reportUtils.js` |
| 服务器端 AI Token | ✅ | `poe-chat.post.ts` (POE_API_KEY) |
| Replit 部署 | ✅ | `dist/index.cjs`, `.replit` |

---

## 9. 待开发功能

| 功能 | 参考文档 |
|------|----------|
| 学生注册系统 (Unique ID) | `docs/discussion/implications4Dev.md` |
| 学生登录页面 | `docs/discussion/implications4Dev.md` |
| 教师账户管理 | `docs/discussion/implications4Dev.md` |
| 数据库 Schema 扩展 | `docs/discussion/implications4Dev.md` |

---

## 10. 文档索引

| 文档路径 | 内容 |
|---------|------|
| `docs/modules/README.md` | 模块文档索引 |
| `docs/modules/pages.md` | 页面文档 |
| `docs/modules/components.md` | 组件文档 |
| `docs/modules/composables.md` | Composables 文档 |
| `docs/modules/server-api.md` | API 文档 |
| `docs/modules/constants.md` | 常量文档 |
| `docs/discussion/questions-for-simon.md` | Simon 的产品决策 |
| `docs/discussion/implications4Dev.md` | 技术实现方案 |
| `docs/Progress/development-progress.md` | 开发进度追踪 |
