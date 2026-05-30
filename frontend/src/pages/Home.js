import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Instagram, Phone, MapPin } from "lucide-react";
import { fetchPhotos, CATEGORIES } from "@/lib/api";
import Lightbox from "@/components/Lightbox";

const serviceGroups = [
  {
    group: "Quick Shoots",
    note: "Fast turnaround, fully edited.",
    items: [
      {
        name: "The 30",
        price: "$55",
        duration: "30 min",
        includes: ["30-minute shoot", "All photos edited", "Online gallery delivery"],
      },
      {
        name: "The 30 + Reel",
        price: "$75",
        duration: "30 min",
        includes: ["30-minute shoot", "All photos edited", "Recap reel to a song of your choice"],
      },
      {
        name: "The Full Hour",
        price: "$135",
        duration: "1 hr",
        includes: ["1-hour shoot", "All photos edited", "Recap reel to a song of your choice"],
      },
    ],
  },
  {
    group: "Videos",
    note: "Cinematic edits, color-graded.",
    items: [
      {
        name: "1-Take Reel",
        price: "$60",
        duration: "Single take",
        includes: ["One continuous take", "Color grade & sound", "Vertical & horizontal export"],
      },
      {
        name: "3-Take Reel",
        price: "$90",
        duration: "Multi-take",
        includes: ["Three takes cut together", "Color grade & sound", "Vertical & horizontal export"],
      },
      {
        name: "Music Video",
        price: "$150",
        duration: "Full production",
        includes: ["Concept & shot list", "Full edit + color", "Up to 1 song length"],
      },
    ],
  },
  {
    group: "Events",
    note: "Birthdays, parties, brand activations.",
    items: [
      {
        name: "Event Coverage",
        price: "$95",
        duration: "First hour",
        includes: ["First hour of coverage", "All photos edited", "Online gallery"],
      },
      {
        name: "Additional Hours",
        price: "+$50",
        duration: "per extra hr",
        includes: ["Each additional hour after the first", "All photos edited", "Same-gallery delivery"],
      },
    ],
  },
];

const Hero = ({ heroPhoto }) => (
  <section data-testid="hero-section" className="relative min-h-[92vh] overflow-hidden">
    <div className="absolute inset-0">
      {heroPhoto && (
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
          src={heroPhoto.image_url}
          alt="hero"
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/40 via-[#0a0a0c]/30 to-[#0a0a0c]" />
    </div>

    <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:block">
      <span className="vertical-text text-[10px] tracking-[0.4em] uppercase text-[#a1a1aa]">
        Est. 2021 — Photographer & Visual storyteller
      </span>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-32 sm:pt-40 pb-16 sm:pb-24 flex flex-col min-h-[92vh] justify-between gap-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="text-[10px] uppercase tracking-[0.4em] text-[#a1a1aa]"
      >
        Portfolio / 2021 — 2026
      </motion.div>

      <div>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[19vw] sm:text-[14vw] md:text-[11vw] lg:text-[9rem] leading-[0.95] tracking-tighter font-light text-[#f5f5f0]"
        >
          flicks
          <span className="italic font-light"> from</span>
          <br />
          <span className="block text-right pr-1 sm:pr-2">nai.</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <p className="max-w-md text-sm sm:text-lg text-[#a1a1aa] leading-relaxed font-light">
            Quiet portraits, slow light and unhurried moments — captured on
            film and digital across the city and the road.
          </p>
          <Link
            to="/portfolio"
            data-testid="hero-cta"
            className="self-start sm:self-auto group inline-flex items-center gap-3 border border-white/20 px-5 sm:px-6 py-3 text-[11px] sm:text-xs uppercase tracking-[0.3em] hover:bg-[#f5f5f0] hover:text-[#0a0a0c] transition-colors duration-300"
          >
            View the work
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:rotate-45" strokeWidth={1.5} />
          </Link>
        </motion.div>
      </div>
    </div>
  </section>
);

const Marquee = () => {
  const words = ["Portrait", "Editorial", "Sports", "Street", "Events", "Brand", "Film"];
  const line = [...words, ...words, ...words];
  return (
    <section className="border-y border-white/5 py-8 overflow-hidden">
      <div className="flex marquee whitespace-nowrap gap-12">
        {line.map((w, i) => (
          <span
            key={i}
            className="font-serif italic text-3xl sm:text-5xl text-[#f5f5f0]/90 tracking-tight"
          >
            {w} <span className="text-[#a1a1aa] mx-4">/</span>
          </span>
        ))}
      </div>
    </section>
  );
};

const FeaturedGrid = ({ photos, onOpen }) => {
  const feats = photos.slice(0, 6);
  return (
    <section
      data-testid="featured-section"
      className="max-w-7xl mx-auto px-6 sm:px-12 py-24 sm:py-32"
    >
      <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-[#a1a1aa] mb-4">
            Selected work / 01
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-tight font-light">
            Recent frames
          </h2>
        </div>
        <Link
          to="/portfolio"
          data-testid="featured-view-all"
          className="text-xs uppercase tracking-[0.3em] link-underline text-[#a1a1aa] hover:text-[#f5f5f0]"
        >
          View full archive →
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-3 sm:gap-4">
        {feats.map((p, i) => {
          const layouts = [
            "col-span-12 sm:col-span-8 aspect-[16/10]",
            "col-span-12 sm:col-span-4 aspect-[3/4]",
            "col-span-6 sm:col-span-4 aspect-[3/4]",
            "col-span-6 sm:col-span-4 aspect-[3/4]",
            "col-span-12 sm:col-span-4 aspect-[3/4]",
            "col-span-12 sm:col-span-8 aspect-[16/10]",
          ];
          return (
            <motion.button
              key={p.id}
              data-testid={`featured-photo-${i}`}
              onClick={() => onOpen(i)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={`img-zoom relative group ${layouts[i % layouts.length]}`}
            >
              <img
                src={p.image_url}
                alt={p.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-left opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div>
                  <div className="font-serif text-lg text-white">{p.title}</div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/60 mt-1">
                    {p.category}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

const Categories = () => (
  <section className="max-w-7xl mx-auto px-6 sm:px-12 py-24 border-t border-white/5">
    <div className="text-[10px] uppercase tracking-[0.4em] text-[#a1a1aa] mb-8">
      Categories / 02
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/5">
      {CATEGORIES.map((c) => (
        <Link
          key={c.key}
          to={`/portfolio/${c.key}`}
          data-testid={`category-link-${c.key}`}
          className="bg-[#0a0a0c] p-8 group hover:bg-[#121216] transition-colors"
        >
          <div className="font-serif text-3xl tracking-tight">{c.label}</div>
          <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-[#a1a1aa] flex items-center gap-2">
            Browse
            <ArrowUpRight
              className="w-3 h-3 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              strokeWidth={1.5}
            />
          </div>
        </Link>
      ))}
    </div>
  </section>
);

const Services = () => (
  <section
    id="services"
    data-testid="services-section"
    className="border-t border-white/5"
  >
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-24 sm:py-32">
      <div className="grid lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-5">
          <div className="text-[10px] uppercase tracking-[0.4em] text-[#a1a1aa] mb-6">
            Services / 03
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight font-light leading-[1.05]">
            Sessions <span className="italic">&amp;</span> rates
          </h2>
        </div>
        <p className="lg:col-span-6 lg:col-start-7 text-[#a1a1aa] text-base sm:text-lg leading-relaxed">
          Three lanes — quick shoots, video reels, and event coverage. Every
          booking starts with a short message. Travel beyond the city is
          quoted separately.
        </p>
      </div>

      <div className="space-y-20">
        {serviceGroups.map((g, gi) => (
          <div key={g.group} data-testid={`service-group-${gi}`}>
            <div className="grid lg:grid-cols-12 gap-6 mb-10 items-end border-b border-white/10 pb-6">
              <div className="lg:col-span-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#a1a1aa]">
                  0{gi + 1} — Category
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl tracking-tight mt-2">
                  {g.group}
                </h3>
              </div>
              <p className="lg:col-span-7 lg:col-start-6 text-[#a1a1aa] italic font-serif text-lg">
                {g.note}
              </p>
            </div>

            <div className={`grid gap-px bg-white/5 ${g.items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {g.items.map((s, i) => (
                <div
                  key={s.name}
                  data-testid={`service-${gi}-${i}`}
                  className="bg-[#0a0a0c] p-10"
                >
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#a1a1aa]">
                    0{i + 1}
                  </div>
                  <h4 className="font-serif text-2xl sm:text-3xl mt-4">{s.name}</h4>
                  <div className="mt-6 flex items-baseline gap-4 border-b border-white/10 pb-6">
                    <div className="font-serif text-4xl text-[#f5f5f0]">{s.price}</div>
                    <div className="text-xs text-[#a1a1aa] uppercase tracking-[0.2em]">
                      {s.duration}
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm text-[#a1a1aa]">
                    {s.includes.map((inc) => (
                      <li key={inc} className="flex gap-3">
                        <span className="text-[#f5f5f0]">—</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    data-testid={`service-cta-${gi}-${i}`}
                    className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] link-underline text-[#f5f5f0]"
                  >
                    Book
                    <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Contact = () => (
  <section
    id="contact"
    data-testid="contact-section"
    className="border-t border-white/5"
  >
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-24 sm:py-32 grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-6">
        <div className="text-[10px] uppercase tracking-[0.4em] text-[#a1a1aa] mb-6">
          Contact / 04
        </div>
        <h2 className="font-serif text-4xl sm:text-6xl lg:text-8xl tracking-tighter font-light leading-[0.95]">
          Let's make
          <br />
          <span className="italic">something</span>
          <br />
          together.
        </h2>
      </div>
      <div className="lg:col-span-6 lg:pl-12 space-y-10 text-lg">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#a1a1aa] mb-3 flex items-center gap-2">
            <Phone className="w-3 h-3" strokeWidth={1.5} /> Phone
          </div>
          <a
            href="tel:+14436573873"
            data-testid="contact-phone"
            className="font-serif text-3xl sm:text-4xl link-underline break-words"
          >
            (443) 657-3873
          </a>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#a1a1aa] mb-3 flex items-center gap-2">
            <Instagram className="w-3 h-3" strokeWidth={1.5} /> Instagram
          </div>
          <a
            href="https://www.instagram.com/flicksfromnai/"
            target="_blank"
            rel="noreferrer"
            data-testid="contact-instagram"
            className="font-serif text-3xl sm:text-4xl link-underline break-words"
          >
            @flicksfromnai
          </a>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#a1a1aa] mb-3 flex items-center gap-2">
            <MapPin className="w-3 h-3" strokeWidth={1.5} /> Based in
          </div>
          <div className="font-serif text-3xl sm:text-4xl" data-testid="contact-location">
            Baltimore, Maryland
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-sm text-[#a1a1aa] leading-relaxed">
          For bookings and collaborations — text or DM with your date,
          location and a short note about the shoot.
        </div>
      </div>
    </div>
  </section>
);

export default function Home() {
  const [photos, setPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    fetchPhotos({ featured: true }).then((data) => {
      const sorted = data.sort((a, b) => a.order - b.order);
      setPhotos(sorted.length ? sorted : data);
    }).catch(() => setPhotos([]));
  }, []);

  const heroPhoto = photos[0];

  return (
    <div>
      <Hero heroPhoto={heroPhoto} />
      <Marquee />
      <FeaturedGrid photos={photos} onOpen={(i) => setLightboxIndex(i)} />
      <Categories />
      <Services />
      <Contact />
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i - 1 + photos.length) % photos.length)}
          onNext={() => setLightboxIndex((i) => (i + 1) % photos.length)}
        />
      )}
    </div>
  );
}
