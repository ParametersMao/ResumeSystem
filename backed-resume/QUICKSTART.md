# 快速启动指南

## 🚀 5分钟快速启动

### 1. 环境准备

确保已安装：

- Node.js (>= 18.19.0)
- MySQL (>= 5.7)

### 2. 数据库配置

1. 启动 MySQL 服务
2. 创建数据库：

```sql
CREATE DATABASE resume_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. 执行初始化脚本：

```bash
mysql -u root -p resume_system < database/init.sql
```

### 3. 项目配置

1. 修改 `.env` 文件中的数据库密码：

```env
DB_PASSWORD=your_actual_password
```

### 4. 启动服务

```bash
npm run start:dev
```

### 5. 测试接口

服务启动后，访问：http://localhost:3000

#### 测试登录接口：

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📋 默认账户

- **管理员**: admin / admin123
- **用户类型**: admin

## 🔧 常见问题

### Q: 数据库连接失败

A: 检查 `.env` 文件中的数据库配置是否正确

### Q: 端口被占用

A: 修改 `.env` 文件中的 `PORT` 配置

### Q: 依赖安装失败

A: 确保 Node.js 版本 >= 18.19.0

## 📚 下一步

- 查看 [README.md](README.md) 了解完整功能
- 查看 [API 文档](README.md#api-接口) 了解所有接口
- 开始开发你的功能模块
