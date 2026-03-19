# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
# 注意：API 地址通过运行时配置，不在构建时指定
RUN npm run build

# 生产阶段 - 使用 Nginx
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 注意：
# 1. nginx.conf 通过 docker-compose 外挂挂载
# 2. config.js 通过 docker-compose 外挂挂载，支持运行时配置 API 地址

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
