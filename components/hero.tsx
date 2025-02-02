import { Suspense } from 'react';
import { HeroSearch } from '@/components/hero-search';
import { LogoSlider } from '@/components/logo-slider';
import { SearchHeroSkeleton } from '@/components/skeletons';

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-white via-neutral-50 to-neutral-50 pt-12">
      <Suspense fallback={<SearchHeroSkeleton />}>
        <HeroSearch />
      </Suspense>
      <LogoSlider />
    </section>
  );
}
