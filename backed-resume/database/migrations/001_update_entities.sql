-- 更新 admin_users 表结构
ALTER TABLE admin_users 
ADD COLUMN email VARCHAR(255) NULL,
ADD COLUMN phone VARCHAR(20) NULL;

-- 更新字段名映射（保持数据库字段名不变，只更新实体映射）
-- admin_users 表的 user_type 字段保持不变，实体中使用 role 映射
-- admin_users 表的 create_time 和 update_time 字段保持不变，实体中使用 createTime 和 updateTime 映射

-- 更新 c_users 表结构（字段名保持不变，只更新实体映射）
-- c_users 表的 create_time 和 update_time 字段保持不变，实体中使用 createTime 和 updateTime 映射
-- c_users 表的 ai_operation_count 字段保持不变，实体中使用 aiOperationCount 映射

-- 更新 templates 表结构（字段名保持不变，只更新实体映射）
-- templates 表的 template_name 字段保持不变，实体中使用 templateName 映射
-- templates 表的 template_data 字段保持不变，实体中使用 templateData 映射
-- templates 表的 preview_image 字段保持不变，实体中使用 previewImage 映射
-- templates 表的 create_time 和 update_time 字段保持不变，实体中使用 createTime 和 updateTime 映射
-- templates 表的 use_count 和 download_count 字段保持不变，实体中使用 useCount 和 downloadCount 映射

-- 更新 ai_operations 表结构（字段名保持不变，只更新实体映射）
-- ai_operations 表的 user_id 字段保持不变，实体中使用 userId 映射
-- ai_operations 表的 operation_type 字段保持不变，实体中使用 operationType 映射
-- ai_operations 表的 input_data 字段保持不变，实体中使用 inputData 映射
-- ai_operations 表的 output_data 字段保持不变，实体中使用 outputData 映射
-- ai_operations 表的 create_time 字段保持不变，实体中使用 createTime 映射
-- ai_operations 表的 token_used 字段保持不变，实体中使用 tokenUsed 映射

-- 为现有管理员用户添加默认邮箱和手机号（可选）
UPDATE admin_users 
SET email = CONCAT(username, '@example.com'), 
    phone = '13800138000' 
WHERE email IS NULL OR phone IS NULL; 