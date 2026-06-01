# Docker 部署方案

## 两步部署流程

### 步骤1: 本地构建并推送镜像
```bash
./build-and-push.sh
```
将镜像推送到NAS Registry (192.168.5.178:5000)

### 步骤2: NAS上部署

#### 方式A: 上传脚本执行
```bash
scp deploy-on-nas.sh mellolo@192.168.5.178:~/deploy-on-nas-front.sh
ssh mellolo@192.168.5.178
chmod +x ~/deploy-on-nas-front.sh && ./deploy-on-nas-front.sh
```

#### 方式B: 手动执行
```bash
ssh mellolo@192.168.5.178
docker pull 192.168.5.178:5000/media-front:latest
docker stop media-front || true && docker rm media-front || true
docker run -d -p 9980:9980 --name media-front --restart=always 192.168.5.178:5000/media-front:latest
```

---

## 完成后

访问: http://192.168.5.178:9980

查看日志: `sudo docker logs -f media-front` (在NAS上执行)

---

## 前置配置

Docker Desktop → Settings → Docker Engine，添加:
```json
{
  "insecure-registries": [
    "192.168.5.178:5000"
  ]
}
```
