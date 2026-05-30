import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export default function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const photo = photos[index];

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          data-testid="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <button
            data-testid="lightbox-close"
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            data-testid="lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-6 md:left-12 text-white/60 hover:text-white p-3 z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8" strokeWidth={1.2} />
          </button>
          <button
            data-testid="lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-6 md:right-12 text-white/60 hover:text-white p-3 z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8" strokeWidth={1.2} />
          </button>
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl max-h-[85vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photo.image_url}
              alt={photo.title}
              className="max-h-[80vh] max-w-full object-contain"
            />
            <div className="text-center text-white/70 text-sm tracking-wide">
              <div className="font-serif text-lg text-white">{photo.title}</div>
              {photo.caption && <div className="mt-1 italic">{photo.caption}</div>}
              <div className="mt-2 uppercase text-xs tracking-[0.3em] text-white/40">
                {photo.category}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
