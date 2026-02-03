# EEGC-Nuxt 功能盘点

**更新时间**: 2026-02-02  
**部署状态**: Replit 生产环境运行中

---

## 项目结构

```
app/pages/          → 页面
app/components/     → UI 组件
app/composables/    → 业务逻辑
server/api/         → 后端 API
docs/               → 文档
```

---

## 已完成功能 ✅

| 功能 | 关键文件 |
|------|----------|
| AI 聊天 (流式响应) | `server/api/poe-chat.post.ts` |
| 三种学习模式 | `app/pages/eegc.vue` |
| 学习报告生成 | `app/components/eegc/WritingBotReport.vue` |
| 报告存储到数据库 | `server/api/submit-report.post.ts` |
| PDF/Markdown 导出 | `app/components/eegc/report/reportUtils.js` |
| 服务器端 AI Token | 环境变量 `POE_API_KEY` |

---

## 待开发功能 📋

- 学生注册系统 (Unique ID)
- 学生登录页面
- 教师账户管理

详见: `docs/discussion/implications4Dev.md`

---

## 环境变量

| 变量 | 用途 |
|-----|------|
| `POE_API_KEY` | AI 服务 |
| `SUPABASE_URL` | 数据库 |
| `SUPABASE_PUBLISHABLE_KEY` | 数据库 |
