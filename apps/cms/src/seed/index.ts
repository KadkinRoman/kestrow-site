import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Core } from '@strapi/strapi';
import * as data from './data';
import type { NavSeedItem } from './data';

/**
 * Demo content. Runs from bootstrap when SEED_DEMO=true (only if there are no vehicle listings yet)
 * or SEED_DEMO=force (delete the demo records, photos and menus and recreate them).
 */

type Strapi = Core.Strapi;
type Doc = { id: number; documentId: string } & Record<string, unknown>;

/* Without generated types (types/generated) UIDs are untyped — a wrapper over the Document Service. */
const docs = (strapi: Strapi, uid: string) => strapi.documents(uid as never) as unknown as {
  count(params?: object): Promise<number>;
  findMany(params?: object): Promise<Doc[]>;
  create(params: { data: object; status?: 'published' | 'draft' }): Promise<Doc>;
  delete(params: { documentId: string }): Promise<unknown>;
};

/** Types with Draft & Publish — created already published */
const DRAFT_PUBLISH = new Set(['api::page.page', 'api::kitchen.kitchen', 'api::project.project', 'api::article.article', 'api::promo.promo']);

/** Deletion order for force: dependents first */
const SEEDED_TYPES = [
  'api::article.article',
  'api::project.project',
  'api::kitchen.kitchen',
  'api::kitchen-tag.kitchen-tag',
  'api::kitchen-category.kitchen-category',
  'api::article-tag.article-tag',
  'api::author.author',
  'api::page.page',
  'api::promo.promo',
  'api::material.material',
  'api::review.review',
  'api::faq.faq',
  'api::order-stage.order-stage',
  'api::form.form',
  'api::setting.setting',
  'api::topline.topline',
  'api::quiz.quiz',
];

/* ---------- Images (seed-assets/: CC-licensed photos; credits.json holds the attributions) ---------- */

type Credit = { file: string; title: string; creator: string; source: string; license: string };

/** Marker in the caption of every seeded photo — used to find them again on SEED_DEMO=force */
const CAPTION_MARK = '[seed]';

/** Uploads a seed photo to the media library once and returns the file id; the same name reuses the file. */
function makeUploader(strapi: Strapi) {
  const dir = path.join(strapi.dirs.app.root, 'seed-assets');
  const credits = new Map<string, Credit>();
  try {
    for (const c of JSON.parse(fs.readFileSync(path.join(dir, 'credits.json'), 'utf8')) as Credit[]) credits.set(c.file, c);
  } catch {
    strapi.log.warn('[seed] seed-assets/credits.json not found — images are uploaded without captions');
  }
  const cache = new Map<string, number>();
  const uploadService = strapi.plugin('upload').service('upload') as {
    upload(params: { data: object; files: object }): Promise<{ id: number }[]>;
  };

  const one = async (name: string | undefined): Promise<number | undefined> => {
    if (!name) return undefined;
    if (cache.has(name)) return cache.get(name);
    const src = path.join(dir, name);
    if (!fs.existsSync(src)) {
      strapi.log.warn(`[seed] image ${name} not found in seed-assets — skipped`);
      return undefined;
    }
    // the upload service moves and optimises the file, so it works on a temporary copy
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
    const tmp = path.join(tmpDir, name);
    fs.copyFileSync(src, tmp);
    const credit = credits.get(name);
    try {
      const [file] = await uploadService.upload({
        data: {
          fileInfo: {
            name: name.replace(/\.[a-z]+$/i, ''),
            alternativeText: credit?.title ?? name,
            caption: credit ? `${CAPTION_MARK} ${credit.title} — ${credit.creator} (${credit.source}, ${credit.license})` : CAPTION_MARK,
          },
        },
        files: { filepath: tmp, originalFilename: name, mimetype: 'image/jpeg', size: fs.statSync(tmp).size },
      });
      cache.set(name, file.id);
      return file.id;
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  };

  const many = async (names: string[] | undefined) => {
    const ids: number[] = [];
    for (const n of names ?? []) {
      const id = await one(n);
      if (id) ids.push(id);
    }
    return ids;
  };

  return { one, many, count: () => cache.size };
}

export async function seedDemoContent(strapi: Strapi, { force = false } = {}) {
  const existing = await docs(strapi, 'api::kitchen.kitchen').count({});
  if (existing > 0 && !force) {
    strapi.log.info('[seed] demo content already exists — skipping (SEED_DEMO=force to recreate)');
    return;
  }
  if (force) await wipe(strapi);
  const img = makeUploader(strapi);

  const create = async (uid: string, entry: object) =>
    docs(strapi, uid).create({ data: entry, ...(DRAFT_PUBLISH.has(uid) ? { status: 'published' as const } : {}) });

  const bySlug = async (uid: string, list: { slug: string }[]) => {
    const map = new Map<string, string>();
    for (const entry of list) map.set(entry.slug, (await create(uid, entry)).documentId);
    return map;
  };

  const pageIds = await bySlug('api::page.page', data.pages);
  const categoryIds = await bySlug(
    'api::kitchen-category.kitchen-category',
    data.categories.map((c) => ({ ...c, description: `${c.name} in stock at Kestrow Motors, Denver — inspected, no-haggle prices.` })),
  );

  const tagIds = await bySlug('api::kitchen-tag.kitchen-tag', data.kitchenTags);
  const kitchenIds = new Map<string, string>();
  for (const { categorySlug, tagSlugs, gallery, ...kitchen } of data.kitchens) {
    const doc = await create('api::kitchen.kitchen', {
      ...kitchen,
      category: categoryIds.get(categorySlug),
      tags: tagSlugs.map((t) => tagIds.get(t)).filter(Boolean),
      gallery: await img.many(gallery),
    });
    kitchenIds.set(kitchen.slug, doc.documentId);
  }
  for (const { gallery, ...project } of data.projects) {
    await create('api::project.project', { ...project, gallery: await img.many(gallery) });
  }

  const articleTagIds = await bySlug('api::article-tag.article-tag', data.articleTags);
  const authorIds = new Map<string, string>();
  for (const { key, ...author } of data.authors) authorIds.set(key, (await create('api::author.author', author)).documentId);
  for (const { tagSlug, authorKey, expertKey, cover, content, ...article } of data.articles) {
    const blocks = [];
    for (const block of content) {
      blocks.push(block.__component === 'article.image' ? { ...block, image: await img.one(block.image as string | undefined) } : block);
    }
    await create('api::article.article', {
      ...article,
      cover: await img.one(cover),
      content: blocks,
      tag: articleTagIds.get(tagSlug),
      author: authorKey ? authorIds.get(authorKey) : undefined,
      expert: expertKey ? authorIds.get(expertKey) : undefined,
    });
  }

  for (const { image, ...promo } of data.promos) await create('api::promo.promo', { ...promo, image: await img.one(image) });
  for (const { image, ...material } of data.materials) {
    await create('api::material.material', { ...material, image: await img.one(image) });
  }
  for (const { kitchenSlug, photo, ...review } of data.reviews) {
    await create('api::review.review', {
      ...review,
      photo: await img.one(photo),
      kitchen: kitchenSlug ? kitchenIds.get(kitchenSlug) : undefined,
    });
  }
  for (const faq of data.faqs) await create('api::faq.faq', faq);
  for (const stage of data.orderStages) await create('api::order-stage.order-stage', stage);
  for (const form of data.forms) await create('api::form.form', form);

  await create('api::setting.setting', data.setting);
  await create('api::topline.topline', data.topline);
  await create('api::quiz.quiz', data.quiz);

  await seedNavigations(strapi, { page: pageIds, 'kitchen-category': categoryIds });

  strapi.log.info(
    `[seed] done: pages ${data.pages.length}, cars ${data.kitchens.length}, articles ${data.articles.length}, ` +
      `projects ${data.projects.length}, offers ${data.promos.length}, forms ${data.forms.length}, menus ${data.navigations.length}, ` +
      `images ${img.count()}`,
  );
}

async function wipe(strapi: Strapi) {
  for (const uid of SEEDED_TYPES) {
    const list = await docs(strapi, uid).findMany({ fields: ['documentId'] });
    for (const { documentId } of list) await docs(strapi, uid).delete({ documentId });
  }
  // seed photos are removed from the media library so a re-seed does not duplicate them
  const files = (await strapi.db
    .query('plugin::upload.file')
    .findMany({ where: { caption: { $startsWith: CAPTION_MARK } } })) as object[];
  const remove = strapi.plugin('upload').service('upload').remove as (file: object) => Promise<unknown>;
  for (const file of files) await remove(file);

  const admin = strapi.plugin('navigation').service('admin');
  const seededNames = new Set(data.navigations.map((n) => n.name));
  for (const nav of await admin.get({})) {
    if (seededNames.has(nav.name)) await admin.delete({ documentId: nav.documentId, auditLog: undefined });
  }
  strapi.log.info(`[seed] demo records, ${files.length} photos and menus deleted`);
}

/* ---------- Menus ---------- */

type RefIds = Record<'page' | 'kitchen-category', Map<string, string>>;

const UID_BY_REF = { page: 'api::page.page', 'kitchen-category': 'api::kitchen-category.kitchen-category' } as const;

function buildItems(items: NavSeedItem[], ids: RefIds, parentKey = '', level = 0): object[] {
  return items.map((item, index) => {
    const type = item.wrapper ? 'WRAPPER' : item.href ? 'EXTERNAL' : 'INTERNAL';
    const segment = item.ref ? item.ref[1] : `item-${index + 1}`;
    const uiRouterKey = parentKey ? `${parentKey}-${segment}` : segment;
    const documentId = item.ref ? ids[item.ref[0]].get(item.ref[1]) : undefined;
    if (item.ref && !documentId) throw new Error(`[seed] menu: no record ${item.ref.join(':')}`);

    return {
      title: item.title,
      type,
      path: type === 'EXTERNAL' ? null : segment,
      externalPath: item.href ?? null,
      uiRouterKey,
      menuAttached: level === 0,
      order: index + 1,
      collapsed: false,
      autoSync: false,
      additionalFields: {},
      related: item.ref ? { __type: UID_BY_REF[item.ref[0]], documentId } : undefined,
      items: item.items ? buildItems(item.items, ids, uiRouterKey, level + 1) : [],
    };
  });
}

async function seedNavigations(strapi: Strapi, ids: RefIds) {
  const admin = strapi.plugin('navigation').service('admin');
  let all = await admin.get({});

  for (const nav of data.navigations) {
    let entity = all.find((n: Doc) => n.name === nav.name);
    if (!entity) {
      entity = await admin.post({ payload: { name: nav.name, visible: true }, auditLog: undefined });
      all = await admin.get({});
    }
    const current = await admin.getById({ documentId: entity.documentId });
    if (current.items?.length) continue;

    await admin.put({
      auditLog: undefined,
      payload: {
        id: current.id,
        documentId: current.documentId,
        name: nav.name,
        visible: true,
        locale: current.locale,
        items: buildItems(nav.items, ids),
      },
    });
  }

  // The empty default menu the plugin creates on first start is no longer needed
  for (const nav of await admin.get({})) {
    if (nav.slug === 'navigation' && !(nav.items?.length)) {
      await admin.delete({ documentId: nav.documentId, auditLog: undefined });
    }
  }
}
