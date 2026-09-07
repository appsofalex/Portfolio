import { SiteHeader } from '@/components/common/site-header'
import SocialCards from '@/components/ui/card-fan-carousel'
import { BioIntro } from '@/sections/bio-intro'
import { Skills } from '@/sections/skills'
import { Brands } from '@/sections/brands'
import { Testimonials } from '@/sections/testimonials'
import bindScreen from '@/assets/apps/bind.webp'
import habitHeroScreen from '@/assets/apps/habit-hero.webp'
import qinoScreen from '@/assets/apps/qino.webp'
import sidenoteScreen from '@/assets/apps/sidenote.webp'
import timelineScreen from '@/assets/apps/timeline.webp'
import tradebaseScreen from '@/assets/apps/tradebase.webp'
import trippinScreen from '@/assets/apps/trippin.webp'
import bindLogo from '@/assets/logos/bind.png'
import habitHeroLogo from '@/assets/logos/habit-hero.png'
import qinoLogo from '@/assets/logos/qino.png'
import sidenoteLogo from '@/assets/logos/sidenote.png'
import tradebaseLogo from '@/assets/logos/tradebase.png'
import trippinLogo from '@/assets/logos/trippin.png'

/* Bind at index 3 so it rests in the center slot of the 7-card fan. */
const DEMO_CARDS = [
  {
    imgUrl: habitHeroScreen,
    alt: 'Habit Hero app',
    title: 'Habit Hero',
    logoUrl: habitHeroLogo,
    iosStoreUrl: 'https://apps.apple.com/ma/app/habit-hero-daily-quests/id6751962274',
    statusBar: 'black' as const,
  },
  {
    imgUrl: tradebaseScreen,
    alt: 'TradeBase app',
    title: 'TradeBase',
    logoUrl: tradebaseLogo,
    iosStoreUrl: 'https://apps.apple.com/us/app/tradebase-find-trades-fast/id6753321961',
    statusBar: 'white' as const,
  },
  {
    imgUrl: trippinScreen,
    alt: "Trippin' app",
    title: "Trippin'",
    logoUrl: trippinLogo,
    iosStoreUrl: 'https://apps.apple.com/gb/app/trippin-plan-trips-together/id6761880286',
    androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.trippinai.app&hl=en',
    statusBar: 'black' as const,
  },
  {
    imgUrl: bindScreen,
    alt: 'Bind app',
    title: 'Bind',
    logoUrl: bindLogo,
    statusBar: 'white' as const,
  },
  {
    imgUrl: qinoScreen,
    alt: 'Qino app',
    title: 'Qino',
    logoUrl: qinoLogo,
    iosStoreUrl: 'https://apps.apple.com/us/app/cinema-movie-tickets-qino/id6741431128',
    statusBar: 'black' as const,
  },
  {
    imgUrl: timelineScreen,
    alt: 'Timeline app',
    title: 'Timeline',
    statusBar: 'white' as const,
  },
  {
    imgUrl: sidenoteScreen,
    alt: 'Sidenote app',
    title: 'Sidenote',
    logoUrl: sidenoteLogo,
    statusBar: 'black' as const,
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
        <Skills />
        <Brands />
        <Testimonials />
      </div>
    </main>
  )
}

export default App
