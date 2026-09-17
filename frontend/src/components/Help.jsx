import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const faqs = [
  {
    id: 1,
    question: 'How does AI satellite verification work?',
    answer:
      'VyomAcre combines satellite and geospatial data with AI-assisted analysis to evaluate rooftop listings and their surrounding context. This helps identify location consistency and improves confidence before a space is presented as verified.',
  },
  {
    id: 2,
    question: 'What types of businesses lease rooftops?',
    answer:
      'Businesses may use rooftops for applications such as solar infrastructure, telecommunications, outdoor equipment, mobility infrastructure and other commercial use cases. Availability and suitability depend on the individual property and local requirements.',
  },
  {
    id: 3,
    question: 'How is the lease rate determined?',
    answer:
      'Lease rates can vary based on location, usable rooftop area, property type, demand and intended business use. VyomAcre presents transparent listing information so owners and businesses can evaluate an opportunity before discussing final commercial terms.',
  },
  {
    id: 4,
    question: 'Is my data secure?',
    answer:
      'VyomAcre is designed around controlled access and responsible handling of account and property information. Sensitive information should only be shared through authenticated platform workflows, while access to relevant data is limited according to the user and marketplace context.',
  },
];

const faqContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const faqItemVariants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function AmbientGlow({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={
        'pointer-events-none absolute rounded-full bg-[#00FF87]/[0.055] blur-[130px] ' +
        className
      }
    />
  );
}

function SectionLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 backdrop-blur-xl">
      <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87] shadow-[0_0_9px_rgba(0,255,135,0.75)]" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {children}
      </span>
    </div>
  );
}

function AccordionIcon({ isOpen }) {
  return (
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] transition-colors duration-300 group-hover:border-[#00FF87]/20">
      <motion.span
        animate={{
          rotate: isOpen ? 45 : 0,
        }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative flex h-3.5 w-3.5 items-center justify-center"
      >
        <span className="absolute h-px w-3 bg-current" />
        <span className="absolute h-px w-3 rotate-90 bg-current" />
      </motion.span>
    </span>
  );
}

function FAQItem({ faq, isOpen, onToggle }) {
  const articleClass =
    'group overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ' +
    (isOpen
      ? 'border-[#00FF87]/30 bg-[#00FF87]/[0.035] shadow-[0_0_30px_rgba(0,255,135,0.045)]'
      : 'border-white/10 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.035]');

  const idClass =
    'hidden font-mono text-[10px] tracking-[0.15em] sm:inline ' +
    (isOpen ? 'text-[#00FF87]/70' : 'text-slate-700');

  const questionClass =
    'text-sm font-medium tracking-[-0.015em] transition-colors duration-300 sm:text-[15px] ' +
    (isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white');

  const iconWrapperClass =
    'transition-colors duration-300 ' +
    (isOpen ? 'text-[#00FF87]' : 'text-slate-500');

  return (
    <motion.article
      variants={faqItemVariants}
      className={articleClass}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={'faq-answer-' + faq.id}
        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00FF87]/35 sm:px-6 sm:py-6"
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className={idClass}>
            {String(faq.id).padStart(2, '0')}
          </span>

          <span className={questionClass}>
            {faq.question}
          </span>
        </span>

        <span className={iconWrapperClass}>
          <AccordionIcon isOpen={isOpen} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={'faq-answer-' + faq.id}
            key="answer"
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              height: {
                duration: 0.34,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: {
                duration: 0.2,
                ease: 'easeOut',
              },
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-5 pb-6 pt-4 sm:px-6 sm:pb-7">
              <div className="pl-0 sm:pl-[2.15rem]">
                <p className="max-w-2xl text-sm leading-7 text-slate-400">
                  {faq.answer}
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <span className="h-px w-8 bg-[#00FF87]/35" />
                  <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-600">
                    VYOMACRE SUPPORT
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function Help() {
  const [openFaq, setOpenFaq] = useState(faqs[0].id);

  const handleToggle = (id) => {
    setOpenFaq((current) => (current === id ? null : id));
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#020706] font-sans text-white">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden pt-32 sm:pt-36">
        <AmbientGlow className="left-1/2 top-0 h-[500px] w-[760px] -translate-x-1/2 -translate-y-1/2" />
        <AmbientGlow className="left-[-12%] top-[48%] h-[260px] w-[260px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-5 pb-24 text-center sm:px-6 md:pb-28 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 35,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col items-center"
          >
            <SectionLabel>Support / Knowledge</SectionLabel>

            <h1 className="mt-7 text-[clamp(3.3rem,8vw,7rem)] font-medium leading-[0.92] tracking-[-0.065em] text-white">
              Help <span className="text-[#00FF87]">Center</span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Frequently asked questions about VyomAcre, rooftop discovery,
              verification and the marketplace.
            </p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              scaleX: 0.7,
            }}
            animate={{
              opacity: 1,
              scaleX: 1,
            }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto mt-16 h-px w-24 bg-gradient-to-r from-transparent via-[#00FF87]/50 to-transparent"
          />
        </div>
      </section>

      {/* =========================================================
          FAQ SECTION
      ========================================================= */}
      <section className="relative border-y border-white/10">
        <AmbientGlow className="right-[-14%] top-[34%] h-[400px] w-[400px]" />

        <div className="relative z-10 mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: '-100px',
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mb-10 text-center"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Frequently Asked
            </span>

            <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white sm:text-3xl">
              Answers, without the noise.
            </h2>
          </motion.div>

          <motion.div
            variants={faqContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: '-80px',
            }}
            className="space-y-3"
          >
            {faqs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isOpen={openFaq === faq.id}
                onToggle={() => handleToggle(faq.id)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          AI ASSISTANT CTA
      ========================================================= */}
      <section className="relative overflow-hidden">
        <AmbientGlow className="left-1/2 top-1/2 h-[420px] w-[700px] -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center sm:px-6 md:py-32 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: '-100px',
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] px-6 py-14 backdrop-blur-xl sm:px-10 md:py-20"
          >
            {/* Decorative HUD Lines */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00FF87]/40 to-transparent"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-1/2 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00FF87]/20 to-transparent"
            />

            <div className="relative z-10">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#00FF87]/20 bg-[#00FF87]/[0.05]">
                <span className="text-lg">✦</span>
              </div>

              <h2 className="mt-6 text-3xl font-medium leading-tight tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">
                Still have{' '}
                <span className="text-[#00FF87]">questions?</span>
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Our AI assistant is here 24/7 to help you navigate VyomAcre,
                understand listings and find the information you need.
              </p>

              <Link
                to="/chat"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[#00FF87] px-7 py-3.5 text-sm font-semibold text-[#020706] shadow-[0_0_15px_rgba(0,255,135,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_26px_rgba(0,255,135,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020706]"
              >
                Chat with AI
                <span className="ml-2 text-base leading-none">✦</span>
              </Link>

              <p className="mt-4 text-[9px] uppercase tracking-[0.18em] text-slate-700">
                AI ASSISTANT / AVAILABLE 24·7
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}