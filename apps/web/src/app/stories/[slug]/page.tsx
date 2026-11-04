import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ModalButton } from '@/components/modals/ModalButton';
import { SpecsGrid } from '@/components/sections/Blocks';
import { QuizCta } from '@/components/sections/Cta';
import { CatalogRailSection, ReviewsSection } from '@/components/sections/Shared';
import { ChipList } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/layout';
import { Photo } from '@/components/ui/Photo';
import { RichText } from '@/components/ui/RichText';
import { getProject, getProjects } from '@/lib/content';
import { formatPrice } from '@/lib/format';
import { routes } from '@/lib/routes';
import { atLeastOne } from '@/lib/static-params';

// The page depends entirely on the slug, and 404 and 308 must be sent as HTTP statuses (SEO), so the params
// check is not hidden inside <Suspense>: navigating here may wait for the server. Known slugs are prerendered.
export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return atLeastOne((await getProjects()).map((p) => ({ slug: p.slug })), ['slug']);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return { title: project.seo?.title ?? project.title, description: project.seo?.description ?? project.excerpt };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();

  return (
    <>
      <section className="pt-6 pb-10">
        <Container>
          <Breadcrumbs items={[{ label: 'Customer stories', href: routes.projects() }, { label: project.title }]} />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
            <div>
              <Photo media={project.gallery[0]} label="Car photo" ratio="4/3" priority sizes="(min-width: 1024px) 700px, 100vw" />
              {project.gallery.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {project.gallery.slice(0, 5).map((m, n) => (
                    <Photo key={n} media={m} label={`Photo ${n + 1}`} ratio="1/1" sizes="120px" />
                  ))}
                </div>
              )}
            </div>
            <div>
              <ChipList items={project.chips} />
              <h1 className="mt-4 text-3xl font-semibold md:text-5xl">{project.title}</h1>
              <p className="mt-3 text-fg-muted">{project.excerpt}</p>
              {project.priceFrom && <b className="mt-6 block text-3xl">Paid {formatPrice(project.priceFrom)}</b>}
              <SpecsGrid specs={project.specs} className="mt-6 sm:grid-cols-1" />
              <RichText blocks={project.description} className="mt-4 space-y-4" />
              <div className="mt-6">
                <ModalButton
                  size="lg"
                  modal={{
                    type: 'lead',
                    title: 'I want a car like this',
                    text: 'Leave your contact details and a sales consultant will find you a similar car in your budget.',
                    extra: { project: project.title },
                  }}
                >
                  I want one like this
                </ModalButton>
              </div>
            </div>
          </div>
        </Container>
      </section>
      <ReviewsSection id="project-reviews" />
      <CatalogRailSection />
      <QuizCta />
    </>
  );
}
