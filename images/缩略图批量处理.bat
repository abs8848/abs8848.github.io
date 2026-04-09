@echo off
chcp 65001 >nul
echo ========================================
echo   博客缩略图批量调整工具
echo   输出尺寸: 240 x 135 像素 (16:9)
echo ========================================
echo.

:: 设置输出尺寸
set WIDTH=240
set HEIGHT=135

:: 创建输出文件夹
if not exist "output" mkdir output

echo 请拖放图片文件或文件夹到此处，按回车继续...
echo 或者直接输入图片路径（支持通配符如 *.jpg）:
set /p INPUT=

:: 如果输入为空，查找当前目录下的图片
if "%INPUT%"=="" (
    set "INPUT=*.jpg *.jpeg *.png *.gif *.bmp"
)

echo.
echo 正在处理图片，请稍候...
echo.

:: 使用 PowerShell 进行图片处理
powershell -ExecutionPolicy Bypass -Command "
Add-Type -AssemblyName System.Drawing

$width = %WIDTH%
$height = %HEIGHT%

# 获取输入文件
$inputPath = '%INPUT%'
$files = @()

if (Test-Path $inputPath) {
    if (Test-Path $inputPath -PathType Container) {
        $files = Get-ChildItem -Path $inputPath -Include *.jpg,*.jpeg,*.png,*.gif,*.bmp -Recurse
    } else {
        $files = Get-ChildItem -Path $inputPath
    }
}

if ($files.Count -eq 0) {
    Write-Host '没有找到图片文件！' -ForegroundColor Red
    Write-Host '请确保图片格式为: jpg, jpeg, png, gif, bmp' -ForegroundColor Yellow
    Read-Host
    exit
}

$count = 0
foreach ($file in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $bitmap = New-Object System.Drawing.Bitmap($width, $height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($img, 0, 0, $width, $height)
        
        $outputPath = Join-Path 'output' $file.Name
        $bitmap.Save($outputPath, $img.RawFormat)
        
        $graphics.Dispose()
        $bitmap.Dispose()
        $img.Dispose()
        
        Write-Host '[OK] ' $file.Name -ForegroundColor Green
        $count++
    } catch {
        Write-Host '[FAIL] ' $file.Name ': ' $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ''
Write-Host '处理完成！共处理' $count '个文件' -ForegroundColor Cyan
Write-Host '输出目录:' (Resolve-Path 'output').Path
"

echo.
echo 按任意键退出...
pause >nul
