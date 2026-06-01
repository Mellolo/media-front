.PHONY: build-push upload-deploy-script

# Docker Registry 部署（Registry已安装）
# 构建并推送镜像到Registry
build-push:
	@echo "构建并推送镜像..."
	chmod +x build-and-push.sh
	./build-and-push.sh

# 上传部署脚本到NAS
upload-deploy-script:
	@echo "上传部署脚本到NAS..."
	scp deploy-on-nas.sh mellolo@192.168.5.178:~/deploy-on-nas-front.sh
