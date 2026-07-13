-- v1.3 RAG source classification and private tenant routing metadata.
-- Existing documents are global standards by default.
ALTER TABLE knowledge_documents
  ADD COLUMN source_type VARCHAR(32) NOT NULL DEFAULT 'standard' AFTER category,
  ADD COLUMN scope VARCHAR(16) NOT NULL DEFAULT 'global' AFTER source_type,
  ADD COLUMN owner_user_id INT NULL AFTER scope,
  ADD COLUMN resume_id INT NULL AFTER owner_user_id,
  ADD COLUMN licensed TINYINT(1) NOT NULL DEFAULT 0 AFTER resume_id,
  ADD COLUMN pii_reviewed TINYINT(1) NOT NULL DEFAULT 0 AFTER licensed,
  ADD COLUMN expires_at DATETIME NULL AFTER pii_reviewed;

CREATE INDEX idx_knowledge_source_scope
  ON knowledge_documents (source_type, scope);

CREATE INDEX idx_knowledge_owner_resume
  ON knowledge_documents (owner_user_id, resume_id, source_type);
