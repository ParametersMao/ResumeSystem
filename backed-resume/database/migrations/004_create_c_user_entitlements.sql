-- 创建 C 端用户权益/配额表（1:1）
CREATE TABLE IF NOT EXISTS `c_user_entitlements` (
  `user_id` int NOT NULL COMMENT '用户ID',
  `plan_code` varchar(32) NOT NULL DEFAULT 'free' COMMENT '套餐/计划标识',
  `account_weight` int NOT NULL DEFAULT 0 COMMENT '账号权重（数值越大权限越高）',
  `ai_free_total` int NOT NULL DEFAULT 20 COMMENT 'AI 免费次数总量',
  `ai_free_used` int NOT NULL DEFAULT 0 COMMENT 'AI 免费次数已用',
  `ai_free_reset_policy` varchar(16) NOT NULL DEFAULT 'never' COMMENT '免费次数重置策略（never/monthly等）',
  `expire_at` datetime DEFAULT NULL COMMENT '权益到期时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_c_user_entitlements_user` FOREIGN KEY (`user_id`) REFERENCES `c_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='C端用户权益/配额表';

