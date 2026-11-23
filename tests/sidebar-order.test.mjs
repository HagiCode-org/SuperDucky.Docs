import assert from 'node:assert/strict';
import test from 'node:test';

import { DOCS_SIDEBAR } from '../src/config/sidebar.ts';
import { DOCS_LOCALE_SELECTOR_OPTIONS } from '../src/i18n/generated/docs-locale-resources.mjs';

test('all top-level sidebar groups provide translations for every non-root docs locale', () => {
  const requiredLocales = DOCS_LOCALE_SELECTOR_OPTIONS.map((locale) => locale.code).filter(
    (locale) => locale !== 'root',
  );

  for (const entry of DOCS_SIDEBAR) {
    for (const locale of requiredLocales) {
      assert.equal(
        typeof entry.translations?.[locale],
        'string',
        `missing ${locale} translation for ${entry.label}`,
      );
      assert.ok(entry.translations?.[locale]?.trim().length);
    }
  }
});

