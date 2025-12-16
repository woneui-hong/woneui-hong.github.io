'use client'

import { motion } from 'framer-motion'
import { ClipboardList, Bot, Code } from 'lucide-react'

const services = [
  {
    icon: ClipboardList,
    title: 'WP Consulting',
    subtitle: 'Work Prioritization & Redesign',
    description: 'We analyze your current workflows and distinguish value-creating tasks from unnecessary ones. Once priorities are clear, the path to automation becomes evident.',
    color: 'text-accent',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Bot,
    title: 'Workflow Automation',
    subtitle: 'Eliminate Repetition & AI Integration',
    description: 'We automate prioritized repetitive tasks and integrate AI tools to maximize efficiency. Our focus is on value creation, not just automation for its own sake.',
    color: 'text-accent-teal',
    bgColor: 'bg-teal-50',
  },
  {
    icon: Code,
    title: 'Custom Solution',
    subtitle: 'Tailored Tool Development',
    description: 'For unique requirements that standard solutions can\'t address, we develop custom tools. Practical solutions using Python, SQL, Flask, and other proven technologies.',
    color: 'text-primary',
    bgColor: 'bg-slate-50',
  },
]

export default function Services() {
  return (
    <section id="services" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Services
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            From WP to automation, we approach it step by step.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col"
              >
                <div className={`${service.bgColor} ${service.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                  <Icon size={32} />
                </div>
                
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {service.title}
                </h3>
                <p className="text-accent font-semibold mb-4">
                  {service.subtitle}
                </p>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  {service.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

