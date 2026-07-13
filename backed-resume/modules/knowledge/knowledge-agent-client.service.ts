import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { KnowledgeScope, KnowledgeSourceType } from '../../dto/knowledge-document.dto';

interface IndexResult {
  document_id: number;
  chunk_count: number;
  embedding_backend: string;
}

@Injectable()
export class KnowledgeAgentClientService {
  async indexDocument(input: {
    documentId: number;
    name: string;
    category: string;
    sourceType: KnowledgeSourceType;
    scope: KnowledgeScope;
    ownerUserId?: number | null;
    resumeId?: number | null;
    licensed?: boolean;
    piiReviewed?: boolean;
    expiresAt?: Date | null;
    file: Express.Multer.File;
  }): Promise<IndexResult> {
    const form = new FormData();
    form.append('document_id', String(input.documentId));
    form.append('name', input.name);
    form.append('category', input.category);
    form.append('source_type', input.sourceType);
    form.append('scope', input.scope);
    if (input.ownerUserId) form.append('owner_user_id', String(input.ownerUserId));
    if (input.resumeId) form.append('resume_id', String(input.resumeId));
    form.append('licensed', String(Boolean(input.licensed)));
    form.append('pii_reviewed', String(Boolean(input.piiReviewed)));
    if (input.expiresAt) form.append('expires_at', input.expiresAt.toISOString());
    form.append(
      'file',
      new Blob([input.file.buffer], { type: input.file.mimetype }),
      input.file.originalname,
    );
    return this.request<IndexResult>('/rag/index', { method: 'POST', body: form });
  }

  async deleteDocument(documentId: number): Promise<void> {
    await this.request(`/rag/documents/${documentId}`, { method: 'DELETE' });
  }

  async setDocumentEnabled(documentId: number, enabled: boolean): Promise<void> {
    await this.request(`/rag/documents/${documentId}/enabled`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  }

  async search(
    query: string,
    limit: number,
    category?: string,
    filters: {
      sourceTypes?: KnowledgeSourceType[];
      scope?: KnowledgeScope;
      ownerUserId?: number;
      resumeId?: number;
    } = {},
  ) {
    return this.request<{ results: Array<Record<string, any>> }>('/rag/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        limit,
        category: category || null,
        sourceTypes: filters.sourceTypes || null,
        scope: filters.scope || null,
        ownerUserId: filters.ownerUserId || null,
        resumeId: filters.resumeId ? String(filters.resumeId) : null,
      }),
    });
  }

  async getMetrics() {
    return this.request<{ service: string; rag: Record<string, number | string> }>('/metrics', {
      method: 'GET',
    });
  }

  private async request<T = any>(path: string, init: RequestInit): Promise<T> {
    const baseUrl = String(process.env.AGENT_SERVICE_URL || '').trim().replace(/\/+$/, '');
    if (!baseUrl) {
      throw new ServiceUnavailableException('Agent 服务地址未配置，无法处理知识库文档');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    try {
      const secret = String(process.env.AGENT_INTERNAL_SECRET || '').trim();
      if (!secret) {
        throw new ServiceUnavailableException('Agent 内部鉴权密钥未配置');
      }
      const headers = new Headers(init.headers);
      headers.set('X-Agent-Secret', secret);
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => ({}))) as T & { detail?: string };
      if (!response.ok) {
        throw new BadGatewayException(payload?.detail || `知识库服务返回状态码 ${response.status}`);
      }
      return payload;
    } catch (error: any) {
      if (error instanceof BadGatewayException || error instanceof ServiceUnavailableException) throw error;
      if (error?.name === 'AbortError') {
        throw new BadGatewayException('知识库处理超时，请稍后重试');
      }
      throw new BadGatewayException(`知识库服务调用失败：${error?.message || '未知错误'}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
