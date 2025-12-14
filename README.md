# Survey MVP

这是一个包含前端和后端的 monorepo 项目。

## 项目结构

```
survey-mvp/
├── frontend/          # Next.js 前端项目
│   ├── app/          # Next.js App Router
│   ├── package.json
│   └── next.config.js
├── backend/          # FastAPI 后端项目
│   ├── app/          # FastAPI 应用代码
│   ├── Dockerfile    # 后端容器化配置
│   ├── requirements.txt
│   └── pyproject.toml
└── docker-compose.yml # Docker Compose 配置
```

## 开发指南

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器将运行在 http://localhost:3000

### 后端开发

#### 方式 1: 本地运行

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

后端 API 将运行在 http://localhost:8000

#### 方式 2: Docker 运行

```bash
docker-compose up --build
```

后端 API 将运行在 http://localhost:8000

### API 文档

FastAPI 自动生成的 API 文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 构建与部署

### 前端构建

前端使用 Next.js 静态导出：

```bash
cd frontend
npm run build
```

构建产物位于 `frontend/out/` 目录，可直接部署到静态托管服务（如 Vercel、Netlify、S3 等）。

### 后端部署

后端使用 Docker 容器化：

```bash
cd backend
docker build -t survey-mvp-backend .
docker run -p 8000:8000 survey-mvp-backend
```

或使用 docker-compose：

```bash
docker-compose up -d
```

## 技术栈

### 前端
- Next.js 14 (App Router)
- React 18
- TypeScript

### 后端
- FastAPI
- Python 3.11
- Uvicorn

## License

MIT
