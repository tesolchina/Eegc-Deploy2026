# EEGC-Nuxt 模块文档

本目录包含各个功能模块的详细说明文档。

## 模块概览

| 模块 | 文件 | 描述 |
|------|------|------|
| [Pages](./pages.md) | `app/pages/` | 页面路由 |
| [Components](./components.md) | `app/components/` | UI 组件 |
| [Composables](./composables.md) | `app/composables/` | Vue 组合式函数（状态管理和业务逻辑） |
| [Server API](./server-api.md) | `server/api/` | 后端 API 接口 |
| [Constants](./constants.md) | `app/constants/` | 常量配置 |

## 项目架构图

```
eegc-nuxt/
├── app/
│   ├── pages/           # 页面路由
│   │   ├── index.vue    # 首页
│   │   └── eegc.vue     # 主应用页面
│   ├── components/      # UI 组件
│   │   └── eegc/        # EEGC 相关组件
│   ├── composables/     # Vue 组合式函数
│   │   └── eegc/        # EEGC 业务逻辑
│   └── constants/       # 常量配置
├── server/
│   └── api/             # 后端 API
└── public/              # 静态资源
```

## 数据流向

```
用户输入 → ChatInterface → useChatFunctions → poe-chat API → AI 回复
                                    ↓
                            useReportGenerator → submit-report API → Supabase
```
