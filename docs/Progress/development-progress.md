# EEGC-Nuxt 开发进度

**项目**: EEGC AI 语言学习助手  
**最后更新**: 2026-02-03

---

## 已完成任务 ✅

| # | 任务 | 状态 | 完成日期 | 备注 |
|---|------|------|----------|------|
| 1 | 改用我们的 AI token supplier，不用学生填 key | ✅ 已完成 | 2026-02-02 | 使用 Poe API，key 由服务器管理 |
| 2 | 改用数据库储存 chat history | ✅ 已完成 | 2026-02-02 | 使用 Supabase `learning_reports` 表 |
| 3 | EEGC 基础功能开发 | ✅ 已完成 | 2026-02-03 | AI 对话、Markdown 渲染、PDF 下载 |
| 4 | 用 Replit 服务器部署 | ✅ 已完成 | 2026-02-03 | 已部署到生产环境 |

---

## 已知限制 ⚠️

| 问题 | 原因 | 状态 |
|------|------|------|
| PDF 下载是一整张图片，没有分页 | 如果分页会导致 Markdown 渲染出错 | 暂时保持现状 |

---

## 待开发任务 📋

| # | 任务 | 状态 | 优先级 | 参考文档 |
|---|------|------|--------|----------|
| 3 | 学生注册页面 | 🔲 待开发 | 高 | [implications4Dev.md](../discussion/implications4Dev.md) |
| 5 | 学生登录页面 | 🔲 待开发 | 高 | [implications4Dev.md](../discussion/implications4Dev.md) |
| 6 | 老师账户手动注册流程 | 🔲 待开发 | 中 | [implications4Dev.md](../discussion/implications4Dev.md) |
| 7 | 重复学号后4位检查 API | 🔲 待开发 | 中 | [implications4Dev.md](../discussion/implications4Dev.md) |
| 8 | 数据库 schema 更新（students, teachers 表） | 🔲 待开发 | 高 | [implications4Dev.md](../discussion/implications4Dev.md) |

---

## 技术栈

| 组件 | 技术 |
|------|------|
| 前端 | Nuxt 4.3.0 + Vue 3 |
| 后端 | Nitro (Nuxt Server) |
| AI | Poe API (OpenAI 兼容) |
| 数据库 | Supabase (PostgreSQL) |
| 部署 | Replit Autoscale |

---

## Git 工作流建议

> ⚠️ **重要提醒**：不建议从 Replit 直接往 GitHub push 内容。如果实在要 push 的话，建议只 push `docs/` 文件夹，不要 push code。因为如果 AI 把 code 弄错的话，之后恢复会比较麻烦。

---

## 相关文档

- [产品决策问题](../discussion/questions-for-simon.md) - Simon 的回复
- [开发影响分析](../discussion/implications4Dev.md) - 技术实现方案
- [模块文档](../modules/README.md) - 代码模块说明
