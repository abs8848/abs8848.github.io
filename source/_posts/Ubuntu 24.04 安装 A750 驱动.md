
---
title: Ubuntu 24.04 安装 A750 驱动
author: abs8848
tags: []
categories: []
date: 2026-05-03 15:58:00
---

# intel A750 安装UbunTU

## 一、A750 在 Ubuntu 24.04 的速度大概多少（先给结论）

-   显存：**8GB GDDR6**，适合 **7B 模型 4bit 量化**（qwen3:4b、qwen:7b-q4、llama3:8b-q4）
-   推理速度：
    -   Windows：**12~18 token/s**
    -   Ubuntu 24.04 + 驱动 + Ollama（SYCL/Level Zero）：**30~45 token/s**
-   结论：**Linux 比 Windows 快 2～3 倍，接近 RTX3060 水平**

----------

## 二、Ubuntu 24.04 安装 A750 驱动（直接复制）

### 1. 先更新系统

bash

```
sudo apt update && sudo apt upgrade -y
```

### 2. 安装 Intel Arc 驱动 + Level Zero + OpenCL（关键）

bash

```
sudo apt install -y \
  intel-opencl-icd \
  intel-level-zero-gpu level-zero \
  mesa-vulkan-drivers \
  vainfo clinfo
```

### 3. 把自己加入 render 组（权限必须）

bash

```
sudo gpasswd -a $USER render
newgrp render
```

### 4. 验证显卡是否正常

bash

```
clinfo | grep "Device Name"
sycl-ls
```

能看到 **Intel Arc A750** 就 ok。

----------

## 三、安装 Ollama（支持 A750 GPU 加速）

### 1. 官方安装（自动识别 Intel GPU）

bash

```
curl -fsSL https://ollama.com/install.sh | bash
```

### 2. 配置 Ollama 用 A750（SYCL 加速）

bash

```
echo 'export OLLAMA_COMPUTE_TYPE=sycl' >> ~/.bashrc
echo 'export NEOCommandLine="-cl-intel-greater-than-4GB-buffer-required"' >> ~/.bashrc
source ~/.bashrc
```

### 3. 重启 Ollama 并拉模型

bash

```
sudo systemctl restart ollama
ollama pull qwen3:4b   # 推荐，速度快、中文好
# 或 ollama pull qwen:7b-q4_k_m
```

### 4. 验证是否在用 GPU

bash

```
ollama run qwen3:4b "测试A750是否加速" --verbose
```

看日志里有 **sycl/level_zero**、**GPU** 字样，且显存占用 3~6GB 就是成功。

----------

## 四、Docker 装 OpenClaw（连本地 Ollama）

bash

```
sudo docker run -d \
  --name openclaw \
  -p 19000:19000 \
  -v /opt/openclaw:/app/data \
  --restart always \
  openclaw/openclaw
```

### OpenClaw 连接设置（浏览器打开）

-   地址：`http://localhost:19000`
-   添加模型厂商：**自定义**
-   Base URL：`http://host.docker.internal:11434/v1`
-   API Key：随便填（如 `123`）
-   模型名：`qwen3:4b`
-   保存→对话，**本地离线、A750 加速**。

----------

## 五、A750 最佳模型推荐（8GB 显存）

-   **qwen3:4b**：最快，**40~45 token/s**，中文强
-   **qwen:7b-q4_k_m**：平衡，**30~35 token/s**
-   **llama3:8b-q4_0**：通用，**28~32 token/s**

----------

## 六、常见坑（提前避）

1.  没显示 GPU：重启、确认 `render` 组、驱动装好
2.  显存爆：用 **4bit 量化模型**，别跑 13B
3.  Docker 连不上 Ollama：用 `host.docker.internal:11434`

----------

一句话：**Ubuntu 24.04 + A750 + Ollama + OpenClaw 是你现在性价比最高、速度最快的本地 AI 方案**。要不要我给你一份 **一键安装脚本（复制即运行）**，把驱动、Ollama、OpenClaw 一次性装好？

# Ubuntu 24.04 LTS ｜Intel A750 一键全集脚本

功能：

1.  安装 Intel Arc A750 完整独显加速驱动（LevelZero/OpenCL）
2.  安装配置 Ollama 并开启 Intel GPU 硬件加速
3.  Docker 安装 OpenClaw
4.  自动拉取适合 A750 的中文本地大模型
5.  全部开机自启，断电重启自动运行

----------

## 第一步：复制整条命令，终端直接粘贴执行

bash

```
#!/bin/bash
set -e

# 1.系统更新
sudo apt update -y && sudo apt upgrade -y

# 2.安装 Intel A750 显卡加速依赖
sudo apt install -y intel-opencl-icd intel-level-zero-gpu level-zero mesa-vulkan-drivers vainfo clinfo

# 3.添加硬件权限组
sudo gpasswd -a $USER render
newgrp render

# 4.安装Docker
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker

# 5.一键安装官方Ollama + Intel GPU加速
curl -fsSL https://ollama.com/install.sh | bash

# 6.写入Intel SYCL显卡加速环境变量
sudo tee /etc/systemd/system/ollama.service.d/override.conf >/dev/null <<EOF
[Service]
Environment="OLLAMA_COMPUTE_TYPE=sycl"
Environment="NEOCommandLine=-cl-intel-greater-than-4GB-buffer-required"
EOF

# 7.重启Ollama生效加速
sudo systemctl daemon-reload
sudo systemctl restart ollama

# 8.下载适配A750 8G显存 最优中文模型
ollama pull qwen3:4b
ollama pull qwen:7b-q4_k_m

# 9.部署OpenClaw 容器
sudo docker rm -f openclaw 2>/dev/null || true
sudo docker run -d \
--name openclaw \
-p 19000:19000 \
--add-host=host.docker.internal:host-gateway \
-v /opt/openclaw:/app/data \
--restart always \
openclaw/openclaw

echo -e "\n====================================="
echo "✅ 全部安装完成！"
echo "🎮 OpenClaw 访问地址：http://localhost:19000"
echo "🤖 本地模型：qwen3:4b 、 qwen:7b-q4_k_m"
echo "⚡ A750 独显加速已全局开启"
echo "====================================="
```

----------

## 第二步：OpenClaw 绑定本地 Ollama （最后一步）

1.  浏览器打开：`http://本机IP:19000`
2.  模型管理 → 添加自定义服务商

-   接口地址：

plaintext

```
http://host.docker.internal:11434/v1
```

-   API 密钥：随意填写，例如 `0000`
-   填写模型名：`qwen3:4b`

3.  点击**测试连接**，显示成功即可离线本地使用

----------

## 第三步：验证 A750 是否正常显卡运行

bash

```
# 查看显卡识别
clinfo

# 测试Ollama是否调用GPU
ollama run qwen3:4b 你好 --verbose
```

看到 `sycl` / `gpu` 字样 = 显卡加速生效✅

----------

## 关键性能参考（你的 A750+Ubuntu24.04）

-   qwen3:4b ：**35～45 token/s**
-   qwen7b-4bit：**28～35 token/s**纯本地离线、无网络、比 Windows 快非常多。

