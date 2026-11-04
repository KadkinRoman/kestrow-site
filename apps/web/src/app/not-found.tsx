import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/layout';
import { routes } from '@/lib/routes';

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm text-fg-muted">Error 404</p>
      <h1 className="mt-2 text-3xl font-semibold md:text-5xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-xl text-fg-muted">
        This page may have moved, or the car may already have found a new owner. Browse our current inventory or head
        back to the home page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href={routes.catalog()}>Browse inventory</Button>
        <Button href={routes.home()} variant="secondary">
          Back to home
        </Button>
      </div>
    </Container>
  );
}
