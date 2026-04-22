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
      title: 'About',
      subtitle: '',
      intro: '',
      description: [] as string[],
      coreOffer: [] as string[],
      location: '',
      contact: 'Get in Touch',
      email: 'Email',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      x: 'X (Twitter)',
      coreOfferTitle: 'Core Values',
    },
    ko: {
      title: '소개',
      subtitle: '',
      intro: '',
      description: [] as string[],
      coreOffer: [] as string[],
      location: '',
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
            {t.subtitle ? (
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                {t.subtitle}
              </p>
            ) : null}
          </div>

          {(t.intro || t.location || t.description.length > 0) && (
            <div className="mb-12">
              {t.intro ? (
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                  {t.intro}
                </h2>
              ) : null}
              {t.location ? (
                <div className="flex items-center gap-2 text-gray-600 mb-8">
                  <MapPin size={18} className="text-gray-500" />
                  <span className="text-base">{t.location}</span>
                </div>
              ) : null}
              {t.description.length > 0 ? (
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
              ) : null}
            </div>
          )}

          {Array.isArray(t.coreOffer) && t.coreOffer.length > 0 && (
            <div className="mb-12 bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg relative">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                {t.coreOfferTitle}
              </h3>
              <ul className="text-gray-800 text-lg md:text-xl leading-relaxed font-medium relative z-10 pl-4 space-y-3">
                {t.coreOffer.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-3 text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

