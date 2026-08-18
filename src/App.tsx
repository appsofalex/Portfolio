import { SiteHeader } from '@/components/common/site-header'
import SocialCards from '@/components/ui/card-fan-carousel'
import { BioIntro } from '@/sections/bio-intro'
import { ProductCarousel } from '@/sections/product-carousel'
import { Brands } from '@/sections/brands'
import { Testimonials } from '@/sections/testimonials'
import bindLogo from '@/assets/logos/bind.png'
import habitHeroLogo from '@/assets/logos/habit-hero.png'
import qinoLogo from '@/assets/logos/qino.png'
import tradebaseLogo from '@/assets/logos/tradebase.png'
import trippinLogo from '@/assets/logos/trippin.png'

const DEMO_CARDS = [
  {
    imgUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=870&fit=crop',
    alt: "Trippin' app",
    title: "Trippin'",
    logoUrl: trippinLogo,
    iosStoreUrl: 'https://apps.apple.com/us/app/trippin-plan-trips-together/id6761880286',
    androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.trippinai.app&hl=en',
  },
  {
    imgUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=870&fit=crop',
    alt: 'Bind app',
    title: 'Bind',
    logoUrl: bindLogo,
  },
  {
    imgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=870&fit=crop',
    alt: 'TradeBase app',
    title: 'TradeBase',
    logoUrl: tradebaseLogo,
    iosStoreUrl: 'https://apps.apple.com/us/app/tradebase-find-trades-fast/id6753321961',
  },
  {
    imgUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=870&fit=crop',
    alt: 'Qino app',
    title: 'Qino',
    logoUrl: qinoLogo,
    iosStoreUrl: 'https://apps.apple.com/us/app/cinema-movie-tickets-qino/id6741431128',
  },
  {
    imgUrl: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=400&h=870&fit=crop',
    alt: 'Habit Hero app',
    title: 'Habit Hero',
    logoUrl: habitHeroLogo,
    iosStoreUrl: 'https://apps.apple.com/ma/app/habit-hero-daily-quests/id6751962274',
  },
]

function App() {
  return (
    <main className="relative bg-background text-foreground flex flex-col items-center transition-colors duration-300 motion-reduce:transition-none">
      <SiteHeader />
      <div className="site-frame relative">
        <section className="relative flex w-full flex-col">
          <BioIntro />
          <SocialCards cards={DEMO_CARDS} />
        </section>
        <ProductCarousel cards={DEMO_CARDS} />
        <Brands />
        <Testimonials />
      </div>
    </main>
  )
}

export default App
