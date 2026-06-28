# LeetCode Copilot

LeetCode Copilot 是面向编程学习者的 AI 刷题辅助平台。项目计划覆盖题目理解、思路生成、代码实现、刷题记录、题型归纳、复盘和教学分析，形成完整的算法学习闭环。

当前仓库已经打通可持久化的 Mock 学习闭环：前端可以提交题目文本，后端通过固定的 mock `ai_solver` 返回完整“两数之和”解析并保存到 SQLite。用户可以浏览历史记录、查看详情、保存掌握状态和个人备注，并按标签查看薄弱题型与待复习队列。尚未接入真实 AI。

## 技术栈

- 前端：React、TypeScript、Vite、Tailwind CSS、React Router
- 后端：FastAPI、Python
- 数据库：SQLite、SQLAlchemy 2.0
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

## 体验 Mock 解题

1. 同时启动前端和后端。
2. 打开 `http://localhost:5173/solve`。
3. 输入不少于 10 个字符的题目文本。
4. 点击“生成题目解析”。

当前所有有效输入都会返回固定的“两数之和”Mock 解析，页面会明确显示 `MOCK_RESULT`。

如需修改后端地址，可复制 `frontend/.env.example` 为 `frontend/.env` 并调整 `VITE_API_BASE_URL`。

开发数据库自动创建在 `backend/data/leetcode_copilot.db`。该文件已被 Git 忽略。

## 运行检查

```powershell
cd frontend
npm run build

cd ..\backend
python -m pip install -r requirements-dev.txt
python -m pytest
```

详细需求、架构、接口和开发阶段参见 [docs](./docs)。
