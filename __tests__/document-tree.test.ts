/**
 * Regression test: getDocumentTree with a DOCUMENT id must return children.
 *
 * SiYuan document blocks always have an empty parent_id; child documents hang
 * off the file path (`/<parent-doc-id>/<child-doc-id>.sy`). The old recursive
 * SQL joined on `b.parent_id = dt.id`, which never matches for doc blocks —
 * so requesting a subtree by document id returned only the node itself.
 */
import { SiyuanDocumentApi } from '../dist/src/api/document.js';

describe('SiyuanDocumentApi.getDocumentTree SQL (subtree by document id)', () => {
  it('joins child docs via path, not via parent_id', async () => {
    const captured: Array<{ endpoint: string; data: any }> = [];
    const stub: any = {
      request: async (endpoint: string, data: any) => {
        captured.push({ endpoint, data });
        return { code: 0, data: [] };
      },
    };

    const api = new SiyuanDocumentApi(stub);
    await api.getDocumentTree('20260804040102-qg9ox90', 2);

    expect(captured).toHaveLength(1);
    expect(captured[0].endpoint).toBe('/api/query/sql');
    const stmt: string = captured[0].data.stmt;
    expect(stmt).toContain('substr(dt.path');
    expect(stmt).not.toContain('ON b.parent_id = dt.id');
  });
});
