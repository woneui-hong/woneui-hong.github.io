'use client'

import { motion } from 'framer-motion'
import { Gift, Users, ArrowRight } from 'lucide-react'

const benefits = [
  {
    icon: Gift,
    title: 'Referred Client',
    description: '20% discount on initial consulting fees',
    color: 'text-accent',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Users,
    title: 'Referrer',
    description: '10% reward of contract value upon project agreement',
    color: 'text-accent-teal',
    bgColor: 'bg-teal-50',
  },
]

export default function Referral() {
  return (
    <section id="referral" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent/15 via-accent-teal/15 to-primary/20 border-y-4 border-accent/20">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Grow Together
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 mb-2 font-semibold">
            Referral Program
          </p>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Know a colleague or business struggling with inefficient workflows?
            <br className="hidden sm:block" />
            Refer them to us. Let's grow together as partners.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`${benefit.bgColor} ${benefit.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-3">
                  {benefit.title}
                </h3>
                <p className="text-lg text-gray-700 font-semibold">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
          >
            Register as Partner & Earn Rewards
            <ArrowRight size={20} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

