import { isPrivateKnowledgeUploadPath } from './upload-static-access';

describe('private local knowledge upload paths', () => {
  it.each([
    '/knowledge/file.pdf',
    '/Knowledge/file.pdf',
    '/knowledge%2Ffile.pdf',
    '/knowledge%252Ffile.pdf',
    '\\knowledge\\file.pdf',
  ])('blocks %s', (path) => {
    expect(isPrivateKnowledgeUploadPath(path)).toBe(true);
  });

  it.each(['/avatars/user.png', '/pdfs/resume.pdf', '/knowledge-base-cover.png'])('allows %s', (path) => {
    expect(isPrivateKnowledgeUploadPath(path)).toBe(false);
  });
});
