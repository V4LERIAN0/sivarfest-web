type PublicPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
};

export function PublicPageHeader({
  eyebrow,
  title,
  description,
  aside,
}: PublicPageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-white/10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="sivar-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div
        className="absolute -right-20 -top-24 h-72 w-72 bg-[#ff5a00]/12 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="sivar-kicker">{eyebrow}</p>
          <h1 className="sivar-display sivar-section-title mt-4 max-w-5xl text-5xl text-[#f2f0eb] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
              {description}
            </p>
          )}
        </div>

        {aside}
      </div>
    </header>
  );
}
