#!/bin/bash

# 部署脚本用于构建和运行media-front应用的Docker容器

set -e  # 遇到错误时退出

echo "开始部署 media-front 应用..."

# 构建Docker镜像
echo "1. 构建Docker镜像..."
docker build -t media-front .

# 检查是否已经运行着同名容器
echo "2. 检查现有容器..."
if [ "$(docker ps -aq -f name=media-front)" ]; then
    echo "停止并移除现有容器..."
    docker stop media-front || true
    docker rm media-front || true
fi

# 运行容器
echo "3. 运行容器..."
docker run -d \
  --name media-front \
  -p 9980:9980 \
  media-front

echo "4. 验证容器运行状态..."
sleep 5
if [ "$(docker ps -q -f name=media-front)" ]; then
    echo "容器已成功启动！"
    echo "应用可以通过 http://localhost:9980 访问"
    echo "查看容器日志: docker logs media-front"
    echo "停止容器: docker stop media-front"
else
    echo "容器启动失败，请检查日志: docker logs media-front"
    exit 1
fi