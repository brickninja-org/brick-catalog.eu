'use client';

import { Button } from '@heroui/react/button';
import { Card } from '@heroui/react/card';
import { Chip } from '@heroui/react/chip';
import { Table } from '@heroui/react/table';
import { Typography } from '@heroui/react/typography';
import { KPI, Segment } from '@heroui-pro/react';
import Link from 'next/link';
import { useState } from 'react';

export interface CatalogOverviewData {
  totalElements: number,
  totalDesigns: number,
  totalColors: number,
  totalCategories: number,
  totalSubcategories: number,
  removedElements: number,
  uncategorizedDesigns: number,
  topColorUsage: Array<{ id: number, name: string, hex: string, count: number }>,
  rareColors: Array<{ id: number, name: string, hex: string, count: number }>,
  topSubcategories: Array<{ id: number, name: string, designCount: number }>,
  topCategories: Array<{ id: number, name: string, subcategoryCount: number }>,
  colorFamilies: Array<{ family: string, count: number }>,
  pieceTypeDistribution: Array<{ pieceType: string, count: number }>,
  topDesignVariants: Array<{ id: number, name: string, pieceType: string, count: number }>,
}

function formatInt(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

interface CatalogDomain {
  key: string,
  label: string,
  href?: string,
  available: boolean,
}

type InsightView = 'colors' | 'subcategories' | 'families' | 'pieceTypes' | 'categories' | 'designs' | 'rareColors';

const DOMAINS: CatalogDomain[] = [
  { key: 'elements', label: 'Elements', href: '/element', available: true },
  { key: 'sets', label: 'Sets', available: false },
  { key: 'gear', label: 'Gear', available: false },
];

const QUICK_STATS: Array<{ label: string, valueKey: keyof Pick<CatalogOverviewData, 'totalDesigns' | 'totalColors' | 'totalCategories' | 'totalSubcategories'>, href: string }> = [
  { label: 'Designs', valueKey: 'totalDesigns', href: '/element' },
  { label: 'Colors', valueKey: 'totalColors', href: '/element/color' },
  { label: 'Categories', valueKey: 'totalCategories', href: '/element/category' },
  { label: 'Subcategories', valueKey: 'totalSubcategories', href: '/element/subcategory' },
];

const INSIGHT_OPTIONS: Array<{ id: InsightView, label: string }> = [
  { id: 'colors', label: 'Top Colors' },
  { id: 'subcategories', label: 'Top Subcategories' },
  { id: 'categories', label: 'Top Categories' },
  { id: 'designs', label: 'Top Design Variants' },
  { id: 'pieceTypes', label: 'Piece Types' },
  { id: 'families', label: 'Color Families' },
  { id: 'rareColors', label: 'Rare Colors' },
];

const QUICK_LINKS: Array<{ href: string, label: string }> = [
  { href: '/element', label: 'Browse all elements' },
  { href: '/element/color', label: 'Browse by color' },
  { href: '/element/subcategory', label: 'Browse by subcategory' },
  { href: '/element/category', label: 'Browse by category' },
  { href: '/element/registrations', label: 'New registrations' },
  { href: '/element/design-variants', label: 'Top design variants' },
  { href: '/element/rare-colors', label: 'Rare colors' },
  { href: '/element/piece-types', label: 'Piece type stats' },
];

export function ElementCatalogOverview({ overview }: { overview: CatalogOverviewData }) {
  const [insightView, setInsightView] = useState<InsightView>('colors');
  const activeElements = Math.max(0, overview.totalElements - overview.removedElements);
  const activeElementRatio = overview.totalElements > 0 ? (activeElements / overview.totalElements) * 100 : 0;
  const colorCoverage = overview.totalElements > 0 ? (overview.totalColors / overview.totalElements) * 100 : 0;

  function renderInsightsTable() {
    if (insightView === 'colors') {
      return (
        <Table aria-label="Top used colors" variant="secondary">
          <Table.Content>
            <Table.Header>
              <Table.Column>Color</Table.Column>
              <Table.Column>Usage</Table.Column>
            </Table.Header>
            <Table.Body>
              {overview.topColorUsage.map((color) => (
                <Table.Row key={color.id}>
                  <Table.Cell>
                    <span className="inline-flex items-center gap-2">
                      <span className="size-3.5 rounded-sm ring-1 ring-black/15" style={{ backgroundColor: color.hex }}/>
                      <span>{color.name}</span>
                      <Chip size="sm" variant="soft">#{color.id}</Chip>
                    </span>
                  </Table.Cell>
                  <Table.Cell>{formatInt(color.count)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table>
      );
    }

    if (insightView === 'subcategories') {
      return (
        <Table aria-label="Largest subcategories" variant="secondary">
          <Table.Content>
            <Table.Header>
              <Table.Column>Subcategory</Table.Column>
              <Table.Column>Designs</Table.Column>
            </Table.Header>
            <Table.Body>
              {overview.topSubcategories.map((subcategory) => (
                <Table.Row key={subcategory.id}>
                  <Table.Cell><Link href={`/element/subcategory/${subcategory.id}`}>{subcategory.name}</Link></Table.Cell>
                  <Table.Cell>{formatInt(subcategory.designCount)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table>
      );
    }

    if (insightView === 'families') {
      return (
        <Table aria-label="Color family distribution" variant="secondary">
          <Table.Content>
            <Table.Header>
              <Table.Column>Family</Table.Column>
              <Table.Column>Colors</Table.Column>
            </Table.Header>
            <Table.Body>
              {overview.colorFamilies.map((family) => (
                <Table.Row key={family.family}>
                  <Table.Cell>{family.family}</Table.Cell>
                  <Table.Cell>{formatInt(family.count)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table>
      );
    }

    if (insightView === 'categories') {
      return (
        <Table aria-label="Top categories" variant="secondary">
          <Table.Content>
            <Table.Header>
              <Table.Column>Category</Table.Column>
              <Table.Column>Subcategories</Table.Column>
            </Table.Header>
            <Table.Body>
              {overview.topCategories.map((category) => (
                <Table.Row key={category.id}>
                  <Table.Cell><Link href={`/element/category/${category.id}`}>{category.name}</Link></Table.Cell>
                  <Table.Cell>{formatInt(category.subcategoryCount)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table>
      );
    }

    if (insightView === 'pieceTypes') {
      return (
        <Table aria-label="Piece type distribution" variant="secondary">
          <Table.Content>
            <Table.Header>
              <Table.Column>Piece Type</Table.Column>
              <Table.Column>Designs</Table.Column>
            </Table.Header>
            <Table.Body>
              {overview.pieceTypeDistribution.map((pieceType) => (
                <Table.Row key={pieceType.pieceType}>
                  <Table.Cell>{pieceType.pieceType}</Table.Cell>
                  <Table.Cell>{formatInt(pieceType.count)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table>
      );
    }

    if (insightView === 'designs') {
      return (
        <Table aria-label="Top design variants" variant="secondary">
          <Table.Content>
            <Table.Header>
              <Table.Column>Design</Table.Column>
              <Table.Column>Element Variants</Table.Column>
            </Table.Header>
            <Table.Body>
              {overview.topDesignVariants.map((design) => (
                <Table.Row key={design.id}>
                  <Table.Cell>
                    <Link href={`/element/design/${design.id}`}>{design.name}</Link> ({design.pieceType})
                  </Table.Cell>
                  <Table.Cell>{formatInt(design.count)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table>
      );
    }

    return (
      <Table aria-label="Rare colors in elements" variant="secondary">
        <Table.Content>
          <Table.Header>
            <Table.Column>Color</Table.Column>
            <Table.Column>Elements Using Color</Table.Column>
          </Table.Header>
          <Table.Body>
            {overview.rareColors.map((color) => (
              <Table.Row key={color.id}>
                <Table.Cell>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-3.5 rounded-sm ring-1 ring-black/15" style={{ backgroundColor: color.hex }}/>
                    <span>{color.name}</span>
                    <Chip size="sm" variant="soft">#{color.id}</Chip>
                  </span>
                </Table.Cell>
                <Table.Cell>{formatInt(color.count)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Typography type="h2">Element Catalog Snapshot</Typography>
        <Typography color="muted" type="body-sm">
          Fast overview of availability, variety and color options for LEGO builders.
        </Typography>
      </div>

      <Card className="border border-divider bg-content1">
        <Card.Content className="p-3">
          <Segment aria-label="Catalog domains" selectedKey="elements" size="sm">
            {DOMAINS.map((domain) => (
              <Segment.Item key={domain.key} id={domain.key} isDisabled={!domain.available}>
                {domain.available && domain.href ? (
                  <Link className="inline-flex items-center gap-2" href={domain.href}>
                    <span>{domain.label}</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>{domain.label}</span>
                    <Chip size="sm" variant="soft">Soon</Chip>
                  </span>
                )}
              </Segment.Item>
            ))}
          </Segment>
        </Card.Content>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <KPI className="border border-divider bg-content1">
          <KPI.Header>
            <KPI.Title>Available Elements</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value locale="en-US" maximumFractionDigits={0} value={activeElements}/>
            <KPI.Trend trend="up" variant="secondary">
              Ready to browse
            </KPI.Trend>
          </KPI.Content>
          <KPI.Footer>
            <Link className="link text-xs" href="/element">Open element catalog</Link>
          </KPI.Footer>
        </KPI>

        <KPI className="border border-divider bg-content1">
          <KPI.Header>
            <KPI.Title>Element Variety</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value locale="en-US" maximumFractionDigits={0} value={overview.totalDesigns}/>
            <KPI.Trend trend="up" variant="secondary">
              unique design shapes
            </KPI.Trend>
          </KPI.Content>
          <KPI.Progress aria-label="Active elements availability" status="success" value={clampPercent(activeElementRatio)}/>
          <KPI.Footer>
            <span className="text-xs text-foreground-500">{activeElementRatio.toFixed(1)}% of known elements currently available</span>
          </KPI.Footer>
        </KPI>

        <KPI className="border border-divider bg-content1">
          <KPI.Header>
            <KPI.Title>Color Choice</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value locale="en-US" maximumFractionDigits={0} value={overview.totalColors}/>
            <KPI.Trend trend="up" variant="primary">
              official colors in catalog
            </KPI.Trend>
          </KPI.Content>
          <KPI.Progress aria-label="Color coverage across elements" status="success" value={clampPercent(colorCoverage)}/>
          <KPI.Footer>
            <Link className="link text-xs" href="/element/color">Browse colors</Link>
          </KPI.Footer>
        </KPI>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {QUICK_STATS.map((item) => (
          <Card key={item.label} className="h-full border border-divider bg-content1">
            <Card.Content className="p-4">
              <p className="text-xs uppercase tracking-wide text-foreground-500">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{formatInt(overview[item.valueKey])}</p>
              <p className="mt-2 text-xs text-foreground-500">
                {item.label === 'Colors' ? `${colorCoverage.toFixed(1)} colors per 100 elements` : 'Useful browse dimension'}
              </p>
              <Button as={Link} className="mt-3 w-full" color="default" href={item.href} size="sm" variant="secondary">
                Open
              </Button>
            </Card.Content>
          </Card>
        ))}
      </div>

      <Card className="border border-divider bg-content1">
        <Card.Content className="p-2 sm:p-4">
          <div className="mb-3">
            <Segment
              aria-label="Element insights view"
              selectedKey={insightView}
              size="sm"
              onSelectionChange={(key) => setInsightView(String(key) as typeof insightView)}
            >
              {INSIGHT_OPTIONS.map((option) => (
                <Segment.Item key={option.id} id={option.id}>{option.label}</Segment.Item>
              ))}
            </Segment>
          </div>
          {renderInsightsTable()}
        </Card.Content>
      </Card>

      <Card className="border border-divider bg-content1">
        <Card.Content className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Find Parts Faster</p>
              <p className="text-sm text-foreground-600">
                Start with color when matching visible parts, or with subcategory when you know the function of the piece.
              </p>
            </div>
            <Button as={Link} color="primary" href="/element/color" size="sm" variant="secondary">
              Find by color
            </Button>
          </div>
        </Card.Content>
      </Card>

      <Card className="border border-divider bg-content1">
        <Card.Content className="p-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
            {QUICK_LINKS.map((item) => (
              <Button key={item.href} as={Link} href={item.href} size="sm" variant="secondary">{item.label}</Button>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
