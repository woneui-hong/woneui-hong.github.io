'use client'

import { motion } from 'framer-motion'
import { Target, Workflow, Zap } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'WP (Work Prioritization)',
    subtitle: 'Define Priorities',
    description: 'Clearly distinguish what should be done from what should be eliminated. Focus on value creation, not just task completion.',
    icon: Target,
    color: 'text-accent',
    bgColor: 'bg-amber-50',
    delay: 0,
  },
  {
    number: '02',
    title: 'Process Optimization',
    subtitle: 'Streamline the Flow',
    description: 'Redesign workflows for prioritized tasks. Remove bottlenecks and eliminate waste before applying technology.',
    icon: Workflow,
    color: 'text-accent-teal',
    bgColor: 'bg-teal-50',
    delay: 0.2,
  },
  {
    number: '03',
    title: 'AX/DX (Automation)',
    subtitle: 'Apply Technology',
    description: 'Automate optimized processes with the right tools. Technology amplifies efficiency; it doesn\'t create it.',
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-slate-50',
    delay: 0.4,
  },
]

export default function Philosophy() {
  return (
    <section id="philosophy" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Why WP Comes First
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Automating inefficient processes only accelerates inefficiency.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: step.delay }}
                className="relative"
              >
                {/* Connector Arrow (Desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gray-200 z-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-200 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                )}

                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                  {/* Step Number */}
                  <div className="text-6xl font-bold text-gray-100 mb-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`${step.bgColor} ${step.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                    <Icon size={32} />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-accent font-semibold mb-4">
                    {step.subtitle}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Key Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-primary text-white rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto">
            <p className="text-xl lg:text-2xl font-semibold leading-relaxed">
              True efficiency comes from following the right sequence.
              <br className="hidden sm:block" />
              The order matters: <span className="text-accent">WP → Optimization → Automation</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

