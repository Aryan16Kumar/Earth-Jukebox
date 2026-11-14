import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export default function About({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    ref.current?.showModal();
    return () => {
      ref.current?.close();
      prev?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="about-dialog"
      aria-labelledby="about-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <button
        className="icon-button close-about"
        aria-label="Close explanation"
        onClick={onClose}
      >
        <X />
      </button>
      <span className="eyebrow">BEHIND THE SOUND</span>
      <h2 id="about-title">A transparent translation.</h2>
      <p>
        Earth Jukebox translates NASA visual frames into original synthesized
        sound. The night-lights globe opens geographic studies; the resource
        library explores oceans, aerosols, air quality, carbon dioxide,
        lightning, atmospheric rivers, and forests.
      </p>
      <p>
        Every resource has an explained mapping and source link. Color excess,
        brightness, edges, and spatial distribution control the voices. Caldwell
        73 demonstrates radial sonification as a separate astronomy lesson.
      </p>
      <p>
        These are still-image studies, not full historical playback or
        calibrated measurements. Rendered colors, background, camera angle, and
        artistic normalization influence what you hear. The EIC content database
        is linked as the source directory.
      </p>
      <p>
        Keyboard controls, labeled dialogs, reduced motion, and descriptive text
        are included. Usability with blind or low-vision participants has not
        yet been validated.
      </p>
      <a
        href="https://svs.gsfc.nasa.gov/5313/"
        target="_blank"
        rel="noreferrer"
      >
        NASA source and full credits ↗
      </a>
    </dialog>
  );
}
