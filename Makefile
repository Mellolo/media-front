.PHONY: deploy build-push

# 在NAS上部署（拉取镜像 + 运行容器）- 在NAS服务器上执行
deploy:
	@chmod +x deploy-to-nas.sh
	./deploy-to-nas.sh

# 构建并推送镜像到Registry - 在本地执行
build-push:
	@echo "构建并推送镜像..."
	chmod +x build-and-push.sh
	./build-and-push.sh
