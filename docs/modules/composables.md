# Composables 模块

Vue 组合式函数模块，封装业务逻辑和状态管理。

## 文件列表

```
app/composables/
├── eegc.ts                    # 统一导出入口
└── eegc/
    ├── useChatFunctions.js    # 聊天功能
    ├── useModeManager.js      # 模式管理
    ├── useApiConnection.js    # API 连接管理
    ├── useReportGenerator.js  # 报告生成
    ├── useNotification.js     # 通知提示
    └── promptAndEssay.js      # 提示词和示例文章
```

---

## useChatFunctions

**路径**: `app/composables/eegc/useChatFunctions.js`

**功能**: 处理与 AI 的聊天交互

### 主要方法

| 方法 | 描述 |
|------|------|
| `sendMessage()` | 发送用户消息到 AI |
| `talkToChatbot()` | 底层 API 调用方法 |

### 依赖参数

```javascript
useChatFunctions({
  userMessage,        // 用户输入
  currentMode,        // 当前模式
  activeChatHistory,  // 聊天历史
  originalDraft,      // 原始草稿
  finalDraft,         // 最终草稿
  bulletPoints,       // 提取的要点
  isConnected,        // 连接状态
  model,              // AI 模型
  isThinking,         // 思考状态
  isOriginalDraftConfirmed,
  isUpdatingDraft,
  courseInfo,
  courseInfoAssessment,
  currentTopic,
})
```

---

## useModeManager

**路径**: `app/composables/eegc/useModeManager.js`

**功能**: 管理应用的三种模式及其状态

### 返回值

| 属性/方法 | 类型 | 描述 |
|-----------|------|------|
| `currentMode` | Ref | 当前模式 |
| `originalDraft` | Ref | 原始草稿 |
| `finalDraft` | Ref | 最终草稿 |
| `activeChatHistory` | Ref | 当前模式的聊天历史 |
| `isOriginalDraftConfirmed` | Ref | 草稿确认状态 |
| `isSubmitted` | Ref | 提交状态 |
| `switchMode(mode)` | Function | 切换模式 |
| `confirmDraft()` | Function | 确认草稿 |
| `clearChatHistory()` | Function | 清空聊天历史 |

### 模式说明

| 模式 | 描述 |
|------|------|
| `briefing` | 简报模式 - 配置 API |
| `training` | 训练模式 - 预设场景练习 |
| `assessment` | 评估模式 - 正式评估 |

---

## useApiConnection

**路径**: `app/composables/eegc/useApiConnection.js`

**功能**: 管理与后端 API 的连接状态

### 返回值

| 属性/方法 | 类型 | 描述 |
|-----------|------|------|
| `isConnected` | Ref | 是否已连接 |
| `isConnecting` | Ref | 是否正在连接 |
| `connectAPI()` | Function | 建立连接 |
| `clearAPI()` | Function | 断开连接 |

---

## useReportGenerator

**路径**: `app/composables/eegc/useReportGenerator.js`

**功能**: 生成学习报告

### 返回值

| 属性/方法 | 类型 | 描述 |
|-----------|------|------|
| `isGeneratingAssessment` | Ref | 是否正在生成 |
| `isThinking` | Ref | AI 思考状态 |
| `showReport` | Ref | 是否显示报告弹窗 |
| `reportChatHistory` | Ref | 报告用的聊天历史 |
| `reportGenerationInstructions` | Ref | 报告生成指令 |
| `hiddenReport` | Ref | 隐藏报告内容 |
| `bccEmail` | Ref | 密送邮箱 |
| `ccEmail` | Ref | 抄送邮箱 |
| `reprotInfo` | Ref | 报告信息 |
| `submitAssessment()` | Function | 提交评估 |
| `confirmFinalDraft()` | Function | 确认最终草稿 |

---

## useNotification

**路径**: `app/composables/eegc/useNotification.js`

**功能**: 处理通知提示

### 返回值

| 属性/方法 | 类型 | 描述 |
|-----------|------|------|
| `notification` | Ref | 当前通知内容 |
| `showNotification(msg)` | Function | 显示通知 |

---

## promptAndEssay

**路径**: `app/composables/eegc/promptAndEssay.js`

**功能**: 存储 AI 提示词和示例文章

### 导出内容

| 常量 | 描述 |
|------|------|
| `Training_Greetings` | 训练模式欢迎语 |
| `Assessment_Greetings` | 评估模式欢迎语 |
| `Rubric` | 评分标准模板 |
| `SystemPrompt` | AI 系统提示词 |
| `SampleEssay` | 示例文章 |
