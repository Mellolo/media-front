.PHONY: deploy build-push

# 一键部署到NAS（本地构建 + 上传 + 运行）
deploy:
	@echo "一键部署到 NAS..."
	chmod +x deploy-to-nas.sh
	./deploy-to-nas.sh

# 构建并推送镜像到Registry
build-push:
	@echo "构建并推送镜像..."
	chmod +x build-and-push.sh
	./build-and-push.sh
