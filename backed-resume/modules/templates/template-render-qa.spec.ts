const {
  evaluatePagination,
  isStructuralFailure,
} = require('../../scripts/template-render-qa');

describe('template render pagination QA gate', () => {
  it('requires short content to fit one page', () => {
    expect(evaluatePagination({ scrollHeight: 1120, textLength: 900, itemCount: 8 })).toEqual({
      contentProfile: 'short',
      pageCount: 1,
      naturalMultiPage: false,
    });
    expect(evaluatePagination({ scrollHeight: 1121, textLength: 900, itemCount: 8 })).toMatchObject({
      contentProfile: 'short',
      pageCount: 2,
    });
  });

  it('accepts natural multi-page height for long content', () => {
    const result = evaluatePagination({ scrollHeight: 2480, textLength: 3200, itemCount: 31 });
    expect(result).toEqual({
      contentProfile: 'long',
      pageCount: 3,
      naturalMultiPage: true,
    });
    expect(isStructuralFailure({
      width: 820,
      overflowX: 0,
      scrollHeight: 2480,
      layoutClass: 'layout-qm-minimal-ats',
    })).toBe(false);
  });

  it('still fails horizontal overflow and missing layout structure', () => {
    expect(isStructuralFailure({
      width: 820,
      overflowX: 1,
      scrollHeight: 1120,
      layoutClass: 'layout-qm-minimal-ats',
    })).toBe(true);
    expect(isStructuralFailure({
      width: 820,
      overflowX: 0,
      scrollHeight: 1120,
      layoutClass: '',
    })).toBe(true);
  });
});
