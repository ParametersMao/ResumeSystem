-- 简历历史版本快照表
CREATE TABLE IF NOT EXISTS resume_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  resume_id INT NOT NULL,
  user_id INT NOT NULL,
  source_version INT NOT NULL DEFAULT 0,
  content LONGTEXT NOT NULL,
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_resume_versions_resume_id (resume_id),
  INDEX idx_resume_versions_user_id (user_id),
  INDEX idx_resume_versions_create_time (create_time)
);

