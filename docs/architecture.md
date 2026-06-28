# 架构说明

## 总体结构

LeetCode Copilot 使用前后端分离架构：

```mermaid
flowchart LR
    U[浏览器] --> F[React 前端]
    F --> A[FastAPI API]
    A --> S[mock ai_solver]
    A -. 后续阶段 .-> D[(SQLite)]
```

当前阶段已启用 React 解题页、`POST /api/problems/solve` 和固定 Mock Solver。SQLite 虚线链路将在后续阶段实现。

## 前端分层

```text
frontend/src/
├── components/  # 可复用展示和输入组件
├── pages/       # 路由页面
├── App.tsx      # 路由和全局布局
├── main.tsx     # 应用入口
└── index.css    # Tailwind 和全局设计变量
```

## 后端分层

```text
backend/app/
├── api/         # HTTP 路由
├── services/    # AI 和业务服务
├── models/      # 数据库模型
├── schemas/     # 请求和响应结构
└── main.py      # FastAPI 入口
```

## 扩展原则

- API 层只处理 HTTP 输入输出，不承载解题逻辑。
- AI 调用封装在 `services`，便于从 mock 切换到真实提供商。
- Pydantic schema 与数据库 model 分离。
- 前端页面通过可复用组件组合，不直接拼接后端 URL。
- 前端 API 请求集中在 `src/api`，请求和响应类型集中在 `src/types`。
