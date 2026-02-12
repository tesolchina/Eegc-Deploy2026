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
| 5 | 学生注册页面 | ✅ 已完成 | 2026-02-03 | Unique ID 生成 |
| 6 | 学生登录页面 | ✅ 已完成 | 2026-02-03 | |
| 7 | 老师账户手动注册流程 | ✅ 已完成 | 2026-02-03 | 需手动在数据库注册 |
| 8 | 数据库 schema 更新（students, teachers 表） | ✅ 已完成 | 2026-02-03 | |
| 9 | 重复学号后4位检查 API | ✅ 已完成 | 2026-02-03 | 老师仪表板显示重复 ID |
| 10 | 学生注册白名单功能 | ✅ 已完成 | 2026-02-03 | 只有在 `student_whitelist` 表中的学号后4位才能注册 |
| 11 | 注册表单优化：Section 改为下拉菜单 + Name Prefix 改为 Name Initials | ✅ 已完成 | 2026-02-12 | 详见下方变更记录 |

---

## 变更记录 📝

### 2026-02-12：学生注册表单优化

**变更文件**: `app/pages/student/signup.vue`

**变更 1 — Section Number 改为下拉菜单**

- **原实现**: `<input>` 数字输入框，学生需手动输入 section 编号
- **新实现**: `<select>` 下拉菜单，提供 Section 1 ~ Section 10 共 10 个选项
- **代码变更**:
  ```diff
  - <label>Section Number</label>
  - <input v-model="form.sectionNumber" type="number" placeholder="e.g. 1" />
  + <label>Section</label>
  + <select v-model="form.sectionNumber">
  +   <option value="" disabled>Select your section</option>
  +   <option v-for="n in 10" :key="n" :value="String(n)">Section {{ n }}</option>
  + </select>
  ```
- **原因**: Google Docs 测试反馈指出 Section 应使用下拉菜单，避免输入错误

**变更 2 — Name Prefix 改为 Name Initials**

- **原实现**: 标签为 "Name Prefix (First 2 letters)"，placeholder 为 "e.g. JD"
- **新实现**: 标签改为 "Name Initials (First & Last Name)"，新增提示文字 "e.g. John Kwok → JK"，placeholder 改为 "e.g. JK"
- **代码变更**:
  ```diff
  - <label>Name Prefix (First 2 letters)</label>
  - <input placeholder="e.g. JD" />
  + <label>Name Initials (First & Last Name)</label>
  + <p class="text-xs text-gray-500 mb-1">e.g. John Kwok → JK</p>
  + <input placeholder="e.g. JK" />
  ```
- **验证错误信息同步更新**:
  ```diff
  - title: 'Invalid Name Prefix'
  - text: 'Please enter the first two letters of your name.'
  + title: 'Invalid Name Initials'
  + text: 'Please enter the initials of your first and last name (2 letters). e.g. John Kwok → JK'
  ```
- **原因**: Google Docs 测试反馈指出 Name Prefix 含义不够清晰，需要加示例说明

---

## 已知限制 ⚠️

| 问题 | 原因 | 状态 |
|------|------|------|
| PDF 下载是一整张图片，没有分页 | 如果分页会导致 Markdown 渲染出错 | 暂时保持现状 |
| 老师账户需手动在数据库注册 | 目前由 Kaitai/Simon 手动操作 | 暂时保持现状 |
| 数据库密码明文存储 | 不涉及隐私信息，暂时可接受 | 暂时保持现状 |
| 学生白名单需手动添加 | 需要在 Supabase 的 `student_whitelist` 表中添加记录 | 暂时保持现状 |

> ⚠️ **学生白名单表结构 (`student_whitelist`)**：
> - `first_name`: 学生名字（用于识别）
> - `student_number_suffix`: 学号后4位（用于验证注册）
> 
> 只有在白名单中的学号后4位才能注册。未在白名单中的学生会收到提示，要求联系管理员。

> ⚠️ **文档冲突说明**：本文档（`development-progress.md`）与 `implications4Dev.md` 在 `section_teachers` 字段的处理逻辑上存在不一致。当前开发工作以本文档为准。若后续需要调整实现方式，请 Simon 提出修改意见。

---

## 当前状态说明 📝

目前已按照需求完成了**技术层面**的任务。以下方面等待 Simon 测试后确定：

- **内容层面修改**：例如修改 AI 提示词、修改作文内容等
- **功能细节修改**：例如增加/减少某个按钮、调整流程等

Kaitai 暂时只确保技术方面没有问题，内容和流程方面的调整待 Simon 测试反馈后进行。

---

## 测试账户 🔑

| 角色 | 账户 | 密码 |
|------|------|------|
| 老师 | test@hkbu.edu.hk | test@hkbu.edu.hk |
| 学生 | 1234-AA-C7 | - |

---

## 待开发任务 📋

暂无待开发任务。

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
- [学生白名单功能](../features/student-whitelist.md) - 白名单功能技术文档、测试指南和回滚说明
