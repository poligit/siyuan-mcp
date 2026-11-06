/**
 * Regression test: document-id argument alias.
 *
 * get_document_content historically required `document_id` while
 * get_document_tree required `id` — mixing them produced a schema error.
 * Both tools now accept either key.
 */
import {
  GetDocumentContentHandler,
  GetDocumentTreeHandler,
} from '../dist/mcp-server/handlers/document.js';

describe('document id argument alias (id <-> document_id)', () => {
  it('get_document_content accepts id as alias for document_id', async () => {
    const seen: string[] = [];
    const context: any = {
      siyuan: {
        getFileContent: async (docId: string) => {
          seen.push(docId);
          return 'line1\nline2';
        },
      },
    };
    const out = await new GetDocumentContentHandler().execute({ id: 'DOC-VIA-ID' } as any, context);
    expect(seen).toEqual(['DOC-VIA-ID']);
    expect(out).toContain('line1');
  });

  it('get_document_content still accepts document_id', async () => {
    const seen: string[] = [];
    const context: any = {
      siyuan: {
        getFileContent: async (docId: string) => {
          seen.push(docId);
          return 'content';
        },
      },
    };
    await new GetDocumentContentHandler().execute({ document_id: 'DOC-NATIVE' } as any, context);
    expect(seen).toEqual(['DOC-NATIVE']);
  });

  it('get_document_tree accepts document_id as alias for id', async () => {
    const seen: string[] = [];
    const context: any = {
      siyuan: {
        document: {
          getDocumentTree: async (docId: string, _depth: number) => {
            seen.push(docId);
            return [];
          },
        },
      },
    };
    await new GetDocumentTreeHandler().execute({ document_id: 'DOC-VIA-DOCUMENT-ID' } as any, context);
    expect(seen).toEqual(['DOC-VIA-DOCUMENT-ID']);
  });

  it('get_document_tree still accepts id', async () => {
    const seen: string[] = [];
    const context: any = {
      siyuan: {
        document: {
          getDocumentTree: async (docId: string, _depth: number) => {
            seen.push(docId);
            return [];
          },
        },
      },
    };
    await new GetDocumentTreeHandler().execute({ id: 'DOC-NATIVE' } as any, context);
    expect(seen).toEqual(['DOC-NATIVE']);
  });

  it('rejects calls with neither key and names both accepted keys', async () => {
    const context: any = { siyuan: { getFileContent: async () => 'x' } };
    await expect(
      new GetDocumentContentHandler().execute({} as any, context)
    ).rejects.toThrow(/document_id.*id|id.*document_id/);
  });
});
