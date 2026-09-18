import React, { useEffect, useRef, useState } from 'react';
import {
  motion, useInView, useMotionValue, useSpring, useTransform, useScroll,
} from 'framer-motion';
import {
  Satellite, MapPin, ShieldCheck, ArrowRight, ChevronDown,
  Zap, Eye, Layers, Clock, TrendingUp, Check, X, Radar, FileCheck, Globe, IndianRupee,
} from 'lucide-react';
import Lenis from 'lenis';

/* ============================================================
   VyomAcre — Landing Page v3 (Style A: Dark Premium, INTERACTIVE)
   - Slow, calm 3D globe + satellites (canvas, cursor-reactive)
   - Lenis buttery smooth scrolling
   - Looping feature marquee, timeline roadmap, magnetic buttons (subtle)
   Requires: framer-motion, lucide-react, lenis (npm i lenis), Tailwind
   ============================================================ */

/* ---------- 3D wireframe globe with satellites ---------- */
function GlobeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = 0, h = 0, t = 0;
    const mouse = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 };

    const resize = () => {
      const parent = canvas.parentElement;
      w = canvas.width = parent.offsetWidth;
      h = canvas.height = parent.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMove);

    // sphere grid points
    const grid = [];
    for (let lat = -60; lat <= 60; lat += 20) {
      for (let lon = 0; lon < 360; lon += 6) grid.push({ lat, lon, pin: false });
    }
    for (let lon = 0; lon < 360; lon += 15) {
      for (let lat = -84; lat <= 84; lat += 4) grid.push({ lat, lon, pin: false });
    }

    // verified-roof hotspots (Indian cities)
    const pins = [
      { lat: 28.6, lon: 77.2 }, { lat: 19.1, lon: 72.9 }, { lat: 12.97, lon: 77.6 },
      { lat: 26.8, lon: 80.9 }, { lat: 26.9, lon: 75.8 }, { lat: 22.6, lon: 88.4 },
      { lat: 17.4, lon: 78.5 }, { lat: 13.1, lon: 80.3 },
    ].map((p) => ({ ...p, pin: true, phase: Math.random() * Math.PI * 2 }));

    // satellites: [orbit tilt(rad), angular speed, orbit radius factor, phase]
    const sats = [
      { tilt: 0.5, speed: 0.16, rf: 1.55, ph: 0 },
      { tilt: -0.9, speed: 0.11, rf: 1.85, ph: 2.1 },
      { tilt: 1.4, speed: 0.20, rf: 1.35, ph: 4.4 },
    ];

    const project = (lat, lon, rotY, rotX) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lon + rotY) * Math.PI) / 180;
      const x = Math.sin(phi) * Math.cos(theta);
      const y0 = Math.cos(phi);
      const z0 = Math.sin(phi) * Math.sin(theta);
      const cX = Math.cos(rotX), sX = Math.sin(rotX);
      const y = y0 * cX - z0 * sX;
      const z = y0 * sX + z0 * cX;
      return { x, y, z };
    };

    const draw = () => {
      t += 0.004;
      mouse.sx += (mouse.x - mouse.sx) * 0.045;
      mouse.sy += (mouse.y - mouse.sy) * 0.045;

      ctx.clearRect(0, 0, w, h);

      const r = Math.min(w, h) * 0.30;
      const cx = w > 900 ? w * 0.68 : w * 0.5;
      const cy = h * 0.46 + (mouse.sy - 0.5) * 26;
      const rotY = t * 22 + (mouse.sx - 0.5) * 120;
      const rotX = 0.34 + (mouse.sy - 0.5) * 0.5;

      const toScreen = (p) => {
        const s = 1 + p.z * 0.14; // subtle perspective
        return { sx: cx + p.x * r * s, sy: cy - p.y * r * s, depth: p.z };
      };

      // grid dots
      for (const g of grid) {
        const p = project(g.lat, g.lon, rotY, rotX);
        const sc = toScreen(p);
        const front = (1 - p.z) / 2; // 1 = front, 0 = back
        ctx.fillStyle = 'rgba(148,170,157,' + (0.05 + front * 0.22).toFixed(3) + ')';
        ctx.fillRect(sc.sx, sc.sy, 1.4, 1.4);
      }

      // hotspot pins + pulse rings
      for (const pin of pins) {
        const p = project(pin.lat, pin.lon, rotY, rotX);
        if (p.z < -0.05) { // front hemisphere only
          const sc = toScreen(p);
          const pulse = (Math.sin(t * 1.5 + pin.phase) + 1) / 2;
          ctx.beginPath();
          ctx.arc(sc.sx, sc.sy, 2.2 + pulse * 1.4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,229,133,' + (0.75 + pulse * 0.25).toFixed(2) + ')';
          ctx.shadowColor = 'rgba(0,229,133,0.8)';
          ctx.shadowBlur = 8 + pulse * 6;
          ctx.fill();
          ctx.shadowBlur = 0;
          // expanding ring
          ctx.beginPath();
          ctx.arc(sc.sx, sc.sy, 4 + pulse * 9, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0,229,133,' + (0.35 * (1 - pulse)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // satellites + orbit paths
      for (const s of sats) {
        const rr = r * s.rf;
        // orbit path
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.12) {
          let ox = Math.cos(a + s.ph) * rr;
          let oz = Math.sin(a + s.ph) * rr;
          let oy = 0;
          // tilt orbit around X axis
          const cT = Math.cos(s.tilt), sT = Math.sin(s.tilt);
          const oy2 = oy * cT - oz * sT;
          const oz2 = oy * sT + oz * cT;
          // global Y rotation for variety
          const gRot = t * 22 + (mouse.sx - 0.5) * 120;
          const gx = ox * Math.cos((gRot * Math.PI) / 180) - oz2 * Math.sin((gRot * Math.PI) / 180);
          const gz = ox * Math.sin((gRot * Math.PI) / 180) + oz2 * Math.cos((gRot * Math.PI) / 180);
          const sc = { x: cx + gx, y: cy - oy2 };
          if (a === 0) ctx.moveTo(sc.x, sc.y);
          else ctx.lineTo(sc.x, sc.y);
        }
        ctx.strokeStyle = 'rgba(0,229,133,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // satellite dot
        const ang = t * 60 * s.speed + s.ph;
        let ox = Math.cos(ang) * rr;
        let oz = Math.sin(ang) * rr;
        const cT = Math.cos(s.tilt), sT = Math.sin(s.tilt);
        const oy2 = -oz * sT;
        const oz2 = oz * cT;
        const gRot = t * 22 + (mouse.sx - 0.5) * 120;
        const gx = ox * Math.cos((gRot * Math.PI) / 180) - oz2 * Math.sin((gRot * Math.PI) / 180);
        const gz = ox * Math.sin((gRot * Math.PI) / 180) + oz2 * Math.cos((gRot * Math.PI) / 180);

        ctx.beginPath();
        ctx.arc(cx + gx, cy - oy2, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00E585';
        ctx.shadowColor = 'rgba(0,229,133,1)';
        ctx.shadowBlur = 9;
        ctx.fill();
        ctx.shadowBlur = 0;

        // beam to globe when in front
        if (gz < 0) {
          ctx.beginPath();
          ctx.moveTo(cx + gx, cy - oy2);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = 'rgba(0,229,133,0.14)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
      aria-hidden="true"
    />
  );
}

/* ---------- Cursor-following ambient glow ---------- */
function CursorGlow() {
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const sx = useSpring(x, { stiffness: 55, damping: 18 });
  const sy = useSpring(y, { stiffness: 55, damping: 18 });

  useEffect(() => {
    const onMove = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[6] hidden h-[560px] w-[560px] rounded-full md:block"
      style={{
        x: sx, y: sy, translateX: '-50%', translateY: '-50%',
        background: 'radial-gradient(circle, rgba(0,229,133,0.055) 0%, rgba(0,229,133,0.015) 40%, transparent 65%)',
      }}
    />
  );
}

/* ---------- Magnetic wrapper for buttons ---------- */
function Magnetic({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14 });
  const sy = useSpring(y, { stiffness: 180, damping: 14 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.09);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.09);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-block">
      {children}
    </motion.div>
  );
}

/* ---------- 3D tilt card ---------- */

/* ---------- Reveal on scroll ---------- */
function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.65, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Animated counter ---------- */
function Counter({ to, suffix = '', prefix = '', duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);

  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{val.toLocaleString('en-IN')}{suffix}</span>;
}

/* ---------- Main component ---------- */
export default function VyomLanding() {
  const [faqOpen, setFaqOpen] = useState(null);
  const [city, setCity] = useState('Lucknow');
  const [roofSize, setRoofSize] = useState(1200);
  const [featActive, setFeatActive] = useState(0);
  const [featHover, setFeatHover] = useState(false);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 140]);

  // Buttery smooth scrolling (Lenis)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf;
    const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  const cities = { Delhi: 1.3, Mumbai: 1.35, Lucknow: 1.0, Bengaluru: 1.2, Jaipur: 1.25, Other: 0.9 };
  const monthly = Math.round(roofSize * 2.5 * cities[city]);
  const yearly = monthly * 12;

  const marqueeCities = ['New Delhi', 'Mumbai', 'Lucknow', 'Bengaluru', 'Jaipur', 'Kolkata', 'Hyderabad', 'Chennai', 'Pune', 'Kanpur', 'Indore', 'Bhopal'];

  const steps = [
    { n: '01', icon: MapPin, title: 'List your roof in 2 minutes', desc: 'Roof type, address and a map pin. No paperwork, no agent, no fees. Your roof goes live instantly.' },
    { n: '02', icon: Satellite, title: 'Satellite verification from orbit', desc: 'Google Earth Engine measures your roof\u2019s usable area, shading and orientation automatically. No manual site visit. No guesswork. No waiting weeks.' },
    { n: '03', icon: Radar, title: 'Businesses discover you', desc: 'Solar companies search the live map by city, roof type and size — and send lease requests straight to your inbox.' },
    { n: '04', icon: IndianRupee, title: 'You earn rent for 20+ years', desc: 'Accept a request and your idle roof becomes a monthly income stream. The business installs and maintains its own equipment.' },
  ];

  const features = [
    { icon: Satellite, title: 'Verified from orbit', desc: 'Every listing is scanned by Google Earth Engine — area, shading, roof type. Buyers trust what they see, so deals close faster.' },
    { icon: MapPin, title: 'Live marketplace map', desc: 'Verified rooftops across cities, filterable by city, roof type and area. The whole market on one screen.' },
    { icon: ShieldCheck, title: 'Identity-protected leasing', desc: 'Owners, businesses and admins have separate roles with token-based access. Listings never expose your phone number.' },
    { icon: Zap, title: 'AI assistant built in', desc: 'A Gemini-powered assistant answers leasing questions inside the app — in English and Hindi — around the clock.' },
    { icon: Eye, title: 'Full request transparency', desc: 'Track every request — pending, accepted, leased — with live status on the map. No black box, no middleman stories.' },
    { icon: FileCheck, title: 'Free for owners, forever', desc: 'Listing, verification and lease requests cost nothing. You keep the lease income. We earn only when the market works.' },
  ];

  // Auto-advance the feature panel; pause while hovering
  useEffect(() => {
    if (featHover) return undefined;
    const t = setInterval(() => setFeatActive((i) => (i + 1) % features.length), 3800);
    return () => clearInterval(t);
  }, [featHover, features.length]);

  const comparison = [
    { label: 'Roof assessment', old: 'Agent site visit, 2–4 weeks', vyom: 'Satellite scan, ~2 minutes' },
    { label: 'Cost to owner', old: 'Broker commission', vyom: 'Zero — free forever' },
    { label: 'Who finds you', old: 'Whoever the broker knows', vyom: 'Every business on the map' },
    { label: 'Trust in listing data', old: 'Verbal claims', vyom: 'Google Earth Engine verified' },
    { label: 'Request tracking', old: 'Phone calls and hope', vyom: 'Live status, request to lease' },
    { label: 'Market visibility', old: 'One broker\u2019s contact list', vyom: 'City-wide public map' },
  ];

  const roadmap = [
    { tag: 'LIVE NOW', title: 'Satellite verification', desc: 'Google Earth Engine roof scans working in production — every new roof is auto-verified on add.' },
    { tag: 'LIVE NOW', title: 'Lease marketplace', desc: 'Owner listings, seeker requests, owner accept/reject flow — all live with role-based access.' },
    { tag: 'LIVE NOW', title: 'AI assistant', desc: 'Gemini-powered chatbot answering leasing questions, with 429 auto-retry and response caching.' },
    { tag: 'NEXT', title: 'Digital agreements', desc: 'Paperless lease signing and downloadable agreement documents.' },
    { tag: 'NEXT', title: 'Payments & payouts', desc: 'Automated monthly rent payouts to owner accounts.' },
  ];

  const faqs = [
    { q: 'How much can my roof earn?', a: 'It depends on size, city and sun exposure. Typical solar rooftop leases in India pay roughly \u20B92\u20134 per sq ft per month — a 1,200 sq ft roof in Lucknow can earn around \u20B936,000 a year. Use the calculator above for an estimate.' },
    { q: 'What does satellite verification actually check?', a: 'Google Earth Engine imagery is used to estimate usable roof area, shading from nearby structures, and roof type. This replaces the manual site visit that normally delays every solar deal by weeks.' },
    { q: 'Is listing really free?', a: 'Yes. Listing, verification and receiving lease requests are free for roof owners. VyomAcre earns from the business side, and only when leases actually close.' },
    { q: 'Do I need to invest in solar panels myself?', a: 'No. The business that leases your roof installs and maintains its own equipment. You provide the roof and receive rent — that is the whole model.' },
    { q: 'Is my data safe?', a: 'Listings show only first names and roof details — never your full identity or phone number. Lease requests are private and visible only to you.' },
  ];

  return (
    <div className="relative overflow-x-clip bg-[#050A08] text-[#E7EFE9]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
.vy-head { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; letter-spacing: -0.01em; }
@keyframes vymarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes vyfloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
.vy-float { animation: vyfloat 6.5s ease-in-out infinite; will-change: transform; }
@keyframes vypulse { 0% { top: 2%; opacity: 0; } 12% { opacity: 1; } 82% { opacity: 1; } 100% { top: 98%; opacity: 0; } }
`}</style>
      <CursorGlow />

      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] overflow-hidden px-6 pb-20 pt-16 sm:px-10 lg:px-16">
        <GlobeCanvas />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050A08]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#050A08] via-[#050A08]/70 to-transparent lg:w-3/5" />

        <motion.div style={{ y: heroY }} className="relative mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-center">
          <div className="mb-7 inline-flex w-fit items-center gap-2.5 rounded-full border border-[#1C2A22] bg-[#0A1410]/80 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E585] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00E585]" />
            </span>
            <span className="text-xs font-medium text-[#93A096]">Live in production — every listing verified by satellite</span>
          </div>

          <h1 className="vy-head max-w-3xl text-5xl font-bold leading-[1.04] tracking-tight text-[#F4F8F5] sm:text-6xl lg:text-7xl">
            Your roof is worth money.<br />
            <span className="text-[#00E585]">Get it verified from orbit.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#A6B1A8]">
            VyomAcre connects India&rsquo;s idle rooftops with solar businesses.
            List your roof, let Google&rsquo;s satellites verify it, and receive
            lease requests — without a single site visit.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Magnetic>
              <a href="/signup" className="inline-flex items-center justify-center rounded-xl bg-[#00E585] px-8 py-4 text-base font-semibold text-[#04160C] shadow-[0_0_20px_rgba(0,229,133,0.16)]">
                List your roof — free
              </a>
            </Magnetic>
            <Magnetic>
              <a href="/properties" className="inline-flex items-center gap-2 rounded-xl border border-[#24352B] px-8 py-4 text-base font-medium text-[#D7E2DA] transition-colors hover:border-[#00E585]/50">
                Browse the live map <ArrowRight size={17} />
              </a>
            </Magnetic>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#1A2620] pt-7 text-sm text-[#7E8B82]">
            <span className="inline-flex items-center gap-2"><Clock size={15} className="text-[#00E585]" /> 2 minutes to list</span>
            <span className="inline-flex items-center gap-2"><Layers size={15} className="text-[#00E585]" /> Zero investment</span>
            <span className="inline-flex items-center gap-2"><TrendingUp size={15} className="text-[#00E585]" /> 20+ year income</span>
          </div>
        </motion.div>
      </section>

      {/* ============ CITY MARQUEE ============ */}
      <section className="border-y border-[#121D17] bg-[#071009] py-5">
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max gap-12" style={{ animation: 'vymarquee 34s linear infinite' }}>
            {[...marqueeCities, ...marqueeCities].map((c, i) => (
              <span key={i} className="flex items-center gap-12 text-sm font-medium tracking-[0.18em] text-[#4E5B52]">
                {c.toUpperCase()}
                <span className="h-1 w-1 rounded-full bg-[#00E585]/40" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS BAND ============ */}
      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {[
            { v: 637, s: ' GW', label: 'Rooftop solar potential in India (CEEW)' },
            { v: 25, s: ' cr', label: 'Households that could host it' },
            { v: 75021, s: ' cr', prefix: '₹', label: 'PM Surya Ghar push to unlock it' },
            { v: 2, s: ' min', label: 'To list a roof on VyomAcre' },
          ].map((st) => (
            <Reveal key={st.label}>
              <div className="vy-head text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
                <Counter to={st.v} prefix={st.prefix || ''} suffix={st.s} />
              </div>
              <div className="mt-2 max-w-[210px] text-sm leading-relaxed text-[#7E8B82]">{st.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="border-t border-[#121D17] bg-[#071009] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E585]">How it works</div>
            <h2 className="mt-4 max-w-2xl vy-head text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              From rooftop to rent in four steps
            </h2>
          </Reveal>

          <div className="relative mt-16">
            <div className="absolute bottom-6 left-[27px] top-6 hidden w-px bg-gradient-to-b from-[#00E585]/40 via-[#1A2620] to-transparent sm:block" />
            <div className="space-y-6">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.06}>
                  <div className="group relative flex gap-6 rounded-2xl border border-[#182420] bg-[#08120C] p-7 transition-colors hover:border-[#00E585]/40 sm:ml-0 sm:pl-8">
                    <div className="flex h-14 w-14 flex-none items-center justify-center rounded-xl border border-[#00E585]/25 bg-[#00E585]/[0.06]">
                      <s.icon size={24} strokeWidth={1.5} className="text-[#00E585]" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-xs font-semibold tracking-[0.14em] text-[#00E585]">{s.n}</span>
                        <span className="text-lg font-semibold text-[#EDF3EF]">{s.title}</span>
                      </div>
                      <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#8A968E]">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15}>
            <div className="mt-8 rounded-2xl border border-[#182420] bg-[#08120C] px-7 py-6 text-[15px] leading-relaxed text-[#8A968E]">
              The step that dies in today&rsquo;s market is step two —{' '}
              <span className="text-[#00E585]">without satellite verification, every roof needs a manual site visit before anyone will sign anything.</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CALCULATOR ============ */}
      <section className="border-t border-[#121D17] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E585]">Roof income calculator</div>
            <h2 className="mt-4 vy-head text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              What could your roof earn?
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#93A096]">
              Solar businesses pay rent to lease rooftops for their equipment.
              Move the slider and see what your idle space could be worth —
              you never install anything yourself.
            </p>
            <div className="mt-8 space-y-3 text-sm leading-relaxed text-[#7E8B82]">
              <p><span className="text-[#D7E2DA] font-medium">No investment.</span> The business installs and maintains its own panels and equipment.</p>
              <p><span className="text-[#D7E2DA] font-medium">No risk to your home.</span> Leases run 20+ years with fixed monthly rent.</p>
              <p><span className="text-[#D7E2DA] font-medium">No agent.</span> Requests arrive directly in your VyomAcre inbox.</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-[#182420] bg-[#08120C] p-8 sm:p-10">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7E8B82]">Your city</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(cities).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={'rounded-full px-4 py-2 text-sm font-medium transition-colors ' + (city === c
                      ? 'bg-[#00E585] text-[#04160C]'
                      : 'border border-[#24352B] text-[#93A096] hover:border-[#00E585]/40')}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <label className="mt-8 block text-xs font-semibold uppercase tracking-[0.14em] text-[#7E8B82]">
                Roof size — <span className="text-[#F4F8F5]">{roofSize.toLocaleString('en-IN')} sq ft</span>
              </label>
              <input
                type="range"
                min="300"
                max="5000"
                step="50"
                value={roofSize}
                onChange={(e) => setRoofSize(Number(e.target.value))}
                className="mt-4 w-full accent-[#00E585]"
              />
              <div className="mt-1 flex justify-between text-[11px] text-[#5E6B62]">
                <span>300 sq ft</span><span>5,000 sq ft</span>
              </div>

              <div className="mt-9 rounded-2xl border border-[#1C2A22] bg-[#0A1410] p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7E8B82]">Estimated lease income</div>
                <div className="mt-2 vy-head text-5xl font-bold tracking-tight text-[#00E585]">
                  <Counter to={yearly} prefix="₹" key={city + '-' + roofSize} duration={0.7} />
                  <span className="text-lg font-medium text-[#93A096]"> / year</span>
                </div>
                <div className="mt-2 text-sm text-[#7E8B82]">
                  About <span className="text-[#D7E2DA]">₹{monthly.toLocaleString('en-IN')}</span> per month · estimate only
                </div>
              </div>

              <a href="/signup" className="mt-8 block rounded-xl bg-[#00E585] py-3.5 text-center text-base font-semibold text-[#04160C] transition-transform hover:scale-[1.02]">
                List your roof — get real offers
              </a>
              <p className="mt-4 text-center text-xs leading-relaxed text-[#5E6B62]">
                Estimate based on typical Indian solar rooftop lease rates (~₹2.5/sq ft/month, city-adjusted). Actual offers depend on shading, orientation and buyer.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FEATURES (infinite loop rows) ============ */}
      <section className="border-t border-[#121D17] bg-[#071009] py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E585]">Why VyomAcre</div>
            <h2 className="mt-4 max-w-2xl vy-head text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              Built like infrastructure, not like a listing site
            </h2>
          </Reveal>
        </div>

        {/* Desktop: auto-cycling expanding panels */}
        <div
          className="mt-14 hidden h-[340px] gap-3 lg:flex"
          onMouseEnter={() => setFeatHover(true)}
          onMouseLeave={() => setFeatHover(false)}
        >
          {features.map((f, i) => {
            const active = i === featActive;
            return (
              <button
                key={f.title}
                onClick={() => setFeatActive(i)}
                className={'relative flex flex-col overflow-hidden rounded-2xl border p-6 text-left transition-all duration-500 ease-out ' + (active
                  ? 'flex-[3.4] border-[#00E585]/40 bg-[#08120C]'
                  : 'flex-[0.5] border-[#182420] bg-[#08120C]/50 hover:border-[#00E585]/25')}
              >
                {active && (
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#00E585]/[0.07] blur-3xl" />
                )}
                <f.icon size={24} strokeWidth={1.5} className="flex-none text-[#00E585]" />
                <div className={'transition-opacity duration-500 ' + (active ? 'mt-6 opacity-100' : 'hidden')}>
                  <div className="text-lg font-semibold text-[#EDF3EF]">{f.title}</div>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-[#8A968E]">{f.desc}</p>
                </div>
                {!active && (
                  <span className="vy-head mt-auto text-xs font-semibold tracking-[0.12em] text-[#5E6B62]">0{i + 1}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile: one card at a time + dots */}
        <div
          className="mt-14 lg:hidden"
          onMouseEnter={() => setFeatHover(true)}
          onMouseLeave={() => setFeatHover(false)}
        >
          <div className="rounded-2xl border border-[#00E585]/40 bg-[#08120C] p-6">
            {features.slice(featActive, featActive + 1).map((f) => (
              <div key={f.title}>
                <f.icon size={24} strokeWidth={1.5} className="text-[#00E585]" />
                <div className="mt-4 text-lg font-semibold text-[#EDF3EF]">{f.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-[#8A968E]">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {features.map((f, i) => (
              <button
                key={f.title}
                onClick={() => setFeatActive(i)}
                className={'h-1.5 rounded-full transition-all ' + (i === featActive ? 'w-7 bg-[#00E585]' : 'w-1.5 bg-[#24352B]')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPARISON ============ */}
      <section className="border-t border-[#121D17] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E585]">The difference</div>
            <h2 className="mt-4 vy-head text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              The broker route vs the VyomAcre route
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-2xl border border-[#182420]">
              <div className="grid grid-cols-3 border-b border-[#182420] bg-[#08120C] px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#7E8B82]">
                <span />
                <span>Broker route</span>
                <span className="text-[#00E585]">VyomAcre</span>
              </div>
              {comparison.map((row) => (
                <div key={row.label} className="grid grid-cols-3 items-start border-b border-[#121D17] bg-[#050A08] px-6 py-5 text-sm last:border-0">
                  <span className="pr-3 font-medium text-[#D7E2DA]">{row.label}</span>
                  <span className="flex items-start gap-2 pr-3 text-[#8A968E]"><X size={15} className="mt-0.5 flex-none text-[#B05252]" />{row.old}</span>
                  <span className="flex items-start gap-2 text-[#C9D6CD]"><Check size={15} className="mt-0.5 flex-none text-[#00E585]" />{row.vyom}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ WHY NOW ============ */}
      <section className="border-t border-[#121D17] bg-[#071009] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E585]">Why now</div>
            <h2 className="mt-4 max-w-3xl vy-head text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              India is spending <span className="text-[#00E585]">₹75,021 crore</span> to solve this. The marketplace is missing.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-x-6 gap-y-10 border-t border-[#1A2620] pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: 10000000, fmt: '1 crore', label: 'Households targeted by PM Surya Ghar for rooftop solar' },
              { v: 30, s: ' GW', label: 'Residential rooftop target by March 2027' },
              { v: 13000000, fmt: '1.3 crore', label: 'Registrations already on the national portal' },
              { v: 3, s: ' cities', label: 'Already live on VyomAcre\u2019s marketplace map' },
            ].map((m) => (
              <Reveal key={m.label}>
                <div>
                  <div className="vy-head text-4xl font-bold tracking-tight text-[#F4F8F5]">
                    {m.fmt ? m.fmt : <Counter to={m.v} suffix={m.s || ''} />}
                  </div>
                  <div className="mt-2 max-w-[220px] text-sm leading-relaxed text-[#7E8B82]">{m.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <p className="mt-10 border-t border-[#121D17] pt-6 text-xs text-[#5E6B62]">
              Sources: PIB cabinet approval, Feb 2024 · IEEFA analysis of PMSGY, Oct 2024 · CEEW residential rooftop solar study
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ ROADMAP (floating panels) ============ */}
      <section className="relative overflow-hidden border-t border-[#121D17] px-6 py-24 sm:px-10 lg:px-16">
        <div className="vy-float pointer-events-none absolute right-[6%] top-[16%] h-64 w-64 rounded-full bg-[#00E585]/[0.04] blur-3xl" style={{ animationDelay: '1.3s' }} />
        <div className="relative mx-auto max-w-4xl">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E585]">Where we are</div>
            <h2 className="mt-4 max-w-2xl vy-head text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              Working software, not a promise
            </h2>
          </Reveal>

          <div className="relative mt-16">
            <div className="absolute bottom-6 left-8 top-6 hidden w-px bg-gradient-to-b from-[#00E585]/40 via-[#1A2620] to-transparent sm:block" />
            <div className="pointer-events-none absolute left-[26px] hidden h-3 w-3 rounded-full bg-[#00E585] shadow-[0_0_14px_rgba(0,229,133,0.9)] sm:block" style={{ animation: 'vypulse 4.5s ease-in-out infinite' }} />

            <div className="space-y-6">
              {roadmap.map((r, i) => (
                <Reveal key={r.title} delay={i * 0.05}>
                  <div className="vy-float relative sm:pl-20" style={{ animationDelay: (i * 0.75).toFixed(2) + 's' }}>
                    <span className={'absolute left-[26px] top-1/2 hidden h-3 w-3 -translate-y-1/2 items-center justify-center rounded-full sm:flex ' + (r.tag === 'LIVE NOW'
                      ? 'bg-[#00E585] shadow-[0_0_10px_rgba(0,229,133,0.5)]'
                      : 'border border-[#3A4A40] bg-[#050A08]')}>
                      {r.tag === 'LIVE NOW' && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E585] opacity-25" />
                      )}
                    </span>
                    <div className={'rounded-2xl border px-7 py-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ' + (r.tag === 'LIVE NOW'
                      ? 'border-[#00E585]/25 bg-[#08120C]/70 hover:border-[#00E585]/50'
                      : 'border-[#182420] bg-[#08120C]/50 hover:border-[#24352B]')}>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={'rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] ' + (r.tag === 'LIVE NOW'
                          ? 'bg-[#00E585]/10 text-[#00E585]'
                          : 'bg-[#141D17] text-[#7E8B82]')}>
                          {r.tag}
                        </span>
                        <span className="text-lg font-semibold text-[#EDF3EF]">{r.title}</span>
                        <span className="ml-auto hidden font-mono text-[10px] tracking-[0.18em] text-[#3A4A40] sm:block">0{i + 1}</span>
                      </div>
                      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#8A968E]">{r.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="border-t border-[#121D17] bg-[#071009] px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E585]">Questions</div>
            <h2 className="mt-4 vy-head text-4xl font-bold tracking-tight text-[#F4F8F5] sm:text-5xl">
              What owners ask us
            </h2>
          </Reveal>

          <div className="mt-12 divide-y divide-[#182420] border-y border-[#182420]">
            {faqs.map((f, i) => (
              <div key={i}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-base font-medium text-[#EDF3EF]">{f.q}</span>
                  <ChevronDown
                    size={19}
                    className={'flex-none text-[#00E585] transition-transform duration-300 ' + (faqOpen === i ? 'rotate-180' : '')}
                  />
                </button>
                <div className={'grid transition-all duration-300 ease-out ' + (faqOpen === i ? 'grid-rows-[1fr] pb-6 opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <div className="overflow-hidden">
                    <p className="max-w-xl text-[15px] leading-relaxed text-[#8A968E]">{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative overflow-hidden border-t border-[#121D17] px-6 py-28 sm:px-10 lg:px-16">
        <GlobeCanvas />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050A08] via-transparent to-[#050A08]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="vy-head text-4xl font-bold leading-tight tracking-tight text-[#F4F8F5] sm:text-6xl">
            India&rsquo;s rooftops are idle.<br />
            <span className="text-[#00E585]">Put yours to work.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-[#A6B1A8]">
            Free to list. Verified by satellite. Live on the map in minutes.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <a href="/signup" className="inline-flex items-center justify-center rounded-xl bg-[#00E585] px-9 py-4 text-base font-semibold text-[#04160C] shadow-[0_0_20px_rgba(0,229,133,0.16)]">
              List your roof — free
            </a>
            <a href="/properties" className="inline-flex items-center gap-2 rounded-xl border border-[#24352B] px-9 py-4 text-base font-medium text-[#D7E2DA] transition-colors hover:border-[#00E585]/50">
              Explore the map <ArrowRight size={17} />
            </a>
          </div>
          <p className="mt-14 inline-flex items-center gap-2 text-xs text-[#5E6B62]">
            <Globe size={13} className="text-[#00E585]/60" />
            Built on Google Earth Engine · Powered by Gemini AI · Live in production
          </p>
        </div>
      </section>
    </div>
  );
}
