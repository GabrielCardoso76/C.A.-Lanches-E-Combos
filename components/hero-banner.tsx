"use client"

import Image from "next/image"

export function HeroBanner() {
  return (
    <header className="relative w-full overflow-hidden bg-primary">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-banner.jpg"
          alt="C.A. Combos e Lanches - Banner"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>
      <div className="relative flex flex-col items-center justify-center px-4 py-10 text-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <span className="text-3xl font-black text-secondary-foreground">CA</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-primary-foreground">
          C.A. Combos e Lanches
        </h1>
        <p className="mt-1 text-sm font-medium text-primary-foreground/80">
          Os melhores lanches da cidade!
        </p>
      </div>
    </header>
  )
}
