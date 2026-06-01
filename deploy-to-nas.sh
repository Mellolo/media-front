#!/bin/bash

# 一键部署脚本：本地构建镜像，上传到NAS并运行
# 使用方法: ./deploy-to-nas.sh

set -e

# ============ 配置区域 ============
NAS_HOST="192.168.5.178"
NAS_USER="mellolo"
APP_PORT="9980"
PROJECT_NAME="media-front"
IMAGE_FILE="${PROJECT_NAME}.tar.gz"
# ==================================

echo "======================================"
echo "  一键部署 media-front 到 NAS"
echo "======================================"
echo ""
echo "目标服务器: ${NAS_USER}@${NAS_HOST}"
echo "应用端口: ${APP_PORT}"
echo ""

# 步骤1: 构建Docker镜像
echo "[1/4] 构建 Docker 镜像..."
docker build -f Dockerfile.nginx -t ${PROJECT_NAME}:latest .
echo "✓ 构建完成"
echo ""

# 步骤2: 导出镜像文件
echo "[2/4] 导出镜像文件..."
docker save ${PROJECT_NAME}:latest | gzip > ${IMAGE_FILE}
echo "✓ 导出完成: ${IMAGE_FILE}"
echo "  文件大小: $(du -h ${IMAGE_FILE} | cut -f1)"
echo ""

# 步骤3: 上传镜像到NAS
echo "[3/4] 上传镜像到 NAS..."
scp ${IMAGE_FILE} ${NAS_USER}@${NAS_HOST}:~/
echo "✓ 上传完成"
echo ""

# 步骤4: 在NAS上导入并运行容器
echo "[4/4] 在 NAS 上部署..."
ssh ${NAS_USER}@${NAS_HOST} << 'ENDSSH'
set -e
PROJECT_NAME="media-front"
IMAGE_FILE="media-front.tar.gz"
APP_PORT="9980"

echo "导入镜像..."
sudo docker load -i ~/${IMAGE_FILE}
echo "✓ 导入完成"

echo "停止旧容器..."
sudo docker stop ${PROJECT_NAME} 2>/dev/null || true
sudo docker rm ${PROJECT_NAME} 2>/dev/null || true
echo "✓ 清理完成"

echo "启动新容器..."
sudo docker run -d \
  -p ${APP_PORT}:${APP_PORT} \
  --name ${PROJECT_NAME} \
  --restart=always \
  ${PROJECT_NAME}:latest
echo "✓ 启动完成"

echo "清理临时文件..."
rm -f ~/${IMAGE_FILE}
echo "✓ 清理完成"

echo ""
echo "验证容器状态..."
sudo docker ps | grep ${PROJECT_NAME}
ENDSSH

echo ""
echo "======================================"
echo "  部署成功！"
echo "======================================"
echo ""
echo "访问地址: http://${NAS_HOST}:${APP_PORT}"
echo ""
echo "管理命令:"
echo "  查看日志: ssh ${NAS_USER}@${NAS_HOST} 'sudo docker logs -f ${PROJECT_NAME}'"
echo "  重启服务: ssh ${NAS_USER}@${NAS_HOST} 'sudo docker restart ${PROJECT_NAME}'"
echo "  停止服务: ssh ${NAS_USER}@${NAS_HOST} 'sudo docker stop ${PROJECT_NAME}'"
echo ""

# 清理本地临时文件
echo "清理本地临时文件..."
rm -f ${IMAGE_FILE}
echo "✓ 完成"