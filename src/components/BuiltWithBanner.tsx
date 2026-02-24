export default function BuiltWithBanner() {
  return (
    <div className="sticky top-0 z-50 bg-brand-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
        <span className="font-medium">
          This is a demo app built entirely on
        </span>
        <a
          href="https://reqres.in"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline underline-offset-2 hover:text-white/90 transition-colors"
        >
          ReqRes
        </a>
        <span className="text-white/70 hidden sm:inline">
          — zero backend code, no database setup
        </span>
        <span className="text-white/50 mx-1.5 hidden sm:inline">|</span>
        <a
          href="https://github.com/benhowdle89/reqres-waitlist-demo"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-white/90 transition-colors"
        >
          View source
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  )
}
