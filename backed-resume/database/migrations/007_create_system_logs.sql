-- 系统审计日志表（简化版，不依赖 Redis）
CREATE TABLE IF NOT EXISTS system_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  user_type VARCHAR(16) NULL,
  route VARCHAR(255) NOT NULL,
  method VARCHAR(12) NOT NULL,
  ip VARCHAR(64) NULL,
  user_agent VARCHAR(512) NULL,
  status_code INT NULL,
  duration_ms INT NULL,
  params_json TEXT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_system_logs_create_time (create_time),
  INDEX idx_system_logs_user_id (user_id),
  INDEX idx_system_logs_route (route)
);

