'use client';

import { SearchField } from '@heroui/react';
import { useState } from 'react';

export function BlogSearchField() {
  const [value, setValue] = useState('');

  return (
    <div className="relative">
      <SearchField name="blog-search" value={value} onChange={setValue}>
        <SearchField.Group>
          <SearchField.SearchIcon/>
          <SearchField.Input className="w-70" placeholder="Search blog posts..."/>
          <SearchField.ClearButton/>
        </SearchField.Group>
      </SearchField>
    </div>
  );
}
