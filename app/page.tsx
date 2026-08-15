'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const WA_NUMBER = '6282275058957';
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  'Halo SSLC, saya ingin bertanya tentang SSLC'
)}`;

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#vision', label: 'Our Vision' },
  { href: '#mission', label: 'Our Mission' },
  { href: '#values', label: 'Our Core Values' },
  { href: '#dream', label: 'Our Big Dream' },
];

const HERO_PHOTOS = ['/act1.JPEG', '/val1.png',  '/act2.JPEG', '/val2.png', '/act3.JPEG', '/val3.png', '/act4.JPEG', '/val4.png'];

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4L12 2z" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5L16 9" />
    </svg>
  );
}

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-12.36 7.56L3 20l1.05-5.4A8.5 8.5 0 1 1 21 11.5z" />
      <path d="M8.5 10.5c0 3 2.5 5.5 5.5 5.5" />
    </svg>
  );
}

function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const PROGRAMS: { name: string; icon: React.ReactNode }[] = [
  {
    name: 'English Language',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    ),
  },
  {
    name: 'Music Education',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V6.5L19 4.5v11.5" />
        <circle cx="6.5" cy="18" r="2.3" fill="currentColor" stroke="none" />
        <circle cx="16.5" cy="16" r="2.3" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Calistung (Reading, Writing & Arithmetic)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20l1-4L15 6l3 3L8 19l-4 1z" />
        <path d="M13 8l3 3" />
      </svg>
    ),
  },
  {
    name: 'Mathematics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="12" y1="8" x2="12" y2="16" />
      </svg>
    ),
  },
  {
    name: 'Science',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6M10 3v5l-5.2 9a2 2 0 0 0 1.8 3h10.8a2 2 0 0 0 1.8-3l-5.2-9V3" />
        <line x1="8" y1="14" x2="16" y2="14" />
      </svg>
    ),
  },
  {
    name: 'EduDaycare',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11l8-6 8 6" />
        <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
        <path
          d="M12 12.2c-1.1-1.3-3.2-.5-3.2 1 0 1.6 2 2.9 3.2 4 1.2-1.1 3.2-2.4 3.2-4 0-1.5-2.1-2.3-3.2-1z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    ),
  },
  {
    name: 'Enrichment & Development',
    icon: <StarIcon className="w-full h-full" />,
  },
];

const MISSION_POINTS = [
  'Provide high-quality educational and child development programs across English, Music, Calistung, Mathematics, Science, EduDaycare, and enrichment.',
  "Create active, engaging, safe, creative, and child-centered learning experiences that maximize every child's potential.",
  'Cultivate positive character, confidence, independence, creativity, critical thinking, and a lifelong love of learning.',
  'Establish an inspiring, inclusive, and nurturing environment supporting intellectual, social, emotional, and physical growth.',
  'Develop professional, competent, and ethical educators through continuous learning and development.',
  'Build strong partnerships with parents, schools, and communities as part of a collaborative education ecosystem.',
  'Implement quality-driven systems based on technology and international best practices in education.',
  'Position SSLC as the preferred informal education center creating lasting positive impact for children and families.',
];

const VALUES = [
  { letter: 'S', title: 'Service Excellence', desc: 'Delivering exceptional service with professionalism, compassion, dedication, and genuine care.', image: '/val1.png' },
  { letter: 'S', title: 'Student-Centered', desc: "Every decision prioritizes the safety, well-being, and holistic development of every child.", image: '/val2.png' },
  { letter: 'L', title: 'Lifelong Learning', desc: 'Embracing continuous learning, innovation, and personal growth for the best educational experience.', image: '/val3.png' },
  { letter: 'C', title: 'Collaboration', desc: "Strong partnerships among educators, parents, staff, and community are essential to children's success.", image: '/val4.png' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('main section[id]');
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHash(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach((s) => navObserver.observe(s));

    const revealEls = document.querySelectorAll('[data-reveal]');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    return () => {
      navObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);

  return (
    <main className={`${jakarta.className} min-h-screen bg-[#FFF8F1] text-[#2C2738]`}>
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 backdrop-blur-md transition-all duration-300 ${
          scrolled ? 'bg-[#FFF8F1]/95 shadow-md py-3' : 'bg-[#FFF8F1]/80 py-4'
        } px-4`}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="#hero" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Smart Step Learning Center" width={160} height={158} className="h-9 md:h-11 w-auto" priority />
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-[#E8637F] ${
                  activeHash === link.href ? 'text-[#E8637F]' : 'text-[#16233F]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href={WA_URL}
              target="_blank"
              className="border-2 border-[#E8637F] text-[#16233F] px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#FBDCE4] transition"
            >
              Chat Admin
            </Link>
            <Link
              href="/login"
              className="bg-[#16233F] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#E8637F] transition shadow-lg shadow-[#16233F]/20"
            >
              Login
            </Link>
          </div>

          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg bg-white/60 border border-slate-200"
          >
            <span className={`w-5 h-0.5 bg-[#16233F] transition-all ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`w-5 h-0.5 bg-[#16233F] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-[#16233F] transition-all ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-3 flex flex-col gap-3 p-4 bg-white/95 rounded-2xl border border-slate-100 shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-2">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-[#16233F] py-1 border-b border-slate-50">
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link href={WA_URL} target="_blank" className="border-2 border-[#E8637F] text-center text-[#16233F] py-2.5 rounded-xl font-bold">
                Chat Admin
              </Link>
              <Link href="/login" className="bg-[#16233F] text-white text-center py-2.5 rounded-xl font-bold">
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative scroll-mt-24 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-br from-[#FBDCE4] to-transparent opacity-10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 sm:w-72 h-60 sm:h-72 rounded-full bg-gradient-to-br from-[#FBDCE4] to-transparent opacity-10 blur-2xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
          
          {/* Header Info (Always First) */}
          <div className="w-full md:w-1/2 space-y-4 sm:space-y-6" data-reveal>
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#C7963E] bg-[#EFCE8E]/20 px-3 py-1 rounded-full">
              <StarIcon className="w-3.5 h-3.5" />
              The First Step Toward a Bright Future
            </span>
            
            <h1 className={`${fraunces.className} text-3xl sm:text-4xl md:text-5xl font-semibold text-[#16233F] leading-tight`}>
              Welcome to <span className="text-[#E8637F]">Smart Step Learning Center</span> (SSLC)
            </h1>

            {/* Mobile Photo Slider Hook (Hanya muncul di Layar HP setelah Judul) */}
            <div className="block md:hidden my-4 relative">
              <div className="relative rounded-2xl shadow-xl shadow-[#16233F]/15 overflow-hidden">
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{ delay: 2200, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  loop
                  className="hero-swiper h-60 w-full"
                >
                  {HERO_PHOTOS.map((src) => (
                    <SwiperSlide key={src}>
                      <div className="relative w-full h-60">
                        <Image
                          src={src}
                          alt="Kegiatan belajar di Smart Step Learning Center"
                          fill
                          sizes="100vw"
                          className="object-cover"
                          priority
                          unoptimized
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <div className="absolute -bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md px-3 py-2 flex items-center justify-center gap-2 z-10 border border-slate-100">
                <StarIcon className="w-4 h-4 text-[#C7963E]" />
                <span className="text-[11px] font-bold text-[#16233F]">SSLC  highlights</span>
              </div>
            </div>

            <p className="text-[#6A6376] text-sm sm:text-base leading-relaxed">
              We believe early childhood and foundational education shape children&apos;s character, confidence,
              essential skills, and lifelong passion for learning — supporting their cognitive, language,
              social-emotional, physical, creative, and moral development.
            </p>

            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
              {['English', 'Music', 'Calistung', 'Mathematics', 'Science', 'EduDaycare', 'Enrichment'].map((tag) => (
                <span key={tag} className="bg-white border border-[#FBDCE4] text-[#6A6376] text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/login"
                className="w-full sm:w-auto text-center bg-[#16233F] text-white px-7 py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-[#E8637F] transition shadow-lg shadow-[#16233F]/20"
              >
                Parent &amp; Student Login
              </Link>
              <Link
                href={WA_URL}
                target="_blank"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 border-2 border-[#E8637F] text-[#16233F] px-6 py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-[#FBDCE4] transition"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#E8637F]" />
                Chat with Our Admin
              </Link>
            </div>
          </div>

          {/* Desktop Photo Slider */}
          <div className="hidden md:block md:w-1/2 relative" data-reveal>
            <div className="absolute -top-4 left-10 w-8 h-8 text-[#C7963E] animate-float">
              <StarIcon className="w-full h-full" />
            </div>
            <div className="absolute top-1/3 -right-3 w-5 h-5 text-[#E8637F] animate-float [animation-delay:1s]">
              <StarIcon className="w-full h-full" />
            </div>

            <div className="relative rounded-[28px] shadow-2xl shadow-[#16233F]/20 overflow-hidden">
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 2200, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop
                className="hero-swiper h-96 w-full"
              >
                {HERO_PHOTOS.map((src) => (
                  <SwiperSlide key={src}>
                    <div className="relative w-full h-96">
                      <Image
                        src={src}
                        alt="Kegiatan belajar di Smart Step Learning Center"
                        fill
                        sizes="50vw"
                        className="object-cover"
                        priority
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 border border-slate-100">
              <StarIcon className="w-5 h-5 text-[#C7963E]" />
              <span className="text-xs font-bold text-[#16233F]">Real moments at SSLC</span>
            </div>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="scroll-mt-20 py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-[#FCEDE1]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[0.85fr_1.15fr] gap-8 md:gap-14 items-start">
          <div data-reveal className="space-y-3 sm:space-y-4">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#C7963E]">
              <StarIcon className="w-3.5 h-3.5" />
              About SSLC
            </span>
            <h2 className={`${fraunces.className} text-2xl sm:text-3xl md:text-4xl font-semibold text-[#16233F]`}>
              A Trusted Partner in Every Child&apos;s Growth
            </h2>
            <p className="text-[#6A6376] text-sm sm:text-base leading-relaxed">
              Smart Step Learning Center (SSLC) is a leading informal education institution dedicated to delivering
              high-quality learning experiences through innovative, enjoyable, and child-centered educational programs.
            </p>
            <p className="text-[#6A6376] text-sm sm:text-base leading-relaxed">
              We believe early childhood and foundational education shape children&apos;s character, confidence,
              essential skills, and lifelong passion for learning.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4" data-reveal>
            {PROGRAMS.map((program) => (
              <div key={program.name} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FBDCE4] text-[#16233F] flex items-center justify-center mb-3 p-2">
                  {program.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#16233F] leading-snug">{program.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="scroll-mt-20 py-12 sm:py-16 md:py-24 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto" data-reveal>
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#C7963E] mb-3">
            <StarIcon className="w-3.5 h-3.5" />
            Our Vision
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} className="w-9 h-9 sm:w-11 sm:h-11 mx-auto mb-3 text-[#EFCE8E]">
            <path d="M12 6c-2-1.5-5-2-8-1v13c3-1 6-.5 8 1 2-1.5 5-2 8-1V5c-3-1-6-.5-8 1z" />
            <line x1="12" y1="6" x2="12" y2="19" />
          </svg>
          <p className={`${fraunces.className} italic text-lg sm:text-xl md:text-2xl text-[#16233F] leading-relaxed px-2`}>
            &quot;To become the largest, most trusted, and leading informal education institution that empowers every
            child to learn, grow, and thrive through holistic education, innovation, and international standards.&quot;
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="scroll-mt-20 py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-[#FCEDE1]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12" data-reveal>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#C7963E] mb-2">
              <StarIcon className="w-3.5 h-3.5" />
              Our Mission
            </span>
            <h2 className={`${fraunces.className} text-2xl sm:text-3xl md:text-4xl font-semibold text-[#16233F]`}>
              How We Bring the Vision to Life
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4" data-reveal>
            {MISSION_POINTS.map((point, i) => (
              <div key={i} className="flex gap-3 sm:gap-4 bg-white rounded-xl p-4 sm:p-5 shadow-sm border-l-4 border-[#E8637F]">
                <CheckIcon className="w-5 h-5 text-[#C7963E] flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-[#2C2738] leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section (Optimized for Mobile with Horizontal Carousel) */}
      <section id="values" className="scroll-mt-20 py-12 sm:py-16 md:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12" data-reveal>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#C7963E] mb-2">
              <StarIcon className="w-3.5 h-3.5" />
              Our Core Values
            </span>
            <h2 className={`${fraunces.className} text-2xl sm:text-3xl md:text-4xl font-semibold text-[#16233F]`}>
              What S·S·L·C Stands For
            </h2>
            <p className="text-xs text-slate-400 mt-2 block sm:hidden">👈 Usap ke samping untuk melihat nilai lainnya</p>
          </div>

          {/* Responsive Layout: Mobile Horizontal Snap Scroll, Desktop Grid */}
          <div 
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:pb-0" 
            data-reveal
          >
            {VALUES.map((value, i) => (
              <div 
                key={i} 
                className="snap-center flex-shrink-0 w-[82vw] sm:w-auto bg-[#f7e5d7] rounded-2xl p-5 sm:p-6 text-center shadow-md border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  {/* High Quality Responsive Image Box */}
                  <div className="relative w-full h-44 sm:h-36 md:h-40 rounded-xl overflow-hidden mb-4 bg-[#FBDCE4] shadow-inner">
                    <Image
                      src={value.image}
                      alt={`${value.title} illustration`}
                      fill
                      sizes="(max-width: 640px) 80vw, (max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <span className={`${fraunces.className} text-3xl sm:text-4xl font-bold bg-gradient-to-br from-[#E8637F] to-[#f58ca2] bg-clip-text text-transparent`}>
                    {value.letter}
                  </span>
                  <h3 className="font-bold text-[#16233F] mt-1 mb-2 text-base">{value.title}</h3>
                  <p className="text-xs sm:text-sm text-[#6A6376] leading-relaxed">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Integrity Card */}
          <div className="mt-6 max-w-xl mx-auto bg-[#16233F] rounded-2xl p-6 sm:p-8 flex items-center gap-4 sm:gap-6 shadow-xl" data-reveal>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <StarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#EFCE8E]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg mb-1">Integrity</h3>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                Upholding honesty, accountability, professionalism, and ethical conduct in everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Big Dream Section */}
      <section id="dream" className="scroll-mt-20 relative py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-gradient-to-b from-[#182644] to-[#0D1526] text-white text-center overflow-hidden">
        <StarIcon className="absolute w-4 h-4 text-[#C7963E] opacity-50 top-[14%] left-[8%]" />
        <StarIcon className="absolute w-6 h-6 text-[#C7963E] opacity-50 top-[22%] right-[10%]" />

        <div className="relative max-w-2xl mx-auto" data-reveal>
          <StarIcon className="w-5 h-5 text-[#C7963E] mx-auto mb-3" />
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#EFCE8E] mb-3">
            Our Big Dream
          </span>
          <h2 className={`${fraunces.className} text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-4 sm:mb-6`}>
            The Most Trusted, Leading Integrated Education Institution in the Region
          </h2>
          <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed mb-4">
            Smart Step Learning Center aspires to become the most recognized and trusted informal education
            institution in the region — offering English, Calistung, Tutoring, EduDaycare, and a wide range of
            child development programs.
          </p>
          <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">
            Through excellence in education and strong community partnerships, SSLC aims to make a lasting
            positive impact on children, families, and the future of education.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-[#FDEEF1] text-center">
        <div className="max-w-xl mx-auto" data-reveal>
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#C7963E] mb-3">
            <StarIcon className="w-3.5 h-3.5" />
            Ready to Take the First Step?
          </span>
          <h2 className={`${fraunces.className} text-2xl sm:text-3xl md:text-4xl font-semibold text-[#16233F] mb-3 sm:mb-4`}>
            Give Your Child a Smart Step Toward a Bright Future
          </h2>
          <p className="text-[#6A6376] text-xs sm:text-sm md:text-base mb-6 sm:mb-8">
            Chat with our admin to learn more about our programs, schedules, and enrollment — we&apos;d love to
            welcome your family to SSLC.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={WA_URL}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-[#1DA851] transition shadow-lg shadow-[#25D366]/30"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat with Our Admin
            </Link>
            <Link
              href="/login"
              className="border-2 border-[#16233F] text-[#16233F] px-8 py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-[#16233F] hover:text-white transition"
            >
              Parent &amp; Student Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D1526] text-white/70 pt-12 sm:pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr] gap-8 sm:gap-10 mb-10 sm:mb-12">
            <div>
              <Image src="/logotnsp.png" alt="SSLC logo" width={160} height={158} className="h-9 sm:h-11 w-auto mb-4 brightness-0 invert" />
              <p className="text-xs sm:text-sm leading-relaxed max-w-xs">
                Smart Step Learning Center — high-quality informal education nurturing every child&apos;s
                intellectual, emotional, social, and creative growth.
              </p>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold tracking-wider uppercase mb-3 sm:mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-[#EFCE8E] transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold tracking-wider uppercase mb-3 sm:mb-4">Get in Touch</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>Gang Sehat 5, Jln SM Raja, Wek V, Kec Padangsidimpuan Selatan, Kota Padang Sidempuan, Sumatera Utara 22721</li>
                <li>+62 822-7505-8957</li>
                <li className="">smartsteplearningcenterpadangsidimpuan@gmail.com</li>
                <li>
                  <Link
                    href="https://www.instagram.com/smartsteplearningcenter_?igsh=MWgzNXZ5cWwwdjZrOQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-[#EFCE8E] transition"
                  >
                    <InstagramIcon className="w-4 h-4 flex-shrink-0" />
                    @smartsteplearningcenter_
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left text-[11px] sm:text-xs">
            <span>© 2026 Smart Step Learning Center. All Rights Reserved.</span>
            <span>The First Step Toward a Bright Future</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <Link
        href={WA_URL}
        target="_blank"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/40 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <span className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping-slow" />
        <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </Link>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2.2s ease-out infinite;
        }
        [data-reveal] {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-swiper .swiper-pagination-bullet {
          background: #ffffff;
          opacity: 0.6;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #e8637f;
          opacity: 1;
        }
        /* Sembunyikan Scrollbar untuk Carousel Mobile */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          [data-reveal] { opacity: 1; transform: none; transition: none; }
          .animate-float, .animate-ping-slow { animation: none; }
        }
      `}</style>
    </main>
  );
}