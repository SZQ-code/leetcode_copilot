# LeetCode Copilot Windows 运行指南

本文用于指导第一次接触本项目的用户，在 Windows 10/11 上启动并验证 LeetCode Copilot。

本文不介绍 Python、Node.js 或编辑器的安装。

## 1. 运行前确认

电脑需要已经具备：

- Python 3.12（本项目已验证的版本）
- Node.js `20.19.0` 及以上的 20.x 版本，或 `22.12.0` 及以上版本
- npm
- 可正常联网下载 Python 和 npm 依赖

打开 PowerShell，执行以下命令检查环境：

```powershell
python --version
node --version
npm --version
```

项目运行时需要同时启动两个服务：

- 后端：FastAPI，默认地址为 `http://127.0.0.1:8000`
- 前端：React + Vite，默认地址为 `http://localhost:5173`

因此需要打开两个 PowerShell 窗口，并让两个窗口保持运行。

## 2. 打开项目根目录

解压项目后，进入同时包含以下两个文件夹的目录：

```text
frontend
backend
```

最简单的打开方式：

1. 在文件资源管理器中进入项目根目录。
2. 单击顶部地址栏。
3. 输入 `powershell`。
4. 按 Enter。

也可以打开 PowerShell 后执行：

```powershell
Set-Location "D:\你的项目路径\leetcode copliot"
```

请将示例路径替换成项目的真实路径。路径中如果包含空格，必须保留双引号。

执行下面的命令确认当前位置正确：

```powershell
Get-ChildItem
```

输出中应当能够看到 `frontend` 和 `backend`。

## 3. 首次启动后端

在第一个 PowerShell 窗口中执行以下命令。

### 3.1 进入后端目录

```powershell
Set-Location .\backend
```

### 3.2 创建 Python 虚拟环境

```powershell
python -m venv .venv
```

该命令会在 `backend` 中创建 `.venv` 文件夹。首次创建可能需要等待一会儿。

### 3.3 激活虚拟环境

```powershell
.\.venv\Scripts\Activate.ps1
```

激活成功后，命令提示符前面通常会出现 `(.venv)`。

### 3.4 安装后端依赖

```powershell
python -m pip install -r requirements.txt
```

等待命令执行结束，并确认没有红色报错。

### 3.5 启动后端

```powershell
python -m uvicorn app.main:app --reload
```

启动成功后，终端中会出现类似信息：

```text
Uvicorn running on http://127.0.0.1:8000
```

不要关闭这个 PowerShell 窗口。

### 3.6 验证后端

用浏览器打开：

```text
http://127.0.0.1:8000/health
```

正常情况下会看到：

```json
{"status":"ok","service":"leetcode-copilot-api"}
```

还可以打开后端接口文档：

```text
http://127.0.0.1:8000/docs
```

首次启动后，项目会自动创建 SQLite 数据库：

```text
backend\data\leetcode_copilot.db
```

## 4. 首次启动前端

保持后端窗口继续运行，重新打开第二个 PowerShell 窗口。

按照第 2 节的方法，让第二个窗口进入项目根目录，然后执行以下命令。

### 4.1 进入前端目录

```powershell
Set-Location .\frontend
```

### 4.2 安装前端依赖

```powershell
npm install
```

等待命令执行结束，并确认没有红色报错。

### 4.3 启动前端

```powershell
npm run dev
```

启动成功后，终端中会出现类似信息：

```text
Local: http://localhost:5173/
```

不要关闭这个 PowerShell 窗口。

## 5. 验证完整功能

1. 用浏览器打开 `http://localhost:5173`。
2. 在欢迎页点击任意位置，进入学习工作区。
3. 打开“新建解析”，也可以直接访问 `http://localhost:5173/solve`。
4. 输入不少于 10 个字符的题目，例如：

   ```text
   给定一个整数数组 nums 和目标值 target，请返回两数之和的下标。
   ```

5. 点击“生成题目解析”。

未配置 DeepSeek API Key 时，项目会自动使用 Mock Provider，无需调用外部 AI 服务。运行正常时，页面会显示“两数之和”的解析结果，并提示学习记录已经保存。

至此，项目已经跑通。

## 6. 可选：配置 DeepSeek

基础运行不需要配置 DeepSeek。只有需要真实 AI 解析时，才执行本节。

先在后端 PowerShell 窗口中按 `Ctrl+C` 停止后端，然后确认当前位置是 `backend`。

如果还没有 `.env` 文件，执行：

```powershell
Copy-Item .env.example .env
```

用记事本打开配置文件：

```powershell
notepad .env
```

找到下面这一行，填写自己的 API Key：

```dotenv
DEEPSEEK_API_KEY=你的_API_Key
```

保存文件后，重新启动后端：

```powershell
python -m uvicorn app.main:app --reload
```

注意：

- `.env` 中的默认模型是 `deepseek-v4-flash`。
- 修改 `.env` 后应停止并重新启动后端。
- 不要把真实 API Key 发给别人，也不要提交到 Git。
- 如果删除 API Key 或将其留空，项目会恢复使用 Mock Provider。

## 7. 停止项目

分别切换到前端和后端的 PowerShell 窗口，在每个窗口中按：

```text
Ctrl+C
```

两个服务都停止后，项目才算完全关闭。

如果需要退出 Python 虚拟环境，可以在后端窗口执行：

```powershell
deactivate
```

## 8. 以后再次启动

依赖已经安装过时，不需要重复创建虚拟环境，也不需要每次执行 `npm install`。

### 后端窗口

从项目根目录执行：

```powershell
Set-Location .\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

### 前端窗口

从项目根目录执行：

```powershell
Set-Location .\frontend
npm run dev
```

然后访问：

```text
http://localhost:5173
```

只有项目依赖文件发生变化时，才需要重新执行：

```powershell
# 在 backend 目录执行
python -m pip install -r requirements.txt

# 在 frontend 目录执行
npm install
```

## 9. 常见问题

### PowerShell 提示禁止运行脚本

如果激活虚拟环境时出现 `running scripts is disabled`，先执行：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

再重新执行：

```powershell
.\.venv\Scripts\Activate.ps1
```

该设置只对当前 PowerShell 窗口有效。

### 提示 `No module named uvicorn`

通常是虚拟环境没有激活，或者依赖没有安装。确认当前目录是 `backend`，然后执行：

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### `npm run dev` 提示 Node.js 版本不支持

Vite 8 要求 Node.js 满足以下范围之一：

```text
^20.19.0
>=22.12.0
```

执行 `node --version` 检查当前版本。版本不符合时，需要更换 Node.js 版本后重新执行 `npm install`。

### 8000 或 5173 端口已被占用

通常是之前启动的服务没有停止。找到旧的 PowerShell 窗口并按 `Ctrl+C`。

也可以查看占用端口的进程：

```powershell
Get-NetTCPConnection -LocalPort 8000
Get-NetTCPConnection -LocalPort 5173
```

关闭旧服务后，再重新启动本项目。

### 前端提示无法连接后端

按以下顺序检查：

1. 后端 PowerShell 窗口是否仍在运行。
2. `http://127.0.0.1:8000/health` 是否能正常打开。
3. 后端是否确实运行在 8000 端口。
4. 前端和后端启动后，重新刷新浏览器页面。

### DeepSeek 调用失败

检查 `backend\.env` 中的 API Key、模型名和网络连接，然后重新启动后端。

如果暂时不需要真实 AI，可以将下面一项留空：

```dotenv
DEEPSEEK_API_KEY=
```

重启后端后，项目会使用 Mock Provider。

## 10. 跑通检查清单

- [ ] `http://127.0.0.1:8000/health` 返回 `status: ok`
- [ ] `http://127.0.0.1:8000/docs` 可以打开
- [ ] `http://localhost:5173` 可以打开
- [ ] 解题页面能够生成 Mock 解析结果
- [ ] 页面提示学习记录已经保存
- [ ] `backend\data\leetcode_copilot.db` 已自动创建
