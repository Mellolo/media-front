# 多阶段构建：构建阶段
FROM node:22-alpine3.20 AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci

# 复制项目源代码
COPY . .

# 构建项目
RUN npm run build

# 生产阶段
FROM node:22-alpine3.20

# 设置工作目录
WORKDIR /app

# 安装serve来运行静态文件
RUN npm install -g serve

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 9980

# 启动应用
CMD ["serve", "-s", "dist", "-l", "9980"]