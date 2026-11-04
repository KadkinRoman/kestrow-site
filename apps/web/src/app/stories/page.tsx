import type { Metadata } from 'next';
import { ProjectCase } from '@/components/sections/Cards';
import { QuizCta } from '@/components/sections/Cta';
import { PageHero } from '@/components/sections/Hero';
import { Section } from '@/components/ui/layout';
import { getProjects } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Customer stories',
  description: 'Real Kestrow customers and the cars they drove home: what they were looking for, what we found and what they paid.',
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Customer stories' }]}
        title="Customer stories"
        lead="Real buyers and the cars they drove home: what they were looking for, what we found and what they paid."
        media={null}
      />
      <Section spacing="none">
        {projects.map((p) => (
          <ProjectCase key={p.slug} project={p} />
        ))}
      </Section>
      <QuizCta />
    </>
  );
}
