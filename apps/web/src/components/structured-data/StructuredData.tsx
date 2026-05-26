import type { Thing, WithContext } from 'schema-dts';

import Script from 'next/script';

export interface StructuredDataProps {
  data: WithContext<Thing> | WithContext<Thing>[],
}

export function StructuredData({ data }: StructuredDataProps) {
  return <Script dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} id="structured-data" type="application/ld+json"/>;
}
