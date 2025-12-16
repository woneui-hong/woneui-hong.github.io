import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Philosophy from '@/components/Philosophy'
import Services from '@/components/Services'
import Referral from '@/components/Referral'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Philosophy />
      <Services />
      <Referral />
      <Footer />
    </main>
  )
}

