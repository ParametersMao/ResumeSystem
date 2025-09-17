-- 创建简历表
CREATE TABLE IF NOT EXISTS `resumes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT '简历标题',
  `content` longtext NOT NULL COMMENT '简历内容(JSON格式)',
  `template_id` int DEFAULT NULL COMMENT '模板ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `preview_image` text COMMENT '预览图',
  `status` tinyint DEFAULT '1' COMMENT '状态(1:正常 0:删除)',
  `version` int DEFAULT '0' COMMENT '版本号',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_resumes_template` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_resumes_user` FOREIGN KEY (`user_id`) REFERENCES `c_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='简历表';
