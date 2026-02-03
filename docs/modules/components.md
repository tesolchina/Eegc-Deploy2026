# Components 模块

UI 组件模块，包含所有可复用的 Vue 组件。

## 目录结构

```
app/components/
└── eegc/
    ├── ChatInterface.vue
    ├── ModeSelector.vue
    ├── CourseHeader.vue
    ├── BriefMode.vue
    ├── BriefingModeContent.vue
    ├── BackgroundAndRubrics.vue
    ├── TrainingTutorialSection.vue
    ├── WritingBotReport.vue
    └── report/
        ├── ReportStudentInfo.vue
        ├── ReportFeedback.vue
        ├── ReportChatHistory.vue
        └── ReportActions.vue
```

---

## 核心组件

### ChatInterface.vue

**路径**: `app/components/eegc/ChatInterface.vue`

**功能**: 聊天界面组件，包含对话区域和草稿编辑区

**主要功能**:
- 显示聊天历史记录
- 发送消息输入框
- 原始草稿和最终草稿编辑区
- 步骤清单（Checklist）
- 话题选择（评估模式）

**Props**:
| Prop | 类型 | 描述 |
|------|------|------|
| `activeChatHistory` | Array | 当前聊天历史 |
| `currentMode` | String | 当前模式 |
| `isConnected` | Boolean | 是否已连接 API |
| `isThinking` | Boolean | AI 是否在思考 |
| `originalDraft` | String | 原始草稿 |
| `finalDraft` | String | 最终草稿 |
| `isOriginalDraftConfirmed` | Boolean | 原始草稿是否已确认 |

**Events**:
| Event | 描述 |
|-------|------|
| `sendMessage` | 发送消息 |
| `confirmDraft` | 确认草稿 |
| `submitAssessment` | 提交评估 |
| `confirmFinalDraft` | 确认最终草稿并生成报告 |

---

### ModeSelector.vue

**路径**: `app/components/eegc/ModeSelector.vue`

**功能**: 模式选择器侧边栏

**主要功能**:
- 显示三种模式选项
- 切换当前模式
- 可折叠/展开

---

### CourseHeader.vue

**路径**: `app/components/eegc/CourseHeader.vue`

**功能**: 课程标题头部组件

---

### BriefMode.vue

**路径**: `app/components/eegc/BriefMode.vue`

**功能**: 简报模式的内容展示

---

### BriefingModeContent.vue

**路径**: `app/components/eegc/BriefingModeContent.vue`

**功能**: 简报模式配置界面

**主要功能**:
- 模型选择
- API 连接状态
- 连接/断开按钮

---

### BackgroundAndRubrics.vue

**路径**: `app/components/eegc/BackgroundAndRubrics.vue`

**功能**: 背景信息和评分标准输入区

**主要功能**:
- 课程信息输入
- 评分标准（Rubric）输入
- 提交配置

---

### TrainingTutorialSection.vue

**路径**: `app/components/eegc/TrainingTutorialSection.vue`

**功能**: 训练模式的教程指引区域

---

### WritingBotReport.vue

**路径**: `app/components/eegc/WritingBotReport.vue`

**功能**: 学习报告弹窗组件

**主要功能**:
- 显示生成的报告
- 收集学生信息
- 提交报告到数据库
- 导出 PDF

---

## Report 子组件

### ReportStudentInfo.vue

**路径**: `app/components/eegc/report/ReportStudentInfo.vue`

**功能**: 报告中的学生信息表单

---

### ReportFeedback.vue

**路径**: `app/components/eegc/report/ReportFeedback.vue`

**功能**: 报告中的反馈/评分区域

---

### ReportChatHistory.vue

**路径**: `app/components/eegc/report/ReportChatHistory.vue`

**功能**: 报告中的聊天历史展示

---

### ReportActions.vue

**路径**: `app/components/eegc/report/ReportActions.vue`

**功能**: 报告的操作按钮（提交、导出等）
