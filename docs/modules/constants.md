# Constants 模块

常量配置模块，存储应用中使用的固定配置值。

## 文件列表

```
app/constants/
└── eegcModes.ts    # 模式相关常量
```

---

## eegcModes.ts

**路径**: `app/constants/eegcModes.ts`

**功能**: 定义应用的三种模式的配置

### 导出常量

#### MODE_COLORS

模式的颜色样式类名：

```typescript
export const MODE_COLORS = {
  training: 'bg-green-100 text-green-800',
  assessment: 'bg-red-100 text-red-800',
  briefing: 'bg-blue-100 text-blue-800',
} as const
```

| 模式 | 颜色 |
|------|------|
| `training` | 绿色 |
| `assessment` | 红色 |
| `briefing` | 蓝色 |

---

#### MODE_LABELS

模式的显示标签：

```typescript
export const MODE_LABELS = {
  training: 'Training Mode Active',
  assessment: 'Assessment Mode Active',
  briefing: 'Briefing Mode Active',
} as const
```

---

#### MODE_GREETINGS

模式的欢迎语：

```typescript
export const MODE_GREETINGS = {
  training: Training_Greetings,      // 从 promptAndEssay 导入
  assessment: Assessment_Greetings,  // 从 promptAndEssay 导入
  briefing: 'Welcome to LANG 0036! Configure your API to start.',
} as const
```

---

#### ModeType

模式类型定义：

```typescript
export type ModeType = 'training' | 'assessment' | 'briefing'
```

---

## 使用示例

```vue
<script setup>
import { MODE_COLORS, MODE_LABELS } from '~/constants/eegcModes'

const currentMode = ref('training')
</script>

<template>
  <div :class="MODE_COLORS[currentMode]">
    {{ MODE_LABELS[currentMode] }}
  </div>
</template>
```
