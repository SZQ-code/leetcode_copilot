# LeetCode Copilot 基础工程设计

## 目标

为 LeetCode Copilot 创建一个可独立启动、边界清晰且便于扩展的前后端分离工程。当前阶段只建立工程骨架和健康检查，不实现刷题业务、数据库表或真实 AI 调用。

## 目录结构

项目根目录包含以下主要内容：

```text
leetcode copliot/
├── frontend/
├── backend/
├── docs/
├── .gitignore
└── README.md
```

- `frontend/`：React、TypeScript、Vite 和 Tailwind CSS 前端。
- `backend/`：FastAPI 和 Python 后端。
- `docs/`：需求、架构、接口和开发计划文档。
- `docs/superpowers/specs/`：经过确认的设计规格。

## 前端设计

前端使用 npm 管理依赖，并采用 React Router 组织页面。

基础页面：

- `HomePage`：项目首页和功能入口。
- `SolvePage`：题目输入与解析结果区域的静态骨架。
- `HistoryPage`：历史记录列表的静态骨架。
- `ProblemDetailPage`：题目详情的静态骨架。
- `CategoryPage`：算法标签归纳的静态骨架。

基础组件：

- `Navbar`
- `ProblemInput`
- `ProblemCard`
- `SolutionPanel`
- `CodeBlock`
- `TagBadge`

页面和组件使用明确的 TypeScript 属性类型。当前仅展示占位数据，不发起业务 API 请求。未匹配路由显示简单的 404 页面。

## 后端设计

FastAPI 应用入口为 `backend/app/main.py`。应用按职责拆分：

- `app/api/`：HTTP 路由。
- `app/services/`：业务服务和未来的 `ai_solver`。
- `app/models/`：未来的数据库模型。
- `app/schemas/`：未来的请求和响应模型。

当前只实现 `GET /health`，返回稳定的 JSON 健康状态。`services`、`models` 和 `schemas` 仅建立包结构和用途说明，不包含虚构业务实现。

## 数据流

本阶段的数据流只有两条：

1. Vite 启动并渲染 React 路由和静态页面。
2. 客户端请求 FastAPI 的 `GET /health`，后端返回健康状态。

`POST /api/problems/solve`、SQLite 持久化和 AI mock 数据属于后续阶段。

## 错误处理

- 后端使用 FastAPI 默认异常响应；健康检查不依赖外部资源。
- 前端为未知 URL 提供 404 页面。
- 本阶段不增加全局错误状态、重试机制或复杂日志系统。

## 文档

`docs/` 下生成以下项目文档：

- `requirement.md`
- `architecture.md`
- `api.md`
- `development_plan.md`

根目录 `README.md` 说明项目定位、技术栈、目录结构和前后端启动方式。

## 验收标准

- 根目录包含 `frontend`、`backend` 和 `docs`。
- 前端包含指定的 5 个页面和 6 个组件。
- `npm run build` 能通过 TypeScript 检查并完成 Vite 构建。
- 后端应用可导入，`GET /health` 返回 HTTP 200 和 JSON 健康状态。
- 文档准确说明当前能力与未实现范围。
- 代码中不包含真实 AI API、完整解题逻辑或 SQLite 业务表。

## 后续扩展边界

下一阶段可在现有边界内增加 Pydantic schema、SQLAlchemy/SQLModel 持久化、mock `ai_solver`、题目路由及前端 API 客户端，无需重组当前工程。
