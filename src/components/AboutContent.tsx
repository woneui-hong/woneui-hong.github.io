'use client'

import { Mail, Github, Linkedin, Facebook, Twitter, MapPin } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'

export default function AboutContent() {
  const { language } = useLanguage()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const content = {
    en: {
      title: 'About...',
      subtitle: 'In-depth financial analysis based on SEC filings and data-driven investment logic',
      intro: '',
      description: [
        'This blog analyzes the intrinsic value of companies from a value investing perspective. It reads SEC filings (10-Q, 10-K) directly and examines the business physics hidden behind the numbers in financial statements.',
        'Each analysis is not a simple stock price prediction, but a comprehensive evaluation of a company\'s capital allocation strategy, operational efficiency, and financial health. The focus is on long-term value creation mechanisms rather than short-term market volatility.',
        'Investment decisions should be based on logic that can be proven with numbers, not emotions or speculation. This blog shares the process of building such logic—interpreting financial metrics, quantifying risks, and calculating target prices.',
      ],
      coreOffer: [
        'Direct analysis of SEC filings to understand a company\'s intrinsic value',
        'Investment logic backed by quantitative data and financial metrics',
      ],
      location: 'South Callingwood, Edmonton, Canada',
      contact: 'Get in Touch',
      email: 'Email',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      x: 'X (Twitter)',
      coreOfferTitle: 'Core Values',
    },
    ko: {
      title: '이 블로그는...',
      subtitle: 'SEC 공시 자료를 근거로 한 재무 분석과 수치 기반의 투자 논리를 제시합니다.',
      intro: '',
      description: [
        'Value Investing 관점에서 기업의 내재 가치를 분석합니다. SEC 공시 자료(10-Q, 10-K)를 직접 읽고, 재무제표의 숫자 뒤에 숨은 비즈니스의 물리학을 파악합니다.',
        '각 분석은 기업의 자본 배분 전략, 운영 효율성, 재무 건전성을 종합적으로 평가합니다. 시장의 단기적 변동성보다는 장기적 가치 창출 메커니즘에 초점을 맞춥니다.',
        '투자 결정은 수치로 증명 가능한 논리에 기반해야 합니다. 재무 지표의 해석, 리스크의 정량화, 목표 주가 산정 등의 논리 과정을 공유합니다.',
      ],
      coreOffer: [
        'SEC 공시 자료 직접 분석을 통한 기업 내재 가치 파악',
        '수치와 재무 지표에 기반한 투자 논리 제시',
      ],
      location: 'South Callingwood, Edmonton, Canada',
      contact: '연락하기',
      email: '이메일',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      x: 'X (Twitter)',
      coreOfferTitle: 'Core Values',
    },
  }

  // Use 'en' as default during SSR to prevent hydration mismatch
  const currentLanguage = mounted ? language : 'en'
  const t = content[currentLanguage]

  return (
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
          <div className="mb-12 bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg relative">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
              {t.coreOfferTitle}
            </h3>
            <ul className="text-gray-800 text-lg md:text-xl leading-relaxed font-medium relative z-10 pl-4 space-y-3">
              {Array.isArray(t.coreOffer) ? (
                t.coreOffer.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-3 text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start">
                  <span className="mr-3 text-primary">•</span>
                  <span>{t.coreOffer}</span>
                </li>
              )}
            </ul>
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
  )
}

