# Docker 部署指南（Windows / Linux）

本文档帮你在本机用 **Docker Compose** 一键启动整套应用：**PostgreSQL + 后端 API + 前端页面（Nginx）**。

完成后浏览器访问：**http://localhost**（若改了端口则见下文）。

> 与 [deploy-local-windows.md](./deploy-local-windows.md)（Nginx + PM2）相比，Docker **不需要**单独安装 Node、PM2、Nginx、PostgreSQL，但需要安装 **Docker Desktop**。

---

## 一、架构说明

```text
浏览器  →  http://localhost:80
              ↓
         [frontend 容器 · Nginx]
              ├─ /          →  Vue 静态页面（frontend/dist）
              ├─ /api/*     →  反代到 backend:8089
              └─ /docs      →  反代到 backend:8089（Swagger）
              ↓
         [backend 容器 · Node]
              ↓
         [db 容器 · PostgreSQL]
```

三个容器由 **`docker-compose.yml`**（仓库根目录）统一编排。

| 容器                | 作用                                                  |
| ------------------- | ----------------------------------------------------- |
| `taskflow-db`       | PostgreSQL 16，数据持久化在 Docker 卷 `postgres_data` |
| `taskflow-backend`  | Express API，启动前自动 `prisma migrate deploy`       |
| `taskflow-frontend` | Nginx 托管前端并反代 API                              |

---

## 二、准备软件

### 1. 安装 Docker Desktop（Windows）

1. 打开 https://www.docker.com/products/docker-desktop/
2. 下载并安装 **Docker Desktop for Windows**。
3. 安装完成后**重启电脑**（若安装程序提示）。
4. 打开 Docker Desktop，等待左下角显示 **Engine running**。
5. 打开 **PowerShell**，验证：

```powershell
docker -v
docker compose version
```

两条命令都有版本号输出即可。

> **系统要求**：Windows 10/11 64 位，BIOS 中已开启虚拟化（VT-x/AMD-V）。若 WSL2 未安装，Docker Desktop 安装向导会引导安装。

### 2. 关闭冲突服务（重要）

Docker 默认占用 **80 端口**。若你按另一份文档装过 Nginx 或 PM2，先停掉：

```powershell
# 停 Nginx（若装在本机 C:\nginx）
cd C:\nginx
.\nginx.exe -s stop

# 停 PM2 / Node（若在本机跑过后端）
pm2 stop all
taskkill /F /IM node.exe
```

确认 80 端口空闲（无输出为正常）：

```powershell
Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue
```

---

## 三、配置环境变量

在仓库**根目录** `E:\AI\demo` 执行：

```powershell
cd E:\AI\demo
copy .env.docker.example .env
notepad .env
```

编辑 `.env`，至少修改：

```env
POSTGRES_PASSWORD=你的数据库强密码
JWT_SECRET=至少32位的随机字符串
APP_PORT=80
```

| 变量                | 说明                                     |
| ------------------- | ---------------------------------------- |
| `POSTGRES_PASSWORD` | PostgreSQL 容器内 `postgres` 用户密码    |
| `JWT_SECRET`        | 后端 JWT 密钥，生产环境务必用随机长串    |
| `APP_PORT`          | 浏览器访问端口，映射到容器内 Nginx 的 80 |

> **`.env` 已在 `.gitignore` 中，不要提交到 Git。**

---

## 四、一键启动

在仓库根目录执行：

```powershell
cd E:\AI\demo
docker compose up -d --build
```

**第一次**会下载镜像并编译前后端，可能需要 **5～15 分钟**，请耐心等待。

### 查看状态

```powershell
docker compose ps
```

三个服务都应为 **running**，`db` 的 `(healthy)` 表示数据库就绪。

### 查看日志（排错时用）

```powershell
# 全部日志
docker compose logs -f

# 只看后端
docker compose logs -f backend

# 只看数据库
docker compose logs -f db
```

按 **Ctrl + C** 退出日志跟踪（不会停止容器）。

---

## 五、浏览器验收

1. 打开 **http://localhost**（若 `APP_PORT=8080` 则访问 **http://localhost:8080**）。
2. 应看到登录/注册页。
3. **注册** → **登录** → 进入任务页。
4. 按 **F12 → Network**，请求应发往 **`/api/...`**（同源，由 Nginx 反代）。

**Swagger（可选）：** http://localhost/docs

**API 健康检查（PowerShell）：**

```powershell
curl http://localhost/api/
# 若 404 正常；可测根路径需直接打 backend 容器，一般不必
curl http://localhost/
# 应返回前端 HTML
```

---

## 六、常用命令

```powershell
cd E:\AI\demo

# 停止（保留数据）
docker compose stop

# 再次启动
docker compose start

# 停止并删除容器（数据卷 postgres_data 仍保留）
docker compose down

# 停止并删除容器 + 数据库数据（慎用！会清空库）
docker compose down -v

# 代码更新后重新构建并启动
docker compose up -d --build

# 只重建某一服务
docker compose up -d --build backend
docker compose up -d --build frontend
```

---

## 七、代码更新后怎么发版

```powershell
cd E:\AI\demo
git pull
git submodule update --remote --merge

docker compose up -d --build
```

- 后端、前端代码分别在 [ltqm/backend](https://github.com/ltqm/backend) 与 [ltqm/frontend](https://github.com/ltqm/frontend) 维护；本仓库通过 submodule 引用。
- 若只改了后端或前端，可在对应子仓库 `git push` 后，于本仓库执行 `git submodule update --remote` 再重建镜像。
- 后端镜像重建时会自动执行 **`prisma migrate deploy`**。
- 前端若 API 地址仍是 `/api`（同源），一般**无需**改构建参数。

---

## 八、端口与访问地址

| 场景               | 配置                                                    |
| ------------------ | ------------------------------------------------------- |
| 默认               | `APP_PORT=80` → http://localhost                        |
| 80 被占用          | `.env` 里设 `APP_PORT=8080`，访问 http://localhost:8080 |
| 局域网其他设备访问 | Docker Desktop 设置中允许；防火墙放行对应端口           |

前端构建时使用 **`VITE_API_BASE_URL=/api`**（相对路径），与 Nginx 同源反代配合，**换端口不必重新改 API 地址**。

---

## 九、与「远程 PostgreSQL」的区别

本 Docker 方案使用 **Compose 自带的 PostgreSQL 容器**，数据库在 Docker 卷里，**不连接**你服务器 `110.42.189.42` 上的库。

若要用外部已有数据库，需修改 `docker-compose.yml` 中 `backend` 的 `DATABASE_URL`，并去掉或停用 `db` 服务（进阶操作，小白建议先用自带数据库跑通）。

---

## 十、常见问题

### 1. `docker compose up` 很慢或失败

- 确认 Docker Desktop 已 **Engine running**。
- 国内网络可配置 Docker 镜像加速（Docker Desktop → Settings → Docker Engine）。
- 查看具体错误：`docker compose logs backend`。

### 2. `port is already allocated`（80 端口被占）

- 改 `.env`：`APP_PORT=8080`，再 `docker compose up -d`。
- 或停掉本机 Nginx / IIS / 其他占 80 的程序。

### 3. 页面能开，登录报网络错误

```powershell
docker compose ps          # backend 是否 running
docker compose logs backend  # 是否有数据库连接错误
```

常见原因：第一次 `db` 未 healthy 就启动了 backend，执行：

```powershell
docker compose restart backend
```

### 4. 后端报 `prisma migrate` 失败

```powershell
docker compose logs backend
```

确认 `db` 为 healthy：`docker compose ps`。

### 5. 想完全重来（清空数据库）

```powershell
docker compose down -v
docker compose up -d --build
```

会删除 `postgres_data` 卷，**所有用户与任务数据清空**。

### 6. Windows 上构建 backend 很慢

`bcrypt` 等原生模块在镜像内编译，首次 `--build` 偏慢属正常；之后会利用 Docker 缓存。

### 7. 和本机 `npm run dev` 的关系

Docker 模式与开发模式**不要同时占同一端口**。开发时：

```powershell
docker compose stop
cd backend && npm run dev
cd frontend && npm run dev
```

---

## 十一、相关文件索引

| 文件                           | 作用                   |
| ------------------------------ | ---------------------- |
| `docker-compose.yml`           | 三容器编排             |
| `.env.docker.example`          | 环境变量模板           |
| `.env`                         | 本地实际配置（勿提交） |
| `backend/Dockerfile`           | 后端镜像               |
| `backend/docker-entrypoint.sh` | 迁移 + 启动            |
| `frontend/Dockerfile`          | 前端构建 + Nginx 镜像  |
| `frontend/nginx.conf`          | 静态资源与 `/api` 反代 |

---

## 十二、检查清单

- [ ] `docker -v`、`docker compose version` 正常
- [ ] 根目录 `.env` 已配置 `POSTGRES_PASSWORD`、`JWT_SECRET`
- [ ] `docker compose up -d --build` 成功
- [ ] `docker compose ps` 三个服务 running，`db` healthy
- [ ] http://localhost 能注册登录
- [ ] Network 面板请求为 `/api/...` 且 200

---

## 十三、部署到 Linux 服务器（简要）

在已安装 Docker 的 Linux VPS 上步骤相同：

```bash
git clone --recurse-submodules https://github.com/ltqm/TaskFlow.git
cd TaskFlow
cp .env.docker.example .env
# 编辑 .env
docker compose up -d --build
```

若已 `git clone` 但未带子模块：

```bash
git submodule update --init --recursive
```

生产环境建议：

- 使用强密码与随机 `JWT_SECRET`
- 用域名 + 外层 Nginx/Caddy 做 HTTPS，或把 `frontend` 端口改为仅内网暴露
- 定期备份 Docker 卷：`docker run --rm -v taskflow_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/pg-backup.tar.gz /data`

更多接口说明见 [api.md](../api.md)。
