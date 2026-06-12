import type { QueryRequest, QueryResponse } from '../types';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const MOCK_RESPONSES: QueryResponse[] = [
  {
    answer:
      'The paper presents three main findings: (1) dense retrieval significantly outperforms BM25 on open-domain QA, (2) end-to-end training of the retriever improves downstream task performance, and (3) the model generalizes well to out-of-domain datasets without fine-tuning.',
    citations: [
      {
        source: 'research_paper.pdf',
        page: 4,
        chunk:
          'Dense retrieval consistently outperforms sparse methods across all evaluated benchmarks, with an average improvement of 9.3 points in top-20 retrieval accuracy.',
      },
      {
        source: 'research_paper.pdf',
        page: 7,
        chunk:
          'End-to-end training of DPR jointly with the reader yields additional gains of 1.1 EM on Natural Questions.',
      },
    ],
    session_id: '',
  },
  {
    answer:
      'The hybrid search strategy combines dense vector similarity (via sentence-transformers) with sparse BM25 keyword matching. The fusion is controlled by a configurable weight parameter — higher weight toward dense retrieval improves semantic understanding, while BM25 handles exact-match terms more reliably.',
    citations: [
      {
        source: 'system_architecture.pdf',
        page: 12,
        chunk:
          'The retrieval layer fuses dense and sparse scores using a linear combination: score = α·dense + (1-α)·sparse, where α is configurable at inference time.',
      },
    ],
    session_id: '',
  },
  {
    answer:
      'Context recall measures the fraction of relevant information from the reference answer that appears in the retrieved context. A score below 0.70 suggests the retriever is missing important chunks — consider increasing top-k or adjusting the chunk size.',
    citations: [
      {
        source: 'https://arxiv.org/abs/2005.11401',
        page: 2,
        chunk:
          'Context recall is defined as the proportion of ground-truth answer statements that are attributable to the retrieved context.',
      },
    ],
    session_id: '',
  },
];

let callCount = 0;

export async function mockQueryDocument(req: QueryRequest): Promise<QueryResponse> {
  await sleep(1500 + Math.random() * 500);
  const template = MOCK_RESPONSES[callCount % MOCK_RESPONSES.length];
  callCount++;
  return {
    ...template,
    session_id: req.session_id,
  };
}
