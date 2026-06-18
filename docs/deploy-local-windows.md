# 本地部署指南（Windows · Nginx + PM2）

本文档帮你在**本机 Windows** 上，用接近生产的方式跑通项目：**Nginx** 提供网页 + 反代 API，**PM2** 守护后端进程。

完成后浏览器访问：**[http://localhost](http://localhost)**（不再是 Vite 的 5173 开发端口）。

---

## 一、你会得到什么

```text
浏览器  →  http://localhost          →  Nginx  →  frontend/dist 静态页面
浏览器  →  http://localhost/api/...  →  Nginx  →  反代到 127.0.0.1:8089（Node 后端）
后端    →  PostgreSQL（本机或远程数据库）
```

与 `npm run dev` 的区别：


| 方式            | 前端       | 后端                    | 适合     |
| ------------- | -------- | --------------------- | ------ |
| `npm run dev` | Vite 热更新 | ts-node-dev           | 日常改代码  |
| **本文档**       | 构建后的静态文件 | 编译后的 `dist/server.js` | 体验上线效果 |


---

## 二、准备软件（按顺序安装）

### 1. Node.js（必须）

1. 打开 [https://nodejs.org/](https://nodejs.org/) ，下载 **LTS（20.x）** 安装包。
2. 安装时勾选 **Add to PATH**。
3. 打开 **PowerShell**，验证：

```powershell
node -v    # 应显示 v20.x.x
npm -v
```

### 2. PM2（必须）

PM2 用来让后端在后台稳定运行、崩溃自动重启。

```powershell
npm install -g pm2
pm2 -v
```

### 3. Nginx for Windows（必须）

1. 打开 [https://nginx.org/en/download.html](https://nginx.org/en/download.html)
2. 下载 **Stable version** 的 **nginx/Windows-x.x.x** 压缩包。
3. 解压到例如 `**C:\nginx`**（路径不要含中文和空格）。
4. 验证（先不要关这个窗口）：

```powershell
cd C:\nginx
.\nginx.exe
```

浏览器打开 [http://localhost](http://localhost) 若看到 “Welcome to nginx!” 说明成功。

> **停止 Nginx**（后面改配置时会用到）：
>
> ```powershell
> cd C:\nginx
> .\nginx.exe -s stop
> ```

### 4. PostgreSQL（二选一）

**方案 A — 用你已有的远程库（省事，推荐先试）**

- 你之前已在 `**110.42.189.42`** 上建过 `task_reminder` 库，本机后端连远程库即可。
- 需保证：服务器 **5432 端口** 对你本机 IP 开放（云安全组 + PostgreSQL 允许远程连接）。

**方案 B — 本机安装 PostgreSQL**

- 下载：[https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
- 安装后记下：用户名（通常 `postgres`）、密码、端口（通常 `5432`）。
- 用 pgAdmin 或命令行建库：

```sql
CREATE DATABASE task_reminder;
```

---

## 三、项目路径约定

下文默认项目在：

```text
E:\AI\demo
```

若你的路径不同，后面 Nginx 配置里把 `E:/AI/demo` 改成你的实际路径即可。

---

## 四、部署步骤

### 步骤 0：关掉开发模式（避免端口冲突）

若之前开过 `npm run dev`，先在对应终端按 **Ctrl + C** 停掉前后端。

确认 8089 没被占用（无输出或报错可忽略）：

```powershell
Get-NetTCPConnection -LocalPort 8089 -State Listen -ErrorAction SilentlyContinue
```

---

### 步骤 1：配置后端环境变量

```powershell
cd E:\AI\demo\backend
copy .env.example .env
notepad .env
```

编辑 `backend\.env`，至少改这三项：

**若用远程库（方案 A）：**

```env
PORT=8089
JWT_SECRET=请改成至少32位的随机字符串
DATABASE_URL="postgresql://postgres:你的密码@110.42.189.42:5432/task_reminder?schema=public"
```

**若用本机库（方案 B）：**

```env
PORT=8089
JWT_SECRET=请改成至少32位的随机字符串
DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/task_reminder?schema=public"
```

> `JWT_SECRET` 可临时用一长串字母数字，不要用 `your-secret`。

---

### 步骤 2：安装依赖、编译后端、执行数据库迁移

```powershell
cd E:\AI\demo\backend
npm ci
npm run build
npx prisma migrate deploy
```

**期望结果：**

- `npm run build` 无报错，出现 `backend\dist\` 目录。
- `migrate deploy` 显示迁移已成功（或 “No pending migrations”）。

**快速自检后端能否启动：**

```powershell
node dist/server.js
```

看到 `Server running on http://localhost:8089` 后，**Ctrl + C** 停掉（下一步用 PM2 启动）。

另开一个 PowerShell 测试（可选）：

```powershell
curl http://127.0.0.1:8089/
```

应返回类似：`{"code":0,"data":{...},"msg":""}`

---

### 步骤 3：用 PM2 启动后端

```powershell
cd E:\AI\demo\backend
pm2 start dist/server.js --name taskflow-api
pm2 status
pm2 logs taskflow-api --lines 20
```

**常用 PM2 命令：**

```powershell
pm2 restart taskflow-api    # 重启（改 .env 或重新 build 后）
pm2 stop taskflow-api       # 停止
pm2 delete taskflow-api     # 删除进程
pm2 save                    # 保存当前进程列表
```

再次验证：

```powershell
curl http://127.0.0.1:8089/
```

---

### 步骤 4：构建前端（生产模式）

前端 API 地址在**构建时**写死，本地 Nginx 反代要用 `**http://localhost/api`**：

```powershell
cd E:\AI\demo\frontend
npm ci
```

创建生产环境变量文件：

```powershell
Set-Content -Path .env.production -Encoding utf8 -Value "VITE_API_BASE_URL=http://localhost/api"
```

构建：

```powershell
npm run build
```

成功后会有目录：`**E:\AI\demo\frontend\dist**`（内含 `index.html`）。

---

### 步骤 5：配置 Nginx

1. 先停止 Nginx（若正在运行）：

```powershell
cd C:\nginx
.\nginx.exe -s stop
```

1. 用记事本打开 `**C:\nginx\conf\nginx.conf**`。
2. 在 `http { ... }` 块内，**注释掉或删除** 默认的 `server { listen 80; ... }`（Welcome 页面那个），**替换为**下面整段（注意路径）：

```nginx
server {
    listen       80;
    server_name  localhost;

    # 前端静态文件（改成你的 dist 绝对路径，Windows 建议用正斜杠）
    root   E:/AI/demo/frontend/dist;
    index  index.html;

    # 前端 SPA：刷新子路由时不 404
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反代到 PM2 里的 Node 后端
    location /api/ {
        proxy_pass http://127.0.0.1:8089/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 6m;
    }

    # 可选：Swagger 文档
    location /docs {
        proxy_pass http://127.0.0.1:8089/docs;
    }
}
```

1. 检查配置并启动：

```powershell
cd C:\nginx
.\nginx.exe -t
.\nginx.exe
```

`nginx.exe -t` 必须显示 **syntax is ok** / **test is successful**。

---

### 步骤 6：浏览器验收

1. 打开 **[http://localhost](http://localhost)**
2. 应看到登录/注册页面（不是 Nginx 欢迎页）。
3. **注册**一个新账号 → **登录** → 进入任务页。
4. 按 **F12** → **Network**，操作时应看到请求发往 `**http://localhost/api/...`** 且状态 200。

**API 文档（可选）：** [http://localhost/docs](http://localhost/docs)

---

## 五、以后改代码怎么更新

### 只改了后端

```powershell
cd E:\AI\demo\backend
npm run build
pm2 restart taskflow-api
```

若 Pull 了带新迁移的代码：

```powershell
npx prisma migrate deploy
pm2 restart taskflow-api
```

### 只改了前端

```powershell
cd E:\AI\demo\frontend
npm run build
cd C:\nginx
.\nginx.exe -s reload
```

浏览器 **Ctrl + F5** 强刷。

### 前后端都改了

两边都 build，再 `pm2 restart taskflow-api` 和 `nginx -s reload`。

---

## 六、完全停止本地部署

```powershell
pm2 stop taskflow-api
cd C:\nginx
.\nginx.exe -s stop
```

若要恢复日常开发：

```powershell
cd E:\AI\demo\backend
npm run dev

# 另开终端
cd E:\AI\demo\frontend
npm run dev
```

前端开发地址：**[http://localhost:5173](http://localhost:5173)**

---

## 七、常见问题

### 1. 打开 [http://localhost](http://localhost) 仍是 “Welcome to nginx!”

- 说明还在用默认 `server` 块，检查 `nginx.conf` 是否已替换并 `nginx.exe -s reload`。

### 2. 页面能开，但登录报网络错误

- F12 看请求 URL 是否为 `http://localhost/api/...`。
- 若仍是 `http://localhost:8089/api`，说明前端构建时没设 `.env.production`，重新执行 **步骤 4**。
- 确认 PM2 在跑：`pm2 status`，`curl http://127.0.0.1:8089/`。

### 3. 后端启动报数据库错误


| 报错                        | 处理                                              |
| ------------------------- | ----------------------------------------------- |
| `Database does not exist` | 在 PostgreSQL 里 `CREATE DATABASE task_reminder;` |
| `Connection refused` / 超时 | 检查 `DATABASE_URL`、远程库安全组、5432 是否开放              |
| 密码错误                      | 核对 `.env` 里密码                                   |


### 4. `nginx.exe -t` 报错

- 路径不要用反斜杠 `\`，改用 `**E:/AI/demo/frontend/dist`**。
- 每条语句末尾要有分号 `;`。
- 大括号 `{}` 要成对。

### 5. 80 端口被占用

```powershell
Get-NetTCPConnection -LocalPort 80 -State Listen
```

可改 Nginx 为 `listen 8080;`，然后访问 **[http://localhost:8080](http://localhost:8080)**（同时 `.env.production` 里 API 也要改成 `http://localhost:8080/api` 并重新 build 前端）。

### 6. PM2 命令找不到

重新打开 PowerShell，或执行：

```powershell
npm install -g pm2
```

---

## 八、检查清单（部署完成打勾）

- `node -v`、`pm2 -v` 正常
- `backend\.env` 已配置 `DATABASE_URL`、`JWT_SECRET`、`PORT=8089`
- `npm run build`（backend）成功
- `npx prisma migrate deploy` 成功
- `pm2 status` 中 `taskflow-api` 为 **online**
- `frontend\.env.production` 为 `VITE_API_BASE_URL=http://localhost/api`
- `frontend\dist\index.html` 存在
- Nginx `nginx.exe -t` 通过
- [http://localhost](http://localhost) 能注册登录

---

## 九、相关文件索引


| 文件                         | 作用                    |
| -------------------------- | --------------------- |
| `backend/.env`             | 后端端口、数据库、JWT（勿提交 Git） |
| `frontend/.env.production` | 生产构建时的 API 地址         |
| `frontend/dist/`           | Nginx 托管的前端产物         |
| `backend/dist/server.js`   | PM2 启动的后端入口           |
| `C:\nginx\conf\nginx.conf` | Nginx 主配置             |


更多接口说明见仓库根目录 [api.md](../api.md)。