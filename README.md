# LeetCode Copilot

LeetCode Copilot 是面向编程学习者的 AI 刷题辅助平台。项目计划覆盖题目理解、思路生成、代码实现、刷题记录、题型归纳、复盘和教学分析，形成完整的算法学习闭环。

当前仓库处于基础框架阶段：前端提供页面和组件骨架，后端仅提供健康检查接口。尚未实现 SQLite 数据模型、解题接口或 AI 模块。

## 技术栈

- 前端：React、TypeScript、Vite、Tailwind CSS、React Router
- 后端：FastAPI、Python
- 数据库：SQLite（后续 MVP 阶段接入）
- 架构：前后端分离

## 目录结构

```text
.
├── frontend/   # React 前端
├── backend/    # FastAPI 后端
├── docs/       # 项目文档
└── README.md
```

## 启动前端

```powershell
cd frontend
npm install
npm run dev
```

浏览器访问 `http://localhost:5173`。

## 启动后端

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

后端默认运行在 `http://127.0.0.1:8000`，健康检查地址为 `http://127.0.0.1:8000/health`，交互式接口文档地址为 `http://127.0.0.1:8000/docs`。

## 运行检查

```powershell
cd frontend
npm run build

cd ..\backend
python -m pip install -r requirements-dev.txt
python -m pytest
```

详细需求、架构、接口和开发阶段参见 [docs](./docs)。
