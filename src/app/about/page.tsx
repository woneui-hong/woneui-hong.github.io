import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Mail, Github, Linkedin, Facebook, Twitter, MapPin } from 'lucide-react'
import { getLanguageFromServer } from '@/lib/lang'

// Force static generation only for production builds (static export)
// In development, allow dynamic rendering for language switching
export const dynamic = process.env.NODE_ENV === 'production' ? 'force-static' : 'auto'
export const dynamicParams = false

export default async function About({
  searchParams,
}: {
  searchParams?: { lang?: string }
}) {
  // In production (static export), use default 'en'
  // In development (localhost), use searchParams for language switching
  const lang = process.env.NODE_ENV === 'production' 
    ? 'en' 
    : (searchParams ? await getLanguageFromServer(searchParams) : 'en')

  const content = {
    en: {
      title: 'About Me',
      subtitle: 'Identifying what truly matters—the X that makes everything else unnecessary',
      intro: 'Hello, I\'m Won Eui Hong',
      description: [
        'In a world saturated with signals and noise, I write about the art of identifying X—the most important work that, once done, renders everything else unnecessary. This isn\'t about doing more; it\'s about doing what matters.',
        'My work explores three interconnected themes: work prioritization that shifts focus from signal strength to importance, the irreplaceable human dimensions in an AI-driven world, and the strategic interplay between business offers and investment patience.',
        'I believe that true effectiveness comes not from processing more information, but from sensing what deserves to exist. Through energy-efficient thinking, quality perception, and unique lived experience, we can orchestrate technology rather than compete with it—becoming composers who give meaning to the symphony that AI can play, but cannot conceive.',
      ],
      coreOffer: 'This blog offers a single promise: the ability to identify X—the work that makes everything else unnecessary—through frameworks that prioritize importance over urgency, quality over quantity, and depth over speed.',
      location: 'South Callingwood, Edmonton, Canada',
      contact: 'Get in Touch',
      email: 'Email',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      x: 'X (Twitter)',
    },
    ko: {
      title: '소개',
      subtitle: '진정으로 중요한 것—X를 식별하는 것, 그것이 모든 나머지를 불필요하게 만든다',
      intro: '안녕하세요, 홍원의입니다',
      description: [
        '신호와 노이즈로 포화된 세상에서, 저는 X를 식별하는 기술에 대해 씁니다—한 번 완료되면 다른 모든 것을 불필요하게 만드는 가장 중요한 업무입니다. 이것은 더 많이 하는 것이 아니라, 중요한 것을 하는 것입니다.',
        '제 글은 세 가지 상호연결된 주제를 탐구합니다: 신호 강도에서 중요도로 초점을 전환하는 업무 우선순위화, AI 주도 세계에서 대체 불가능한 인간적 차원, 그리고 사업의 오퍼와 투자의 인내 사이의 전략적 상호작용입니다.',
        '진정한 효과성은 더 많은 정보를 처리하는 데서 오는 것이 아니라, 존재할 가치가 있는 것을 감지하는 데서 온다고 믿습니다. 에너지 효율적인 사고, 품질 인식, 그리고 고유한 경험을 통해, 우리는 기술과 경쟁하기보다는 기술을 조율할 수 있습니다—AI가 연주할 수 있지만 상상할 수 없는 교향곡에 의미를 부여하는 작곡가가 되는 것입니다.',
      ],
      coreOffer: '이 블로그는 단 하나의 약속을 제공합니다: 긴급함보다 중요도, 양보다 질, 속도보다 깊이를 우선시하는 프레임워크를 통해 X—다른 모든 것을 불필요하게 만드는 업무—를 식별하는 능력입니다.',
      location: 'South Callingwood, Edmonton, Canada',
      contact: '연락하기',
      email: '이메일',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      x: 'X (Twitter)',
    },
  }

  const t = content[lang]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:p-16">
            {/* Header Section */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
                {t.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* Introduction Section */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                {t.intro}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mb-8">
                <MapPin size={18} className="text-gray-500" />
                <span className="text-base">{t.location}</span>
              </div>
              <div className="space-y-6">
                {t.description.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-gray-700 text-lg leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Core Offer Section */}
            <div className="mb-12 bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                {lang === 'en' ? 'Core Offer' : '핵심 제안'}
              </h3>
              <p className="text-gray-800 text-lg md:text-xl leading-relaxed font-medium italic">
                {t.coreOffer}
              </p>
            </div>

            {/* Contact Section */}
            <div className="border-t border-gray-200 pt-10">
              <h3 className="text-2xl font-semibold text-gray-900 mb-8">
                {t.contact}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href="mailto:prowehead@gmail.com"
                  className="inline-flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="p-2 bg-gray-100 group-hover:bg-primary/10 rounded-lg transition-colors">
                    <Mail size={20} className="text-gray-700 group-hover:text-primary" />
                  </div>
                  <span className="text-gray-700 group-hover:text-primary font-medium">{t.email}</span>
                </a>
                <a
                  href="https://github.com/woneui-hong"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="p-2 bg-gray-100 group-hover:bg-primary/10 rounded-lg transition-colors">
                    <Github size={20} className="text-gray-700 group-hover:text-primary" />
                  </div>
                  <span className="text-gray-700 group-hover:text-primary font-medium">{t.github}</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/woneui-hong-1a0625b4/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="p-2 bg-gray-100 group-hover:bg-primary/10 rounded-lg transition-colors">
                    <Linkedin size={20} className="text-gray-700 group-hover:text-primary" />
                  </div>
                  <span className="text-gray-700 group-hover:text-primary font-medium">{t.linkedin}</span>
                </a>
                <a
                  href="https://www.facebook.com/wehongbusiness"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="p-2 bg-gray-100 group-hover:bg-primary/10 rounded-lg transition-colors">
                    <Facebook size={20} className="text-gray-700 group-hover:text-primary" />
                  </div>
                  <span className="text-gray-700 group-hover:text-primary font-medium">{t.facebook}</span>
                </a>
                <a
                  href="https://x.com/prowehead"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="p-2 bg-gray-100 group-hover:bg-primary/10 rounded-lg transition-colors">
                    <Twitter size={20} className="text-gray-700 group-hover:text-primary" />
                  </div>
                  <span className="text-gray-700 group-hover:text-primary font-medium">{t.x}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

