# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖（包含开发依赖）
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段 - 使用 http-server（轻量级 HTTP 服务器）
FROM node:20-alpine AS production

WORKDIR /app

# 安装 http-server（使用 npm 安装，会自动处理依赖）
RUN npm install -g http-server

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 创建非 root 用户运行应用（安全优化）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# 暴露端口（通过环境变量 PORT 配置，默认 3001）
EXPOSE ${PORT:-3001}

# 启动静态文件服务（绑定到 0.0.0.0 允许容器外部访问）
CMD ["sh", "-c", "http-server dist -p ${PORT:-3001} -a 0.0.0.0 -c-1"]
