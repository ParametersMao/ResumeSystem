import { AiConfigDto } from '../../dto/system-config.dto';
import { AiAgentClientService } from './ai-agent-client.service';

describe('AiAgentClientService response contract', () => {
  const originalFetch = global.fetch;
  const config = {
    agentBaseUrl: 'http://agent:8000',
    provider: 'langgraph-agent',
    apiBaseUrl: 'https://llm.example/v1',
    apiKey: 'test-key',
    apiModel: 'test-model',
    temperature: 0.3,
  } as AiConfigDto;

  beforeEach(() => {
    process.env.AGENT_INTERNAL_SECRET = 'internal-test-secret';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.AGENT_INTERNAL_SECRET;
    jest.restoreAllMocks();
  });

  it('preserves top-level diagnosis strategy and warnings', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({
        task_type: 'diagnose',
        execution_mode: 'live',
        diagnostics: ['  内容缺少岗位证据  '],
        strategy: ['  补充与岗位匹配的真实项目证据  '],
        warnings: ['  不要编造量化结果  '],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as any;

    const result = await new AiAgentClientService().diagnose(
      { contentText: '简历正文' } as any,
      7,
      config,
    );

    expect(result.diagnostics).toEqual(['内容缺少岗位证据']);
    expect(result.strategy).toEqual(['补充与岗位匹配的真实项目证据']);
    expect(result.warnings).toEqual(['不要编造量化结果']);
  });

  it('recovers strategy and warnings from the current Agent step contract', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({
        task_type: 'diagnose',
        execution_mode: 'live',
        steps: [
          { name: 'analysis', output: { diagnostics: ['诊断结果'] } },
          { name: 'planning', output: { strategy: ['优化策略'] } },
          { name: 'validation', output: { warnings: ['事实风险'] } },
        ],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as any;

    const result = await new AiAgentClientService().diagnose(
      { contentText: '简历正文' } as any,
      7,
      config,
    );

    expect(result.diagnostics).toEqual(['诊断结果']);
    expect(result.strategy).toEqual(['优化策略']);
    expect(result.warnings).toEqual(['事实风险']);
  });

  it('keeps Agent generate suggestions available to the editor', async () => {
    const suggestions = [
      {
        reason: '强化成果表达',
        text: '负责核心模块交付并持续优化稳定性。',
        html: '<p>负责核心模块交付并持续优化稳定性。</p>',
      },
    ];
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({
        task_type: 'generate',
        execution_mode: 'live',
        suggestions,
        steps: [],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as any;

    const result = await new AiAgentClientService().generate(
      { jobTitle: '前端工程师', sectionType: 'experience' } as any,
      7,
      config,
    );

    expect(result.suggestions).toEqual(suggestions);
    expect(result.strategy).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('preserves Agent 424 when strict RAG evidence is unavailable', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: '当前简历缺少已索引的私有 JD' }), {
        status: 424,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as any;

    await expect(
      new AiAgentClientService().diagnose(
        { resumeId: 'resume-1', contentText: '简历正文' } as any,
        7,
        config,
      ),
    ).rejects.toMatchObject({
      status: 424,
      response: '当前简历缺少已索引的私有 JD',
    });
  });
});
