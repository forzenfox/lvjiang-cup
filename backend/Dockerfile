# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包含开发依赖）
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:20-alpine AS production

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖（减小镜像大小）
RUN npm ci --only=production && \
    npm cache clean --force

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 创建数据目录并设置权限
RUN mkdir -p /app/data /app/backup /app/uploads && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app/data /app/backup /app/uploads

# 切换到非 root 用户（安全优化）
USER nodejs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/src/main.js"]
