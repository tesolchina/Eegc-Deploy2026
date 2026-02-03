# Pages 模块

页面路由模块，定义应用的主要页面。

## 文件列表

| 文件 | 路径 | 描述 |
|------|------|------|
| `index.vue` | `app/pages/index.vue` | 首页/入口页 |
| `eegc.vue` | `app/pages/eegc.vue` | 主应用页面 |

---

## index.vue

**路径**: `app/pages/index.vue`

**功能**: 应用首页，提供入口导航

---

## eegc.vue

**路径**: `app/pages/eegc.vue`

**功能**: EEGC 主应用页面，整合所有功能模块

### 主要功能

1. **模式切换**: 支持三种模式
   - `briefing`: 简报模式（API 连接配置）
   - `training`: 训练模式（预填写的练习场景）
   - `assessment`: 评估模式（正式评估场景）

2. **课程信息管理**: 管理课程背景和评分标准

3. **聊天交互**: 与 AI 导师对话

4. **报告生成**: 生成学习报告并提交

### 使用的 Composables

| Composable | 功能 |
|------------|------|
| `useModeManager` | 模式管理 |
| `useChatFunctions` | 聊天功能 |
| `useApiConnection` | API 连接管理 |
| `useReportGenerator` | 报告生成 |
| `useNotification` | 通知提示 |

### 使用的组件

| 组件 | 功能 |
|------|------|
| `EegcCourseHeader` | 课程标题头部 |
| `EegcModeSelector` | 模式选择器 |
| `EegcBriefingModeContent` | 简报模式内容 |
| `EegcBriefMode` | 简报模式组件 |
| `EegcTrainingTutorialSection` | 训练教程区域 |
| `EegcBackgroundAndRubrics` | 背景和评分标准输入 |
| `EegcChatInterface` | 聊天界面 |
| `EegcWritingBotReport` | 报告弹窗 |

### 核心状态

```javascript
// 模式状态
currentMode           // 当前模式: 'briefing' | 'training' | 'assessment'

// 连接状态
isConnected           // API 是否已连接
isConnecting          // 是否正在连接
isThinking            // AI 是否正在思考

// 草稿状态
originalDraft         // 原始草稿
finalDraft            // 最终草稿
isOriginalDraftConfirmed  // 原始草稿是否已确认

// 提交状态
isSubmitted           // 是否已提交报告
```
