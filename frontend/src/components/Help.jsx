import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Satellite, Building2, Map, Sparkles, ArrowUpRight } from 'lucide-react';
import { useUI } from '../context/UIContext';

/* ============================================================
   VyomAcre — Help Center (About-style, zero static boxes)
   - Cursor-reactive particle field hero
   - Quick action tiles (hover lift + glow)
   - Interactive FAQ rows (click to expand)
   - AI CTA with live status
   ============================================================ */

/* ---------- particle field (cursor-reactive) ---------- */
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const parent = canvas.parentElement;
      w = canvas.width = parent.offsetWidth;
      h = canvas.height = parent.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const N = Math.min(80, Math.floor((w * h) / 24000));
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.7,
    }));

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < 140) { n.x += (dx / md) * 0.5; n.y += (dy / md) * 0.5; }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.strokeStyle = 'rgba(0,229,133,' + (0.09 * (1 - d / 130)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        const near = md < 140;
        ctx.fillStyle = near ? 'rgba(0,229,133,' + (0.75 * (1 - md / 140)).toFixed(3) + ')' : 'rgba(0,229,133,0.35)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* ---------- reveal on scroll ---------- */
function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- ambient orb ---------- */
function Orb({ className = '', delay = 0 }) {
  return (
    <motion.div
      aria-hidden="true"
      animate={{ y: [0, -22, 0], opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      className={'pointer-events-none absolute rounded-full bg-[#00E585]/[0.05] blur-[110px] ' + className}
    />
  );
}

/* ---------- data ---------- */
const QUICK_ACTIONS = [
  {
    icon: Sparkles,
    title: 'Ask the AI',
    desc: 'Instant answers about listings, leasing and verification — any time, in Hindi or English.',
    action: 'chat',
  },
  {
    icon: Building2,
    title: 'List your roof',
    desc: 'Add your rooftop in minutes and get it satellite-verified for businesses to discover.',
    action: 'link',
    to: '/owner/new-roof',
  },
  {
    icon: Map,
    title: 'Explore rooftops',
    desc: 'Browse verified rooftop spaces on the live map with AI-assisted insights.',
    action: 'link',
    to: '/properties',
  },
];

const FAQS = [
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
  {
    id: 5,
    question: 'How do I list my rooftop?',
    answer:
      'Create an owner account, open List Your Roof, and submit your property details — location, approximate rooftop area and access notes. Our satellite engine then cross-checks the location, and once verified, your rooftop becomes discoverable to businesses looking for space.',
  },
  {
    id: 6,
    question: 'What does VyomAcre cost?',
    answer:
      'Browsing, listing and AI assistance on VyomAcre are free for property owners and seekers during this program. Commercial terms apply only to the final lease agreement negotiated between the owner and the leasing business.',
  },
];

/* ---------- component ---------- */
export default function Help() {
  const { openChatbot } = useUI();
  const [openFaq, setOpenFaq] = useState(1);

  const handleQuick = (a) => {
    if (a.action === 'chat') openChatbot();
  };

  return (
    <main
      className="relative overflow-x-clip bg-[#050A08] text-[#E7EFE9]"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.vy-head { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.01em; }
`}</style>

      {/* =========================================================
          HERO — particle field
      ========================================================= */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
        <ParticleField />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-px w-[560px] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00E585]/40 to-transparent"
        />

        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1C2A22] bg-[#071009]/80 px-4 py-1.5 backdrop-blur">
              <Satellite size={13} className="text-[#00E585]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#93A096]">
                Support · Knowledge Base
              </span>
            </div>

            <h1 className="vy-head mt-8 text-[clamp(3rem,9vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
              How can we
              <br />
              <span className="text-[#00E585]">help you?</span>
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-sm leading-7 text-[#93A096] sm:text-base sm:leading-8">
              Answers about rooftop leasing, satellite verification and the VyomAcre
              marketplace — plus an AI assistant that never sleeps.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={openChatbot}
                className="group inline-flex items-center gap-2 rounded-full bg-[#00E585] px-6 py-3 text-sm font-semibold text-[#04160C] shadow-[0_0_24px_rgba(0,229,133,0.25)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_38px_rgba(0,229,133,0.4)]"
              >
                <Sparkles size={15} />
                Chat with AI
              </button>
              <a
                href="#faq"
                className="inline-flex items-center gap-2 rounded-full border border-[#1C2A22] bg-[#071009]/80 px-6 py-3 text-sm font-medium text-[#E7EFE9] backdrop-blur transition-colors duration-300 hover:border-[#00E585]/40 hover:text-[#00E585]"
              >
                Browse FAQ
                <ChevronDown size={15} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* floating scroll cue */}
        <motion.div
          aria-hidden="true"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#93A096]"
        >
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* =========================================================
          QUICK ACTIONS
      ========================================================= */}
      <section className="relative">
        <Orb className="left-[-10%] top-[10%] h-[300px] w-[300px]" delay={0} />
        <Orb className="right-[-8%] bottom-[5%] h-[240px] w-[240px]" delay={2} />

        <div className="relative z-10 mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00E585]">
              Quick help
            </span>
            <h2 className="vy-head mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Get moving in seconds.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {QUICK_ACTIONS.map((a, i) => {
              const Icon = a.icon;
              const inner = (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#1C2A22] bg-[#071009] transition-colors duration-300 group-hover:border-[#00E585]/50 group-hover:shadow-[0_0_18px_rgba(0,229,133,0.15)]">
                    <Icon size={19} className="text-[#00E585]" />
                  </div>
                  <div className="mt-5 flex items-center gap-1.5">
                    <h3 className="vy-head text-lg font-semibold">{a.title}</h3>
                    <ArrowUpRight
                      size={15}
                      className="text-[#93A096] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#00E585]"
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#93A096]">{a.desc}</p>
                </>
              );

              const cls =
                'group relative h-full overflow-hidden rounded-2xl border border-[#1C2A22] bg-[#071009]/70 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00E585]/35 hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]';

              return (
                <Reveal key={a.title} delay={i * 0.1} className="h-full">
                  {a.action === 'chat' ? (
                    <button onClick={() => handleQuick(a)} className={cls + ' w-full text-left'}>
                      {inner}
                    </button>
                  ) : (
                    <Link to={a.to} className={cls + ' block'}>
                      {inner}
                    </Link>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ — interactive expanding rows
      ========================================================= */}
      <section id="faq" className="relative border-t border-[#182420] bg-[#071009]/40">
        <Orb className="right-[-12%] top-[20%] h-[340px] w-[340px]" delay={1} />

        <div className="relative z-10 mx-auto max-w-3xl px-5 py-20 sm:px-6 sm:py-28">
          <Reveal className="text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00E585]">
              Frequently asked
            </span>
            <h2 className="vy-head mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Answers, without the noise.
            </h2>
          </Reveal>

          <div className="mt-12 divide-y divide-[#182420] border-y border-[#182420]">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === faq.id;
              return (
                <Reveal key={faq.id} delay={i * 0.06}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className={
                      'group flex w-full items-center gap-4 px-1 py-5 text-left transition-colors duration-300 sm:gap-6 sm:px-3 ' +
                      (isOpen ? '' : 'hover:bg-[#00E585]/[0.03]')
                    }
                  >
                    <span
                      className={
                        'vy-head text-xs font-semibold tracking-[0.15em] transition-colors duration-300 ' +
                        (isOpen ? 'text-[#00E585]' : 'text-[#93A096]/50 group-hover:text-[#00E585]/70')
                      }
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={
                        'vy-head flex-1 text-base font-medium transition-colors duration-300 sm:text-lg ' +
                        (isOpen ? 'text-[#F4F8F5]' : 'text-[#E7EFE9] group-hover:text-[#F4F8F5]')
                      }
                    >
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={
                        'flex h-8 w-8 flex-none items-center justify-center rounded-full border transition-colors duration-300 ' +
                        (isOpen
                          ? 'border-[#00E585]/50 text-[#00E585]'
                          : 'border-[#1C2A22] text-[#93A096] group-hover:border-[#00E585]/30 group-hover:text-[#00E585]')
                      }
                    >
                      <span className="relative flex h-3 w-3 items-center justify-center">
                        <span className="absolute h-px w-3 bg-current" />
                        <span className="absolute h-px w-3 rotate-90 bg-current" />
                      </span>
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-1 pb-6 pl-10 text-sm leading-7 text-[#93A096] sm:px-3 sm:pl-[3.4rem]">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          AI CTA
      ========================================================= */}
      <section className="relative overflow-hidden border-t border-[#182420]">
        <Orb className="left-1/2 top-1/2 h-[380px] w-[640px] -translate-x-1/2 -translate-y-1/2" delay={0.5} />

        <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center sm:px-6 sm:py-32">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-[#1C2A22] bg-[#071009]/80 px-6 py-14 backdrop-blur sm:px-10 sm:py-20">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-px w-44 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00E585]/40 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-1/2 h-px w-44 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00E585]/20 to-transparent"
              />

              <div className="relative z-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#00E585]/25 bg-[#00E585]/[0.06]">
                  <Sparkles size={19} className="text-[#00E585]" />
                </div>

                <h2 className="vy-head mt-6 text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl md:text-5xl">
                  Still have <span className="text-[#00E585]">questions?</span>
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#93A096] sm:text-base sm:leading-8">
                  Our AI assistant is here 24·7 to help you navigate VyomAcre,
                  understand listings and find the information you need.
                </p>

                <button
                  onClick={openChatbot}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#00E585] px-7 py-3.5 text-sm font-semibold text-[#04160C] shadow-[0_0_20px_rgba(0,229,133,0.28)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_34px_rgba(0,229,133,0.42)]"
                >
                  Chat with AI
                  <ArrowUpRight size={15} />
                </button>

                <p className="mt-4 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#93A096]/70">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E585] opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00E585]" />
                  </span>
                  AI Assistant · Online 24·7
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
