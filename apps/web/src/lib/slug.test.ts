import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases and cleans up separators', () => {
    assert.equal(slugify('Laminate vs. MDF'), 'laminate-vs-mdf');
    assert.equal(slugify('  Hello, World!  '), 'hello-world');
    assert.equal(slugify('Soft-close hinges & drawers'), 'soft-close-hinges-drawers');
  });
});
