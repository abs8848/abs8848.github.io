---
title: OpenClaw Zero Token Windows一键启动脚本及WSL配置清单
date: 2026-05-03 17:06:00
tags: []
categories: []

---

# OpenClaw Zero Token Windows一键启动脚本及WSL配置清单

# 一、Windows一键启动脚本（.bat）

说明：双击运行即可启动Chrome调试模式（无需手动输命令、关闭现有Chrome），启动后会自动打开Chrome调试验证页面，脚本可放在任意文件夹（如桌面），命名为「OpenClaw_Chrome调试启动.bat」。

```batch
@echo off
:: 关闭所有Chrome进程（避免调试端口占用）
taskkill /f /im chrome.exe >nul 2>&1
:: 启动Chrome调试模式（端口9222，独立配置目录）
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=%USERPROFILE%\ChromeDebug
:: 延迟2秒，打开调试验证页面
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:9222/json
:: 提示信息
echo Chrome调试模式已启动，验证页面已打开！
echo 注意：请勿关闭此命令行窗口，关闭则Chrome调试模式终止。
pause
```

补充：若Chrome安装路径不同（如32位、自定义路径），修改第5行的Chrome.exe路径即可，常见备选路径：

-   32位系统："C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
-   自定义路径：根据自己的Chrome安装目录修改（右键Chrome快捷方式→属性→目标，复制路径即可）

# 二、WSL配置清单（复制即用，逐块执行）

说明：打开WSL终端（Ubuntu），复制以下命令，逐段粘贴执行（每粘贴一段按回车，等待执行完成再粘贴下一段），无需手动输入，避免输错。

## 1. 基础依赖安装（Node.js + pnpm）

```bash
# 更新系统软件包
sudo apt update && sudo apt upgrade -y

# 安装Node.js（>=22.12.0，适配项目需求）
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 验证Node.js版本（确保>=22.12.0）
node -v

# 安装pnpm（>=9.0.0）
npm install -g pnpm

# 验证pnpm版本（确保>=9.0.0）
pnpm -v
```

## 2. 安装WSL版Chrome（调试必需）

```bash
# 下载Chrome安装包
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# 安装Chrome，自动修复依赖
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt -f install -y

# 验证Chrome安装（可选）
google-chrome --version
```

## 3. 项目克隆与构建

```bash
# 克隆项目（若已克隆，可跳过此步）
git clone https://github.com/linuxhsj/openclaw-zero-token.git

# 进入项目目录
cd openclaw-zero-token

# 安装项目依赖
pnpm install

# 构建项目
pnpm build
pnpm ui:build
```

## 4. 常用命令快捷清单（复制即用）

```bash
# 1. 启动WSL版Chrome调试（推荐，替代Windows脚本）
./start-chrome-debug.sh

# 2. 认证捕获（Chrome调试启动后，新开终端执行）
./onboard.sh webauth

# 3. 启动OpenClaw网关
./server.sh start

# 4. 网关状态/停止/重启
./server.sh status
./server.sh stop
./server.sh restart

# 5. 生成32位Gateway Token（PowerShell中执行，复制到配置文件）
-join ((65..90)+(97..122)+(48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

# 三、使用说明

1.  脚本使用：双击.bat文件，自动启动Chrome调试模式，验证页面打开后，确认能看到调试接口信息即可。
2.  WSL配置：逐段复制命令执行，若某一步报错，优先执行「sudo apt update && sudo apt upgrade -y」更新系统，再重新执行报错步骤。
3.  后续使用：每次启动时，先运行.bat脚本（启动Chrome调试），再在WSL中执行「./server.sh start」启动网关，即可正常使用。

# 四、常见问题修复（脚本/配置报错用）

-   bat脚本报错“找不到Chrome.exe”：修改脚本中Chrome路径，参考上方“补充”内容。
-   WSL中“wget: command not found”：执行「sudo apt install -y wget」安装wget。
-   pnpm安装失败：确保Node.js版本达标，若仍失败，执行「npm cache clean -f」后重新安装pnpm。