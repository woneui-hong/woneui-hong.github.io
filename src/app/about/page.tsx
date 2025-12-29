import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getLanguageFromServer } from '@/lib/lang'
import { Mail, Github, Linkedin, Facebook, Twitter } from 'lucide-react'

export default async function About({
  searchParams,
}: {
  searchParams?: { lang?: string }
}) {
  // Get language from searchParams and cookies
  const lang = await getLanguageFromServer(searchParams)

  const content = {
    en: {
      title: 'About Me',
      subtitle: 'Building the future of work through automation and prioritization',
      intro: 'Hello, I\'m Won Eui Hong',
      description: [
        'I am passionate about creating solutions that help people work smarter, not harder. My focus is on work prioritization and automation - understanding what needs to be done before figuring out how to automate it.',
        'I believe that effective prioritization (WP - Work Prioritization) is the foundation of any successful automation strategy. Before diving into Developer Experience (DX) or Automation Experience (AX), we must first clearly define what work matters most.',
        'Through my work, I explore how we can leverage AI and automation tools to enhance human decision-making rather than replace it. The goal is to create systems that amplify our ability to focus on what truly matters.',
      ],
      contact: 'Get in Touch',
      email: 'Email',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      x: 'X (Twitter)',
    },
    ko: {
      title: '소개',
      subtitle: '자동화와 우선순위화를 통해 미래의 업무 방식을 구축합니다',
      intro: '안녕하세요, 홍원의입니다',
      description: [
        '사람들이 더 똑똑하게, 더 열심히가 아닌 더 효율적으로 일할 수 있도록 돕는 솔루션을 만드는 것에 열정을 가지고 있습니다. 저의 관심사는 업무 우선순위화와 자동화입니다 - 어떻게 자동화할지 고민하기 전에 무엇을 해야 하는지 이해하는 것이 중요합니다.',
        '효과적인 우선순위화(WP - Work Prioritization)가 성공적인 자동화 전략의 기반이라고 믿습니다. 개발자 경험(DX)이나 자동화 경험(AX)에 뛰어들기 전에, 무엇이 가장 중요한 업무인지 명확히 정의해야 합니다.',
        '제 작업을 통해 AI와 자동화 도구를 활용하여 인간의 의사결정을 대체하는 것이 아니라 향상시킬 수 있는 방법을 탐구합니다. 목표는 진정으로 중요한 것에 집중할 수 있는 우리의 능력을 증폭시키는 시스템을 만드는 것입니다.',
      ],
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
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
                {t.intro}
              </h2>
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

