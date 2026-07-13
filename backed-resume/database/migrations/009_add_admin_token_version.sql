-- Invalidate all previously issued admin access/refresh tokens after a
-- password, role, or status change.
ALTER TABLE admin_users
  ADD COLUMN token_version INT NOT NULL DEFAULT 0 AFTER status;
