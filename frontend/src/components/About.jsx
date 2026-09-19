import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, ArrowRight, Satellite } from 'lucide-react';

/* ============================================================
   VyomAcre — About page (landing-style, zero static boxes)
   - Particle field canvas (cursor-reactive)
   - Interactive team rows: hover/tap to expand work details
   - Mission list, tech marquee — no cards anywhere
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
        const near = md < 170;
        ctx.fillStyle = near ? 'rgba(0,229,133,0.85)' : 'rgba(160,180,168,0.4)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (near ? 0.7 : 0), 0, Math.PI * 2);
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

/* ---------- animated counter ---------- */
function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 1200, 1);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);

  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>{val}{suffix}</span>;
}

/* ---------- data ---------- */
const values = [
  {
    eyebrow: 'OUR MISSION',
    title: 'Turn empty rooftops into opportunity.',
    description: 'India has 637 GW of rooftop solar potential sitting idle over people\u2019s heads. We are building the marketplace that turns that idle concrete into a revenue-generating asset class.',
  },
  {
    eyebrow: 'SATELLITE-FIRST',
    title: 'Verification from orbit, not from a site visit.',
    description: 'Google Earth Engine measures roof area, shading and orientation the moment a roof is listed — replacing the weeks-long manual survey that kills every solar deal today.',
  },
  {
    eyebrow: 'TRUSTED MARKETPLACE',
    title: 'Built for transactions you can trust.',
    description: 'Verified owners, authenticated businesses, token-gated lease requests and transparent status tracking — a marketplace both sides can trust without meeting.',
  },
];

const team = [
  {
    id: '01',
    name: 'Divyansh Kumar',
    role: 'Team Lead \u00b7 Backend \u00b7 Frontend',
    tags: ['FastAPI', 'PostgreSQL', 'Earth Engine', 'Gemini AI', 'JWT'],
    detail: 'Leads the project end to end. Built the entire backend \u2014 auth, PostgreSQL database and the lease marketplace \u2014 and shipped both engines: the Google Earth Engine satellite verification pipeline and the Gemini AI assistant. Manages the GitHub repo, branch workflow and PR reviews, and is building the frontend experience too \u2014 the landing page, glass navbar, fire footer and this About page.',
  },
  {
    id: '02',
    name: 'Ritesh',
    role: 'Geospatial \u00b7 Backend',
    tags: ['Leaflet', 'React', 'FastAPI'],
    detail: 'Owns the map \u2014 the heart of the marketplace. Built the live properties dashboard with Leaflet, marker rendering and clustering, city / roof-type / area filters, scanned-zone overlays and live location detection.',
  },
  {
    id: '03',
    name: 'Balram',
    role: 'Frontend Core',
    tags: ['React', 'Axios', 'Tailwind'],
    detail: 'Rewired the frontend to the real backend. Rebuilt the api.js service layer endpoint-by-endpoint against Swagger, fixed auth token storage and auto-injection, added role-based navigation and ProtectedRoute gating, and the Navbar auth states.',
  },
  {
    id: '04',
    name: 'Harsh',
    role: 'Frontend Architecture',
    tags: ['React', 'Router', 'Tailwind'],
    detail: 'Owns App.jsx \u2014 the spine of the frontend. All 14 routes and the 404, the owner roof-submission form, dashboard mounting, the signup flow and the About/Help wiring you are reading right now.',
  },
  {
    id: '05',
    name: 'Khushi',
    role: 'Data \u00b7 Admin',
    tags: ['PostgreSQL', 'Admin', 'Testing'],
    detail: 'Makes the marketplace feel alive. Seeds the live map with real verified rooftops across cities, builds the admin panel for roof verification and user roles, and runs end-to-end lease-flow testing.',
  },
];

const techStack = ['React', 'FastAPI', 'PostgreSQL', 'Google Earth Engine', 'Gemini AI', 'Leaflet Maps', 'Tailwind CSS', 'Render', 'Vercel'];

export default function About() {
  const [hover, setHover] = useState(null);

  return (
    <div className="relative overflow-x-clip bg-[#050A08] text-[#E7EFE9]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.vy-head { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.01em; }
@keyframes vytech { from { transform: translateX(0); } to { transform: translateX(-50%); } }
`}</style>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden px-6 pb-24 pt-28 sm:px-10 lg:px-16">
        <ParticleField />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050A08]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#1C2A22] bg-[#0A1410]/80 px-4 py-1.5 backdrop-blur-sm">
            <Satellite size={13} className="text-[#00E585]" />
            <span className="text-xs font-medium text-[#93A096]">Team Devdoots · Build with AI · Code for Communities · 2026</span>
          </div>

          <h1 className="vy-head max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-[#F4F8F5] sm:text-6xl lg:text-7xl">
            We put rooftops<br />
            <span className="text-[#00E585]">on the map.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#A6B1A8]">
            Team Devdoots is five builders turning India&rsquo;s idle rooftops into
            a working satellite-verified marketplace — designed, built and
            deployed end to end.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-[#1A2620] pt-10 md:grid-cols-4">
            {[
              { v: 5, s: '', label: 'Builders on the roster' },
              { v: 14, s: '', label: 'Frontend routes wired' },
              { v: 25, s: '+', label: 'Backend API endpoints' },
              { v: 637, s: ' GW', label: 'Market we are unlocking' },
            ].map((st) => (
              <Reveal key={st.label}>
                <div className="vy-head text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
                  <Counter to={st.v} suffix={st.s} />
                </div>
                <div className="mt-2 max-w-[210px] text-sm leading-relaxed text-[#7E8B82]">{st.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MISSION (no boxes) ============ */}
      <section className="border-t border-[#121D17] bg-[#071009] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E585]">What we believe</div>
            <h2 className="vy-head mt-4 max-w-2xl text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              Three ideas, zero shortcuts
            </h2>
          </Reveal>

          <div className="mt-14">
            {values.map((v, i) => (
              <Reveal key={v.eyebrow} delay={i * 0.06}>
                <div className="flex flex-col gap-4 border-t border-[#121D17] py-10 last:border-b sm:flex-row sm:gap-12">
                  <span className="vy-head text-5xl font-bold leading-none text-[#1C2A22] sm:w-24 sm:flex-none sm:text-6xl">0{i + 1}</span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E585]">{v.eyebrow}</div>
                    <div className="vy-head mt-2.5 text-2xl font-bold tracking-tight text-[#EDF3EF] sm:text-3xl">{v.title}</div>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#8A968E]">{v.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TEAM (interactive rows) ============ */}
      <section className="border-t border-[#121D17] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E585]">The humans</div>
            <h2 className="vy-head mt-4 max-w-2xl text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              Five builders, one marketplace
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#93A096]">
              Hover — or tap — any name to see what they actually built.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 border-b border-[#121D17]">
              {team.map((m, i) => {
                const open = hover === i;
                return (
                  <div
                    key={m.id}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setHover(open ? null : i)}
                    className={'cursor-pointer border-t border-[#121D17] transition-colors duration-300 ' + (open ? 'bg-[#08120C]/70' : 'hover:bg-[#08120C]/40')}
                  >
                    <div className="flex items-center gap-5 px-3 py-7 sm:gap-8 sm:px-6">
                      <span className="vy-head w-8 flex-none text-sm font-semibold tracking-[0.1em] text-[#00E585]">{m.id}</span>
                      <span className={'vy-head flex-1 text-3xl font-bold tracking-tight transition-colors duration-300 sm:text-5xl ' + (open ? 'text-[#00E585]' : 'text-[#F4F8F5]')}>
                        {m.name}
                      </span>
                      <span className="mr-2 hidden text-sm font-medium text-[#7E8B82] sm:block">{m.role}</span>
                      <ChevronDown
                        size={20}
                        className={'flex-none text-[#00E585] transition-transform duration-300 ' + (open ? 'rotate-180' : '')}
                      />
                    </div>

                    <div className={'grid transition-all duration-500 ease-out ' + (open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                      <div className="overflow-hidden">
                        <div className="px-3 pb-7 sm:px-6 sm:pl-[7.5rem]">
                          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-[#00E585] sm:hidden">{m.role}</span>
                          <p className="max-w-2xl text-[15px] leading-relaxed text-[#8A968E]">{m.detail}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {m.tags.map((t) => (
                              <span key={t} className="rounded-full border border-[#24352B] px-3 py-1 text-xs font-medium text-[#93A096]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ TECH MARQUEE ============ */}
      <section className="border-t border-[#121D17] bg-[#071009] py-16">
        <p className="px-6 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#5E6B62]">Built with</p>
        <div className="mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max gap-12" style={{ animation: 'vytech 30s linear infinite' }}>
            {[...techStack, ...techStack].map((t, i) => (
              <span key={i} className="flex items-center gap-12 whitespace-nowrap text-lg font-medium text-[#4E5B52]">
                {t}
                <span className="h-1 w-1 rounded-full bg-[#00E585]/40" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden border-t border-[#121D17] px-6 py-24 text-center sm:px-10">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[680px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E585]/[0.04] blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="vy-head text-4xl font-bold leading-tight tracking-tight text-[#F4F8F5] sm:text-5xl">
            Enough about us. <span className="text-[#00E585]">See what we built.</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/properties" className="inline-flex items-center gap-2 rounded-xl bg-[#00E585] px-8 py-4 text-base font-semibold text-[#04160C] transition hover:scale-[1.02]">
              Explore the live map <ArrowRight size={17} />
            </Link>
            <Link to="/signup" className="rounded-xl border border-[#24352B] px-8 py-4 text-base font-medium text-[#D7E2DA] transition-colors hover:border-[#00E585]/50">
              List your roof — free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
