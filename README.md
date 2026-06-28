# LeetCode Copilot

LeetCode Copilot 是面向编程学习者的 AI 刷题辅助平台。项目计划覆盖题目理解、思路生成、代码实现、刷题记录、题型归纳、复盘和教学分析，形成完整的算法学习闭环。

当前仓库已经打通可持久化的 AI 学习闭环：前端可以提交题目文本，后端通过可配置的 AI Provider 生成结构化解析并保存到 SQLite。用户可以浏览历史记录、查看详情、保存掌握状态和个人备注，并按标签查看薄弱题型与待复习队列。未配置 DeepSeek API Key 时，系统自动使用固定 Mock 结果。

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

## 配置 DeepSeek

复制后端环境变量示例：

```powershell
cd backend
Copy-Item .env.example .env
```

在 `backend/.env` 中填写：

```dotenv
DEEPSEEK_API_KEY=你的_API_Key
```

默认使用 `deepseek-v4-flash` 非思考模式。`.env` 已被 Git 忽略，不要把真实 Key 写入 `.env.example` 或提交到仓库。

如果不填写 `DEEPSEEK_API_KEY`，系统使用 Mock Provider，无需联网即可开发和运行测试。配置了 Key 但 DeepSeek 调用失败时，接口会返回明确错误，不会静默回退 Mock，也不会保存失败记录。

## 体验 AI 解题

1. 同时启动前端和后端。
2. 打开 `http://localhost:5173/solve`。
3. 输入不少于 10 个字符的题目文本。
4. 点击“生成题目解析”。

页面会显示 `AI_RESULT`。配置 DeepSeek Key 时返回真实模型解析；未配置时返回固定的“两数之和”Mock 解析。

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
