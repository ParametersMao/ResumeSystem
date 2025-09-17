# 《简历中台系统 API 接口及数据库表结构设计》

以下是结合两份文档内容生成的新的简历中台系统 API 接口文档及数据库表结构设计：


简历中台系统 API 接口文档 & 数据库表结构



目录





*   [后台用户管理](#后台用户管理)

*   \[C 端用户管理]\(#c 端用户管理)


*   [模板管理](#模板管理)

*   \[AI 操作记录]\(#ai 操作记录)


*   [数据统计](#数据统计)

*   [登录 / 权限](#登录权限)

*   [通用响应结构](#通用响应结构)



***

后台用户管理



### 数据库表：`admin_users`



| 字段名&#xA;          | 类型&#xA;           | 长度&#xA; | 说明&#xA;     | 约束&#xA;                                                      |
| ----------------- | ----------------- | ------- | ----------- | ------------------------------------------------------------ |
| id&#xA;           | int&#xA;          | 11&#xA; | 主键&#xA;     | PK, AUTO\_INC&#xA;                                           |
| username&#xA;     | varchar(255)&#xA; |         | 用户名&#xA;    | UNIQUE, NOT NULL&#xA;                                        |
| password&#xA;     | varchar(255)&#xA; |         | 密码（加密）&#xA; | NOT NULL&#xA;                                                |
| user\_type&#xA;   | varchar(20)&#xA;  |         | 用户类型&#xA;   | NOT NULL, 'admin', 'operator', 'viewer'&#xA;                 |
| status&#xA;       | tinyint&#xA;      | 4&#xA;  | 状态&#xA;     | NOT NULL, 0: 禁用，1: 启用&#xA;                                   |
| create\_time&#xA; | datetime&#xA;     |         | 创建时间&#xA;   | DEFAULT CURRENT\_TIMESTAMP&#xA;                              |
| update\_time&#xA; | datetime&#xA;     |         | 更新时间&#xA;   | DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP&#xA; |

### API 接口&#xA;



*   `POST   /api/auth/login` 登录


*   `GET    /api/admin/users` 获取用户列表


*   `POST   /api/admin/users` 新增用户


*   `PUT    /api/admin/users/{id}` 编辑用户


*   `DELETE /api/admin/users/{id}` 删除用户


*   `PATCH  /api/admin/users/{id}/status` 启用 / 禁用用户




***

C 端用户管理



### 数据库表：`c_users`



| 字段名&#xA;                  | 类型&#xA;           | 长度&#xA; | 说明&#xA;           | 约束&#xA;                                                      |
| ------------------------- | ----------------- | ------- | ----------------- | ------------------------------------------------------------ |
| id&#xA;                   | int&#xA;          | 11&#xA; | 主键&#xA;           | PK, AUTO\_INC&#xA;                                           |
| username&#xA;             | varchar(255)&#xA; |         | 用户名&#xA;          | NOT NULL&#xA;                                                |
| password&#xA;             | varchar(255)&#xA; |         | 密码（加密）&#xA;       | NOT NULL&#xA;                                                |
| email&#xA;                | varchar(255)&#xA; |         | 邮箱&#xA;           |                                                              |
| phone&#xA;                | varchar(20)&#xA;  |         | 手机号&#xA;          | UNIQUE&#xA;                                                  |
| status&#xA;               | tinyint&#xA;      | 4&#xA;  | 状态&#xA;           | NOT NULL, 0: 禁用，1: 启用&#xA;                                   |
| create\_time&#xA;         | datetime&#xA;     |         | 注册时间&#xA;         | DEFAULT CURRENT\_TIMESTAMP&#xA;                              |
| update\_time&#xA;         | datetime&#xA;     |         | 用户信息更新时间&#xA;     | DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP&#xA; |
| ai\_operation\_count&#xA; | int&#xA;          | 11&#xA; | 用户累计 AI 操作次数&#xA; | DEFAULT 0&#xA;                                               |

### API 接口&#xA;



*   `GET    /api/cusers` 获取 C 端用户列表


*   `PATCH  /api/cusers/{id}/status` 启用 / 禁用用户


*   `DELETE /api/cusers/{id}` 删除用户




***

模板管理



### 数据库表：`templates`



| 字段名&#xA;             | 类型&#xA;           | 长度&#xA; | 说明&#xA;              | 约束&#xA;                                                      |
| -------------------- | ----------------- | ------- | -------------------- | ------------------------------------------------------------ |
| id&#xA;              | int&#xA;          | 11&#xA; | 主键&#xA;              | PK, AUTO\_INC&#xA;                                           |
| template\_name&#xA;  | varchar(255)&#xA; |         | 模板名称&#xA;            | NOT NULL&#xA;                                                |
| template\_data&#xA;  | text&#xA;         |         | 模板配置数据（JSON 格式）&#xA; | NOT NULL&#xA;                                                |
| preview\_image&#xA;  | varchar(255)&#xA; |         | 预览图 URL&#xA;         |                                                              |
| create\_time&#xA;    | datetime&#xA;     |         | 创建时间&#xA;            | DEFAULT CURRENT\_TIMESTAMP&#xA;                              |
| update\_time&#xA;    | datetime&#xA;     |         | 更新时间&#xA;            | DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP&#xA; |
| use\_count&#xA;      | int&#xA;          | 11&#xA; | 模板被使用总次数&#xA;        | DEFAULT 0&#xA;                                               |
| download\_count&#xA; | int&#xA;          | 11&#xA; | 基于此模板下载简历的总次数&#xA;   | DEFAULT 0&#xA;                                               |

### API 接口&#xA;



*   `GET    /api/templates` 获取模板列表


*   `POST   /api/templates` 新增模板


*   `PUT    /api/templates/{id}` 编辑模板


*   `DELETE /api/templates/{id}` 删除模板


*   `PATCH  /api/templates/{id}/status` 启用 / 禁用模板




***

AI 操作记录



### 数据库表：`ai_operations`



| 字段名&#xA;             | 类型&#xA;          | 长度&#xA; | 说明&#xA;                   | 约束&#xA;                                             |
| -------------------- | ---------------- | ------- | ------------------------- | --------------------------------------------------- |
| id&#xA;              | int&#xA;         | 11&#xA; | 主键&#xA;                   | PK, AUTO\_INC&#xA;                                  |
| user\_id&#xA;        | int&#xA;         | 11&#xA; | 用户 ID&#xA;                | FOREIGN KEY (user\_id) REFERENCES c\_users(id)&#xA; |
| operation\_type&#xA; | varchar(20)&#xA; |         | 操作类型&#xA;                 | NOT NULL, 'polish', 'generate'&#xA;                 |
| input\_data&#xA;     | text&#xA;        |         | 输入数据&#xA;                 |                                                     |
| output\_data&#xA;    | text&#xA;        |         | 输出数据&#xA;                 |                                                     |
| create\_time&#xA;    | datetime&#xA;    |         | 操作执行时间&#xA;               | DEFAULT CURRENT\_TIMESTAMP&#xA;                     |
| token\_used&#xA;     | int&#xA;         | 11&#xA; | 本次 AI 操作消耗的 token 数量&#xA; | DEFAULT 0&#xA;                                      |

### API 接口&#xA;



*   `GET    /api/ai-operations` 获取 AI 操作记录


*   `GET    /api/ai-operations/{id}` 查看操作详情


*   `DELETE /api/ai-operations/{id}` 删除操作记录


*   `GET    /api/ai-operations/export` 导出操作记录




***

数据统计



### 统计相关 API&#xA;



*   `GET /api/statistics/overview` 数据概览（用户数、模板数、AI 操作数等）


*   `GET /api/statistics/trend` 趋势图表数据（按天 / 周 / 月）


*   `GET /api/statistics/popular-templates` 热门模板排行


*   `GET /api/statistics/user-activity` 用户活跃度排行


### 统计相关表&#xA;

#### `statistics`



| 字段名&#xA;             | 类型&#xA;          | 长度&#xA; | 说明&#xA;            | 约束&#xA;                         |
| -------------------- | ---------------- | ------- | ------------------ | ------------------------------- |
| id&#xA;              | int&#xA;         | 11&#xA; | 统计记录唯一标识&#xA;      | PK, AUTO\_INC&#xA;              |
| statistic\_type&#xA; | varchar(50)&#xA; |         | 统计类型&#xA;          | NOT NULL&#xA;                   |
| statistic\_data&#xA; | text&#xA;        |         | 统计数据（JSON 格式）&#xA; | NOT NULL&#xA;                   |
| create\_time&#xA;    | datetime&#xA;    |         | 统计时间&#xA;          | DEFAULT CURRENT\_TIMESTAMP&#xA; |

#### `template_usage`



| 字段名&#xA;          | 类型&#xA;          | 长度&#xA; | 说明&#xA;             | 约束&#xA;                                                  |
| ----------------- | ---------------- | ------- | ------------------- | -------------------------------------------------------- |
| id&#xA;           | int&#xA;         | 11&#xA; | 使用记录唯一标识&#xA;       | PK, AUTO\_INC&#xA;                                       |
| user\_id&#xA;     | int&#xA;         | 11&#xA; | 使用模板的 C 端用户 ID&#xA; | FOREIGN KEY (user\_id) REFERENCES c\_users(id)&#xA;      |
| template\_id&#xA; | int&#xA;         | 11&#xA; | 被使用的模板 ID&#xA;      | FOREIGN KEY (template\_id) REFERENCES templates(id)&#xA; |
| usage\_type&#xA;  | varchar(20)&#xA; |         | 使用类型&#xA;           | NOT NULL&#xA;                                            |
| create\_time&#xA; | datetime&#xA;    |         | 使用时间&#xA;           | DEFAULT CURRENT\_TIMESTAMP&#xA;                          |

#### `resume_downloads`



| 字段名&#xA;            | 类型&#xA;       | 长度&#xA; | 说明&#xA;             | 约束&#xA;                                                  |
| ------------------- | ------------- | ------- | ------------------- | -------------------------------------------------------- |
| id&#xA;             | int&#xA;      | 11&#xA; | 下载记录唯一标识&#xA;       | PK, AUTO\_INC&#xA;                                       |
| user\_id&#xA;       | int&#xA;      | 11&#xA; | 下载简历的 C 端用户 ID&#xA; | FOREIGN KEY (user\_id) REFERENCES c\_users(id)&#xA;      |
| template\_id&#xA;   | int&#xA;      | 11&#xA; | 下载简历所使用的模板 ID&#xA;  | FOREIGN KEY (template\_id) REFERENCES templates(id)&#xA; |
| download\_time&#xA; | datetime&#xA; |         | 简历下载时间&#xA;         | DEFAULT CURRENT\_TIMESTAMP&#xA;                          |



***

登录 / 权限



### API 接口&#xA;



*   `POST   /api/auth/login` 登录


*   `POST   /api/auth/logout` 退出登录


*   `GET    /api/auth/profile` 获取当前登录用户信息


*   `GET    /api/auth/permissions` 获取当前用户权限




***

通用响应结构





```
{
&#x20; "code": 200,
&#x20; "message": "ok",
&#x20; "data": { ... }
}


&#x20; "code": 200,
&#x20; "message": "ok",
&#x20; "data": { ... }
}


&#x20; "message": "ok",
&#x20; "data": { ... }
}


&#x20; "data": { ... }
}


}
```



*   `code`：200 为成功，其他为错误码


*   `message`：提示信息


*   `data`：返回数据




***

建表 SQL 语句





```
\-- 创建 C 端小程序用户表
CREATE TABLE c\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   email VARCHAR(255),
&#x20;   phone VARCHAR(20),
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


CREATE TABLE c\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   email VARCHAR(255),
&#x20;   phone VARCHAR(20),
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   email VARCHAR(255),
&#x20;   phone VARCHAR(20),
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   email VARCHAR(255),
&#x20;   phone VARCHAR(20),
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   email VARCHAR(255),
&#x20;   phone VARCHAR(20),
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   email VARCHAR(255),
&#x20;   phone VARCHAR(20),
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   phone VARCHAR(20),
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   ai\_operation\_count INT NOT NULL DEFAULT 0
);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


);

\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


\-- 创建中台系统用户表
CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


CREATE TABLE admin\_users (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   username VARCHAR(255) NOT NULL,
&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   password VARCHAR(255) NOT NULL,
&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   user\_type VARCHAR(20) NOT NULL,
&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   status TINYINT NOT NULL DEFAULT 1,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP
);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


);

\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


\-- 创建简历模板表
CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


CREATE TABLE templates (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   template\_name VARCHAR(255) NOT NULL,
&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   template\_data TEXT NOT NULL,
&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   preview\_image VARCHAR(255),
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   update\_time DATETIME DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP,
&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   use\_count INT NOT NULL DEFAULT 0,
&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   download\_count INT NOT NULL DEFAULT 0
);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


);

\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


\-- 创建数据统计表
CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


CREATE TABLE statistics (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   statistic\_type VARCHAR(50) NOT NULL,
&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   statistic\_data TEXT NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP
);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


);

\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


\-- 创建 AI 操作记录表
CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


CREATE TABLE ai\_operations (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   user\_id INT NOT NULL,
&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   operation\_type VARCHAR(20) NOT NULL,
&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   input\_data TEXT,
&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   output\_data TEXT,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   token\_used INT DEFAULT 0,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id)
);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


);

\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


\-- 创建模板使用记录表
CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


CREATE TABLE template\_usage (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   template\_id INT NOT NULL,
&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   usage\_type VARCHAR(20) NOT NULL,
&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   create\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


);

\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


\-- 创建简历下载记录表
CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


CREATE TABLE resume\_downloads (
&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   id INT AUTO\_INCREMENT PRIMARY KEY,
&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   user\_id INT NOT NULL,
&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   template\_id INT NOT NULL,
&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   download\_time DATETIME DEFAULT CURRENT\_TIMESTAMP,
&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   FOREIGN KEY (user\_id) REFERENCES c\_users(id),
&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   FOREIGN KEY (template\_id) REFERENCES templates(id)
);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


);

\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


\-- 触发器：更新 C 端用户 AI 操作次数
DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


DELIMITER //
CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


CREATE TRIGGER update\_ai\_operation\_count
AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


AFTER INSERT ON ai\_operations
FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


FOR EACH ROW
BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


BEGIN
&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   UPDATE c\_users
&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   SET ai\_operation\_count = ai\_operation\_count + 1
&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   WHERE id = NEW.user\_id;
END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


END //
DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


DELIMITER ;

\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


\-- 触发器：更新模板使用次数
DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


DELIMITER //
CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


CREATE TRIGGER update\_template\_use\_count
AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


AFTER INSERT ON template\_usage
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


BEGIN
&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   UPDATE templates
&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   SET use\_count = use\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


END //
DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


DELIMITER ;

\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


\-- 触发器：更新模板下载次数
DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


DELIMITER //
CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


CREATE TRIGGER update\_template\_download\_count
AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


AFTER INSERT ON resume\_downloads
FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


FOR EACH ROW
BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


BEGIN
&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   UPDATE templates
&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   SET download\_count = download\_count + 1
&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


&#x20;   WHERE id = NEW.template\_id;
END //
DELIMITER ;


END //
DELIMITER ;


DELIMITER ;
```

**说明**：文档包含表结构设计、关系说明及完整 SQL 语句，可直接用于数据库搭建。如需进一步调整字段、权限设置或功能，可随时沟通优化。


> （注：文档部分内容可能由 AI 生成）
>