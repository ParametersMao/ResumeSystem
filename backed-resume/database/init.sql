-- 创建数据库
CREATE DATABASE IF NOT EXISTS resume_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE resume_system;

-- 创建 C 端小程序用户表
CREATE TABLE IF NOT EXISTS c_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status TINYINT NOT NULL DEFAULT 1,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ai_operation_count INT NOT NULL DEFAULT 0
);

-- 创建中台系统用户表
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建简历模板表
CREATE TABLE IF NOT EXISTS templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_name VARCHAR(255) NOT NULL,
  template_data TEXT NOT NULL,
  preview_image VARCHAR(255),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  use_count INT NOT NULL DEFAULT 0,
  download_count INT NOT NULL DEFAULT 0
);

-- 创建数据统计表
CREATE TABLE IF NOT EXISTS statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  statistic_type VARCHAR(50) NOT NULL,
  statistic_data TEXT NOT NULL,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建 AI 操作记录表
CREATE TABLE IF NOT EXISTS ai_operations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  operation_type VARCHAR(20) NOT NULL,
  input_data TEXT,
  output_data TEXT,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  token_used INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES c_users(id)
);

-- 创建模板使用记录表
CREATE TABLE IF NOT EXISTS template_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  template_id INT NOT NULL,
  usage_type VARCHAR(20) NOT NULL,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES c_users(id),
  FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- 创建简历下载记录表
CREATE TABLE IF NOT EXISTS resume_downloads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  template_id INT NOT NULL,
  download_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES c_users(id),
  FOREIGN KEY (template_id) REFERENCES templates(id)
);

-- 插入默认管理员用户 (密码: admin123)
INSERT INTO admin_users (username, password, user_type, status) VALUES 
('admin', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ', 'admin', 1);

-- 创建索引
CREATE INDEX idx_c_users_username ON c_users(username);
CREATE INDEX idx_c_users_phone ON c_users(phone);
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_templates_name ON templates(template_name);
CREATE INDEX idx_ai_operations_user_id ON ai_operations(user_id);
CREATE INDEX idx_ai_operations_create_time ON ai_operations(create_time);
CREATE INDEX idx_template_usage_user_id ON template_usage(user_id);
CREATE INDEX idx_template_usage_template_id ON template_usage(template_id);
CREATE INDEX idx_resume_downloads_user_id ON resume_downloads(user_id);
CREATE INDEX idx_resume_downloads_template_id ON resume_downloads(template_id); 