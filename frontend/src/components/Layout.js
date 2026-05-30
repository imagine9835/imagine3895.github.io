import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Instagram } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/#services", label: "Services", anchor: true },
  { to: "/#contact", label: "Contact", anchor: true },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between h-20">
        <Link
          to="/"
          data-testid="header-logo"
          className="font-serif text-xl tracking-tight text-[#f5f5f0]"
        >
          flicks<span className="italic font-light">fromnai</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-sm tracking-wide uppercase text-[#a1a1aa]">
          {navItems.map((item) =>
            item.anchor ? (
              <a
                key={item.to}
                href={item.to}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className="link-underline hover:text-[#f5f5f0] transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `link-underline hover:text-[#f5f5f0] transition-colors ${
                    isActive ? "text-[#f5f5f0] active" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
          <a
            href="https://www.instagram.com/flicksfromnai/"
            target="_blank"
            rel="noreferrer"
            data-testid="nav-instagram"
            className="text-[#f5f5f0] hover:opacity-70 transition-opacity"
          >
            <Instagram className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </nav>

        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-[#f5f5f0]"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div
          data-testid="mobile-menu"
          className="md:hidden bg-[#0a0a0c]/95 backdrop-blur-xl border-t border-white/5"
        >
          <div className="flex flex-col px-6 py-8 gap-6 text-sm uppercase tracking-wide text-[#a1a1aa]">
            {navItems.map((item) =>
              item.anchor ? (
                <a key={item.to} href={item.to} data-testid={`mobile-nav-${item.label.toLowerCase()}`}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.to} to={item.to} data-testid={`mobile-nav-${item.label.toLowerCase()}`}>
                  {item.label}
                </Link>
              )
            )}
            <a
              href="https://www.instagram.com/flicksfromnai/"
              target="_blank"
              rel="noreferrer"
              data-testid="mobile-nav-instagram"
            >
              Instagram
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer
    data-testid="site-footer"
    className="border-t border-white/5 mt-32 py-12 px-6 sm:px-12"
  >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs uppercase tracking-[0.2em] text-[#a1a1aa]">
      <div className="font-serif text-base normal-case tracking-tight text-[#f5f5f0]">
        flicks<span className="italic">fromnai</span>
      </div>
      <a
        href="tel:+14436573873"
        className="hover:text-[#f5f5f0] transition-colors normal-case tracking-normal"
        data-testid="footer-phone"
      >
        (443) 657-3873
      </a>
      <div className="text-center">© {new Date().getFullYear()} — All frames reserved</div>
      <a
        href="https://www.instagram.com/flicksfromnai/"
        target="_blank"
        rel="noreferrer"
        className="hover:text-[#f5f5f0] transition-colors"
        data-testid="footer-instagram"
      >
        @flicksfromnai
      </a>
    </div>
  </footer>
);

export default function Layout() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
