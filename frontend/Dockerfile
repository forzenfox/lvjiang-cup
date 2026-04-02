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

# 只安装 http-server（全局安装会产生额外层，改为本地安装）
COPY --from=builder /app/node_modules/http-server /app/node_modules/http-server
COPY --from=builder /app/node_modules/.bin /app/node_modules/.bin

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 创建非 root 用户运行应用（安全优化）
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# 暴露端口
EXPOSE 3001

# 启动静态文件服务
CMD ["node", "node_modules/http-server/bin/http-server", "dist", "-p", "3001", "-c-1"]
