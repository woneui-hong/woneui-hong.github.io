'use client'

import { Mail, Linkedin, Github } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:your-email@example.com',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/your-profile',
    },
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/woneui-hong',
    },
  ]

  return (
    <footer id="contact" className="bg-primary text-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">InsightFlow</h3>
            <p className="text-gray-300 leading-relaxed">
              Work Prioritization comes before Automation.
              <br />
              Following the right sequence:
              <br />
              WP → Optimization → Automation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#philosophy" className="text-gray-300 hover:text-accent transition-colors">
                  Philosophy
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-300 hover:text-accent transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#referral" className="text-gray-300 hover:text-accent transition-colors">
                  Referral Program
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              {socialLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 text-gray-300 hover:text-accent transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} InsightFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

