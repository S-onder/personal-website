import Nav from '@/components/sections/Nav'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Experience from '@/components/sections/Experience'
import Education from '@/components/sections/Education'
import ArxivSection from '@/components/sections/ArxivSection'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Experience />
      <Education />
      <ArxivSection />
      <Footer />
    </main>
  )
}
