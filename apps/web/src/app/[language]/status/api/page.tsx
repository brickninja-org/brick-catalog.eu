import type { ApiRequest } from '@brickcatalog/database';

import { FormatNumber } from '@/components/format';
import { PageLayout } from '@/components/layout/PageLayout';
import { db } from '@/lib/prisma';

import { availablePeriods } from './available-periods';


async function getData(hours: number) {
  const now = new Date();
  const past = new Date();
  past.setHours(now.getHours() - hours);

  const apiRequests = await db.apiRequest.findMany({
    where: { createdAt: { gte: past }},
    orderBy: { createdAt: 'desc' },
  });

  const endpoints: Record<string, {
    totalResponseTimeMs: number,
    requestCount: number,
    errors: number,
    lastRequests: boolean[],
    requests: ApiRequest[],
  }> = {};
  const statusCodes: Record<number, number> = {};
  let errors = 0;

  apiRequests.forEach((request) => {
    if (!endpoints[request.endpoint]) {
      endpoints[request.endpoint] = { totalResponseTimeMs: 0, requestCount: 0, errors: 0, lastRequests: [], requests: [] };
    }

    endpoints[request.endpoint].requests.push(request);
    endpoints[request.endpoint].totalResponseTimeMs += request.responseTimeMs;
    endpoints[request.endpoint].requestCount++;
    statusCodes[request.statusCode] = (statusCodes[request.statusCode] ?? 0) + 1;

    if (request.statusCode !== 200) {
      errors++;
      endpoints[request.endpoint].errors++;
    }

    if (endpoints[request.endpoint].lastRequests.length < 100) {
      endpoints[request.endpoint].lastRequests.push(request.statusCode === 200);
    }
  });

  return { total: apiRequests.length, errors, endpoints, statusCodes, apiRequests };
}

export default async function StatusApiPage({ searchParams }: PageProps<'/[language]/status/api'>) {
  const { period } = await searchParams;
  const hours = availablePeriods.find(({ value }) => value === period)?.hours ?? 24;

  const { endpoints, errors, statusCodes, total } = await getData(hours);

  return (
    <PageLayout>
      <p>
        <FormatNumber value={total}/> requests
        and <FormatNumber value={errors}/> errors
        (<FormatNumber unit="%" value={errors / total * 100}/>) in the last {hours} hours.
      </p>
    </PageLayout>
  );
}
