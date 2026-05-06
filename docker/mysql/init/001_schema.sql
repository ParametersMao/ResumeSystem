CREATE DATABASE IF NOT EXISTS resume_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE resume_system;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(255) NULL,
  user_type VARCHAR(20) NOT NULL DEFAULT 'admin',
  status TINYINT NOT NULL DEFAULT 1,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS c_users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  status TINYINT NOT NULL DEFAULT 1,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ai_operation_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_c_users_phone (phone),
  KEY idx_c_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS c_user_profiles (
  user_id INT NOT NULL,
  real_name VARCHAR(100) NULL,
  avatar VARCHAR(500) NULL,
  bio TEXT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_c_user_profiles_user FOREIGN KEY (user_id) REFERENCES c_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS c_user_entitlements (
  user_id INT NOT NULL,
  plan_code VARCHAR(32) NOT NULL DEFAULT 'free',
  account_weight INT NOT NULL DEFAULT 0,
  ai_free_total INT NOT NULL DEFAULT 20,
  ai_free_used INT NOT NULL DEFAULT 0,
  ai_free_reset_policy VARCHAR(16) NOT NULL DEFAULT 'never',
  expire_at DATETIME NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_c_user_entitlements_user FOREIGN KEY (user_id) REFERENCES c_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS templates (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  thumbnail LONGTEXT NULL,
  html_content LONGTEXT NULL,
  css_content LONGTEXT NULL,
  category VARCHAR(255) NULL,
  tags VARCHAR(500) NULL,
  is_premium TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  use_count INT NOT NULL DEFAULT 0,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_templates_active (is_active),
  KEY idx_templates_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resumes (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  template_id INT NULL,
  user_id INT NOT NULL,
  preview_image TEXT NULL,
  status INT NOT NULL DEFAULT 1,
  version INT NOT NULL DEFAULT 0,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_resumes_user_status (user_id, status),
  KEY idx_resumes_template (template_id),
  CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES c_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_resumes_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resume_versions (
  id INT NOT NULL AUTO_INCREMENT,
  resume_id INT NOT NULL,
  user_id INT NOT NULL,
  source_version INT NOT NULL DEFAULT 0,
  source_type VARCHAR(24) NOT NULL DEFAULT 'save',
  remark VARCHAR(120) NULL,
  content LONGTEXT NOT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_resume_versions_resume (resume_id),
  KEY idx_resume_versions_user (user_id),
  CONSTRAINT fk_resume_versions_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_operations (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  input_text TEXT NULL,
  output_text TEXT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tokens_used INT NOT NULL DEFAULT 0,
  status ENUM('processing','success','failed') NOT NULL DEFAULT 'success',
  PRIMARY KEY (id),
  KEY idx_ai_operations_user (user_id),
  KEY idx_ai_operations_create_time (create_time),
  CONSTRAINT fk_ai_operations_user FOREIGN KEY (user_id) REFERENCES c_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS template_usage (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  template_id INT NOT NULL,
  usage_type VARCHAR(20) NOT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_template_usage_user (user_id),
  KEY idx_template_usage_template (template_id),
  CONSTRAINT fk_template_usage_user FOREIGN KEY (user_id) REFERENCES c_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_usage_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS resume_downloads (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  template_id INT NOT NULL,
  download_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_resume_downloads_user (user_id),
  KEY idx_resume_downloads_template (template_id),
  CONSTRAINT fk_resume_downloads_user FOREIGN KEY (user_id) REFERENCES c_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_resume_downloads_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS template_favorites (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  template_id INT NOT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_template_favorites_user_template (user_id, template_id),
  KEY idx_template_favorites_user_create (user_id, create_time),
  KEY idx_template_favorites_template (template_id),
  CONSTRAINT fk_template_favorites_user FOREIGN KEY (user_id) REFERENCES c_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_favorites_template FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS statistics (
  id INT NOT NULL AUTO_INCREMENT,
  statistic_type VARCHAR(50) NOT NULL,
  statistic_data TEXT NOT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_logs (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NULL,
  action VARCHAR(100) NULL,
  method VARCHAR(10) NULL,
  path VARCHAR(255) NULL,
  ip VARCHAR(50) NULL,
  user_agent TEXT NULL,
  request_body TEXT NULL,
  response_status INT NULL,
  error_message TEXT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_system_logs_user (user_id),
  KEY idx_system_logs_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_configs (
  id INT NOT NULL AUTO_INCREMENT,
  config_key VARCHAR(64) NOT NULL,
  config_data LONGTEXT NOT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_system_configs_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admin_users (id, username, password, email, phone, user_type, status)
VALUES (1, 'admin', '$2b$10$2rfKf1JICBrOaOzyRCwmXuRPKY3BRv4OZJkHt.p/rY89a6c5cQ6pO', 'admin@example.com', '13800138000', 'admin', 1)
ON DUPLICATE KEY UPDATE username = VALUES(username);

INSERT INTO c_users (id, username, password, email, phone, status)
VALUES (1, 'testuser', '$2b$10$w4RY4Xyo6RDRqM6KYUjzq.Da/TH3W0aUVJGz1276uJsra.JSvsSee', 'testuser@example.com', '13900139000', 1)
ON DUPLICATE KEY UPDATE username = VALUES(username);

INSERT INTO c_user_profiles (user_id, real_name, avatar, bio)
VALUES (1, '测试用户', NULL, NULL)
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

INSERT INTO c_user_entitlements (user_id, plan_code, account_weight, ai_free_total, ai_free_used, ai_free_reset_policy)
VALUES (1, 'free', 0, 20, 0, 'never')
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);
