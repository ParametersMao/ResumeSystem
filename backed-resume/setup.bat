@echo off
echo ========================================
echo 简历中台系统后端 - 项目配置脚本
echo ========================================

echo.
echo 1. 复制环境配置文件...
if not exist .env (
    copy config.env .env
    echo ✓ 已创建 .env 文件
) else (
    echo ✓ .env 文件已存在
)

echo.
echo 2. 安装依赖包...
call npm install
if %errorlevel% equ 0 (
    echo ✓ 依赖安装完成
) else (
    echo ✗ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 3. 检查数据库配置...
echo 请确保：
echo - MySQL 服务已启动
echo - 数据库 resume_system 已创建
echo - .env 文件中的数据库配置正确

echo.
echo 4. 启动开发服务器...
echo 执行以下命令启动服务：
echo npm run start:dev
echo.
echo 服务启动后，访问：http://localhost:3000
echo 默认管理员账户：admin / admin123

echo.
echo ========================================
echo 配置完成！
echo ========================================
pause 