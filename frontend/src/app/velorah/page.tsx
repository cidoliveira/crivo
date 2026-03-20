"use client"

import "./velorah.css"

export default function VelorahPage() {
  return (
    <div className="velorah min-h-[100dvh] relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <span
          className="text-3xl tracking-tight text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          AutoU
        </span>

        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-sm text-white/70 hover:text-white transition-colors">
            Classificador
          </a>
          <a href="#arquitetura" className="text-sm text-white/70 hover:text-white transition-colors">
            Arquitetura
          </a>
          <a href="#modelo" className="text-sm text-white/70 hover:text-white transition-colors">
            Modelo IA
          </a>
          <a href="#stack" className="text-sm text-white/70 hover:text-white transition-colors">
            Stack
          </a>
        </div>

        <a href="/" className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-[1.03] transition-transform cursor-pointer">
          Abrir App
        </a>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-40">
        <h1
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-white animate-fade-rise drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Classifique emails com inteligência artificial.
        </h1>

        <p className="text-white/75 text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          Cole o texto de um email. Em segundos, a IA diz se é produtivo ou
          não — e ainda sugere uma resposta em português.
        </p>

        <a href="/" className="liquid-glass rounded-full px-14 py-5 text-base text-white mt-12 hover:scale-[1.03] transition-transform cursor-pointer animate-fade-rise-delay-2">
          Experimentar
        </a>
      </section>
    </div>
  )
}
