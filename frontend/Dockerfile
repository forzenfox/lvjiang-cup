# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段 - 使用 http-server（轻量级 HTTP 服务器，不含 Nginx）
FROM node:20-alpine

WORKDIR /app

# 安装 http-server（轻量级，只有几 MB）
RUN npm install -g http-server

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动静态文件服务
CMD ["http-server", "dist", "-p", "3000", "-c-1"]
