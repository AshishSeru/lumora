"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <header className="w-full">
      <nav className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative inline-block w-3.5 h-3.5">
            <span className="absolute inset-0 rounded-full bg-ember-500 blur-[3px] opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="absolute inset-0 rounded-full bg-ember-500" />
          </span>
          <span className="font-display text-xl tracking-tight text-espresso-900">
            Lumora
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-8 text-sm text-espresso-700">
          <a href="#how" className="hover:text-espresso-900 transition-colors">
            How it works
          </a>
          <a href="#why" className="hover:text-espresso-900 transition-colors">
            Why Lumora
          </a>
          <Link
            href="/learn"
            className="text-white bg-ember-500 hover:bg-ember-600 transition-colors font-medium px-4 py-2 rounded-full"
          >
            Start learning
          </Link>
        </div>

        <Link
          href="/learn"
          className="sm:hidden text-white bg-ember-500 font-medium px-4 py-2 rounded-full text-sm"
        >
          Start
        </Link>
      </nav>
    </header>
  );
}
