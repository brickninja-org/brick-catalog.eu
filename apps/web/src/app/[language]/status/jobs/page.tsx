import { Chip } from '@heroui/react/chip';
import { Table } from '@heroui/react/table';
import { Suspense } from 'react';

import { FormatDate, FormatNumber } from '@/components/format';
import { PageLayout } from '@/components/layout/PageLayout';
import { ReloadCheckbox } from '@/components/reload/ReloadCheckbox';
import { cache } from '@/lib/cache';
import { db } from '@/lib/prisma';

const getJobs = cache(async () => {
  const now = new Date();

  const [active, scheduled, completed] = await Promise.all([
    db.job.findMany({ where: { OR: [{ state: { in: ['Running', 'Queued'] }}, { cron: { not: '' }}], scheduledAt: { lte: now }}, orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }] }),
    db.job.findMany({ where: { OR: [{ state: { in: ['Running', 'Queued'] }}, { cron: { not: '' }}], scheduledAt: { gt: now }}, orderBy: [{ scheduledAt: 'asc' }] }),
    db.job.findMany({ where: { state: { notIn: ['Running', 'Queued'] }}, orderBy: { completedAt: 'desc' }, take: 100 }),
  ]);

  return { active, scheduled, completed, now };
}, ['jobs'], { revalidate: 1, tags: ['jobs'] });

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <>
      {minutes > 0 && <><FormatNumber unit="m" value={minutes}/> </>}
      <FormatNumber unit="s" value={seconds}/>
    </>
  );
}

async function JobPage() {
  const { active, scheduled, completed, now } = await getJobs();

  return (
    <PageLayout>
      <Suspense fallback={null}>
        <ReloadCheckbox intervalMs={1000}/>
      </Suspense>
      <h2 className="mb-3 ml-2 mt-8 text-sm font-semibold" id="active-jobs-heading">Active Jobs ({active.length + scheduled.length})</h2>
      <Table aria-labelledby="active-jobs-heading" variant="secondary">
        <Table.Content>
          <Table.Header>
            <Table.Column className="w-px">Status</Table.Column>
            <Table.Column isRowHeader>Job</Table.Column>
            <Table.Column className="w-px text-right">Runtime</Table.Column>
            <Table.Column className="w-px text-right">Scheduled</Table.Column>
          </Table.Header>
          <Table.Body>
            {[...active, ...scheduled].map((job) => (
              <Table.Row key={job.id}>
                <Table.Cell className="nowrap">
                  <Chip
                    color={job.state === 'Running' ? 'warning' : ((job.scheduledAt < now) ? 'default' : 'accent')}
                    size="sm"
                    variant="soft"
                  >
                    {job.state === 'Running' ? 'Running' : 'Queued'}
                  </Chip>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-medium">{job.type}</span>
                </Table.Cell>
                <Table.Cell className="text-right">
                  {job.state === 'Running' ? formatTime(Math.round((now.valueOf() - job.startedAt!.valueOf()) / 1000)) : '-'}
                </Table.Cell>
                <Table.Cell className="text-right whitespace-nowrap">
                  <FormatDate relative date={job.scheduledAt}/>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table>

      <h2 className="mb-3 ml-2 mt-8 text-sm font-semibold">Finished Jobs ({completed.length})</h2>
      <Table aria-label="Finished jobs" variant="secondary">
        <Table.Content>
          <Table.Header>
            <Table.Column className="w-px">Status</Table.Column>
            <Table.Column isRowHeader className="w-px">Job</Table.Column>
            <Table.Column>Output</Table.Column>
            <Table.Column className="w-px text-right">Runtime</Table.Column>
            <Table.Column className="w-px text-right">Finished</Table.Column>
          </Table.Header>
          <Table.Body>
            {completed.map((job) => (
              <Table.Row key={job.id}>
                <Table.Cell className="nowrap">
                  <Chip
                    color={job.state === 'Failed' ? 'danger' : 'success'}
                    size="sm"
                    variant="soft"
                  >
                    {job.state}
                  </Chip>
                </Table.Cell>
                <Table.Cell className="font-medium">
                  {job.type}
                </Table.Cell>
                <Table.Cell className="text-muted whitespace-pre-wrap break-normal">
                  {job.output}
                </Table.Cell>
                <Table.Cell className="text-right whitespace-nowrap">
                  {formatTime((job.completedAt!.valueOf() - job.startedAt!.valueOf()) / 1000)}
                </Table.Cell>
                <Table.Cell className="text-right whitespace-nowrap">
                  <FormatDate relative date={job.completedAt}/>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table>
    </PageLayout>
  );
}

export default JobPage;
