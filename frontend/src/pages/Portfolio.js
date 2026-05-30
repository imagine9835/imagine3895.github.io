import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPhotos, CATEGORIES } from "@/lib/api";
import Lightbox from "@/components/Lightbox";

export default function Portfolio() {
  const { category } = useParams();
  const navigate = useNavigate();
  const active = category || "all";
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchPhotos(active === "all" ? {} : { category: active })
      .then((data) => setPhotos(data))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, [active]);

  const filters = useMemo(() => [{ key: "all", label: "All" }, ...CATEGORIES], []);

  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 pb-12">
        <div className="text-[10px] uppercase tracking-[0.4em] text-[#a1a1aa] mb-6">
          Archive — {active}
        </div>
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl tracking-tighter font-light leading-[0.95] break-words">
          The <span className="italic">archive.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[#a1a1aa] text-base sm:text-lg">
          A growing selection of frames — sorted, sometimes slowly, by category.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-12 mb-12">
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm uppercase tracking-[0.2em] border-y border-white/10 py-5">
          {filters.map((f) => (
            <button
              key={f.key}
              data-testid={`filter-${f.key}`}
              onClick={() =>
                navigate(f.key === "all" ? "/portfolio" : `/portfolio/${f.key}`)
              }
              className={`link-underline transition-colors ${
                active === f.key
                  ? "text-[#f5f5f0] active"
                  : "text-[#a1a1aa] hover:text-[#f5f5f0]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 sm:px-12 pb-24">
        {loading ? (
          <div className="text-[#a1a1aa] text-sm uppercase tracking-[0.3em]">
            Loading…
          </div>
        ) : photos.length === 0 ? (
          <div className="py-24 text-center text-[#a1a1aa]">
            <div className="font-serif text-3xl">No frames yet in this category.</div>
            <Link
              to="/portfolio"
              className="mt-6 inline-block text-xs uppercase tracking-[0.3em] link-underline"
            >
              Browse all
            </Link>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            <AnimatePresence mode="popLayout">
              {photos.map((p, i) => (
                <motion.button
                  layout
                  key={p.id}
                  data-testid={`gallery-photo-${i}`}
                  onClick={() => setLightboxIndex(i)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, delay: (i % 9) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="img-zoom mb-4 block w-full break-inside-avoid relative group"
                >
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="font-serif text-lg text-white">{p.title}</div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/60 mt-1">
                      {p.category}
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

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
