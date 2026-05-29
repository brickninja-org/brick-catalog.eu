import { Chip } from '@heroui/react/chip';
import { ItemCard, ItemCardGroup, KPI, KPIGroup } from '@heroui-pro/react';
import { Database, RefreshCw, Server, Settings, Wrench } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { WorkflowMonitor } from './BlogWorkflowRunsCard.client';
import { TriggerBlogSyncButton } from './TriggerBlogSyncButton.client';

export default async function AdminDashboardPage({ params }: PageProps<'/[language]/admin'>) {
  const { language } = await params;
  const t = await getTranslations({ locale: language });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('admin.dashboard.title')}</h1>
      </div>

      <KPIGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPI>
          <KPI.Header>
            <KPI.Icon className="bg-accent-soft">
              <Server className="size-5 text-accent"/>
            </KPI.Icon>
            <KPI.Title>{t('admin.dashboard.systemStatus.title')}</KPI.Title>
          </KPI.Header>
          <KPI.Content className="gap-2">
            <Chip color="success" variant="primary">{t('admin.dashboard.systemStatus.value')}</Chip>
            <p className="text-muted text-xs">{t('admin.dashboard.systemStatus.description')}</p>
          </KPI.Content>
        </KPI>

        <KPI>
          <KPI.Header>
            <KPI.Icon className="bg-default-100">
              <Wrench className="size-5 text-muted"/>
            </KPI.Icon>
            <KPI.Title>{t('admin.dashboard.maintenance.title')}</KPI.Title>
          </KPI.Header>
          <KPI.Content className="gap-2">
            <Chip>{t('admin.dashboard.maintenance.value')}</Chip>
            <p className="text-muted text-xs">{t('admin.dashboard.maintenance.description')}</p>
          </KPI.Content>
        </KPI>

        <KPI>
          <KPI.Header>
            <KPI.Icon className="bg-accent-soft">
              <Database className="size-5 text-accent"/>
            </KPI.Icon>
            <KPI.Title>{t('admin.dashboard.database.title')}</KPI.Title>
          </KPI.Header>
          <KPI.Content className="gap-2">
            <Chip color="success" variant="primary">{t('admin.dashboard.database.value')}</Chip>
            <p className="text-muted text-xs">{t('admin.dashboard.database.description')}</p>
          </KPI.Content>
        </KPI>
      </KPIGroup>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{t('admin.dashboard.quickActions.title')}</h2>
          <ItemCardGroup columns={2}>
            <ItemCard>
              <ItemCard.Icon>
                <RefreshCw className="size-5" />
              </ItemCard.Icon>
              <ItemCard.Content>
                <ItemCard.Title>{t('admin.dashboard.quickActions.refresh.title')}</ItemCard.Title>
                <ItemCard.Description>{t('admin.dashboard.quickActions.refresh.description')}</ItemCard.Description>
              </ItemCard.Content>
              <ItemCard.Action>
                <TriggerBlogSyncButton
                  compact
                  description={t('admin.dashboard.quickActions.refresh.description')}
                  title={t('admin.dashboard.quickActions.refresh.title')}
                />
              </ItemCard.Action>
            </ItemCard>

            <Link href="/admin/views">
              <ItemCard>
                <ItemCard.Icon>
                  <Database className="size-5" />
                </ItemCard.Icon>
                <ItemCard.Content>
                  <ItemCard.Title>{t('admin.dashboard.quickActions.manageData.title')}</ItemCard.Title>
                  <ItemCard.Description>{t('admin.dashboard.quickActions.manageData.description')}</ItemCard.Description>
                </ItemCard.Content>
              </ItemCard>
            </Link>

            <Link href="/status/jobs">
              <ItemCard>
                <ItemCard.Icon>
                  <Server className="size-5" />
                </ItemCard.Icon>
                <ItemCard.Content>
                  <ItemCard.Title>{t('admin.dashboard.quickActions.logs.title')}</ItemCard.Title>
                  <ItemCard.Description>{t('admin.dashboard.quickActions.logs.description')}</ItemCard.Description>
                </ItemCard.Content>
              </ItemCard>
            </Link>

            <Link href="/status/database">
              <ItemCard>
                <ItemCard.Icon>
                  <Wrench className="size-5" />
                </ItemCard.Icon>
                <ItemCard.Content>
                  <ItemCard.Title>{t('admin.dashboard.quickActions.maintenance.title')}</ItemCard.Title>
                  <ItemCard.Description>{t('admin.dashboard.quickActions.maintenance.description')}</ItemCard.Description>
                </ItemCard.Content>
              </ItemCard>
            </Link>

            <Link href="/status/api">
              <ItemCard>
                <ItemCard.Icon>
                  <Settings className="size-5" />
                </ItemCard.Icon>
                <ItemCard.Content>
                  <ItemCard.Title>{t('admin.dashboard.quickActions.settings.title')}</ItemCard.Title>
                  <ItemCard.Description>{t('admin.dashboard.quickActions.settings.description')}</ItemCard.Description>
                </ItemCard.Content>
              </ItemCard>
            </Link>
          </ItemCardGroup>
        </div>

        <WorkflowMonitor/>
      </div>
    </div>
  );
}
