import type { NextApiRequest, NextApiResponse } from 'next';

import type { HttpMethod } from '@/lib/api/client';
import { createApiClientFromRequest } from '@/lib/auth/client-factory';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the path from the query (everything after /api/proxy/)
  const { path, ...queryParams } = req.query;

  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ error: 'Invalid API path' });
  }

  const apiPath = '/' + path.join('/');

  try {
    const client = createApiClientFromRequest(req);

    const method = req.method as HttpMethod;

    // Don't include body for GET/HEAD requests
    const shouldIncludeBody = method !== 'GET' && method !== 'HEAD';

    const result = await client.request(apiPath, {
      method,
      body: shouldIncludeBody && req.body ? req.body : undefined,
      query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    if (result.ok) {
      return res.status(200).json(result.value);
    } else {
      const error = result.error;
      return res.status(error.status || 500).json(error);
    }
  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(500).json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
