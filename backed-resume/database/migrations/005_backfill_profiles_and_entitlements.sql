-- 为存量 C 端用户回填 1:1 资料/权益记录
-- 约定：给每个用户补 20 次“可用免费次数”，并保留历史 ai_operation_count 作为已用次数

INSERT INTO `c_user_profiles` (`user_id`, `nickname`, `avatar_url`, `bio`)
SELECT cu.`id`, NULL, NULL, NULL
FROM `c_users` cu
WHERE NOT EXISTS (
  SELECT 1 FROM `c_user_profiles` p WHERE p.`user_id` = cu.`id`
);

INSERT INTO `c_user_entitlements` (
  `user_id`,
  `plan_code`,
  `account_weight`,
  `ai_free_total`,
  `ai_free_used`,
  `ai_free_reset_policy`,
  `expire_at`
)
SELECT
  cu.`id`,
  'free',
  0,
  (cu.`ai_operation_count` + 20),
  cu.`ai_operation_count`,
  'never',
  NULL
FROM `c_users` cu
WHERE NOT EXISTS (
  SELECT 1 FROM `c_user_entitlements` e WHERE e.`user_id` = cu.`id`
);

