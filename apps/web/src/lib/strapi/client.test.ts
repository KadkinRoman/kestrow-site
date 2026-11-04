import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { StrapiError, isNotFound, mediaUrl, toQueryString } from './client';

describe('toQueryString', () => {
  it('nested objects and arrays in qs format, skips empty values', () => {
    const qs = toQueryString({
      filters: { slug: { $eq: 'x' }, category: { id: { $notNull: true } } },
      sort: ['createdAt:asc', 'id:asc'],
      pagination: { page: 2, pageSize: 12 },
      populate: '*',
      skip: undefined,
      none: null,
    });
    assert.equal(
      decodeURIComponent(qs),
      'filters[slug][$eq]=x&filters[category][id][$notNull]=true&sort[0]=createdAt:asc&sort[1]=id:asc&pagination[page]=2&pagination[pageSize]=12&populate=*',
    );
  });

  it('encodes special characters', () => {
    assert.equal(toQueryString({ q: 'é&ü' }), 'q=%C3%A9%26%C3%BC');
  });
});

describe('mediaUrl', () => {
  afterEach(() => {
    delete process.env.STRAPI_PUBLIC_URL;
  });
  it('relative path → absolute Strapi URL, leaves absolute URLs alone', () => {
    process.env.STRAPI_PUBLIC_URL = 'https://cms.example/';
    assert.equal(mediaUrl('/uploads/a.jpg'), 'https://cms.example/uploads/a.jpg');
    assert.equal(mediaUrl('https://cdn.example/x.jpg'), 'https://cdn.example/x.jpg');
  });
});

describe('StrapiError', () => {
  it('isNotFound is true only for 404', () => {
    assert.equal(isNotFound(new StrapiError(404, 'nf')), true);
    assert.equal(isNotFound(new StrapiError(500, 'x')), false);
    assert.equal(isNotFound(new Error('x')), false);
  });
});
