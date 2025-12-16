'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight text-balance">
            Automation is the Tool, Prioritization is the Strategy.
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 leading-relaxed text-balance max-w-3xl mx-auto"
          >
            We define <span className="font-semibold text-primary">WHAT</span> to do before asking AI <span className="font-semibold text-primary">HOW</span> to do it.
            <br className="hidden sm:block" />
            <span className="font-semibold text-primary">WP (Work Prioritization)</span> comes before DX or AX.
          </motion.p>

          <motion.a
            href="#contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-600 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Free Process Assessment
            <ArrowRight size={20} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

