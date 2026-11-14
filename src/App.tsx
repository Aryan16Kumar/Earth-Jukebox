import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  AudioLines,
  ChevronRight,
  Globe2,
  Headphones,
  Info,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCw,
  Volume2,
  X,
} from "lucide-react";
import * as Tone from "tone";
import { AudioEngine } from "./audio";
import { analyzeBand, asciiFrame, mapping, type Feature } from "./analysis";
import { asset, regions, type Region, type Scene } from "./scenes";
import { info } from "./catalog";
import { analyzeScene } from "./catalogAnalysis";
import ResourceLibrary from "./ResourceLibrary";
const Globe = lazy(() => import("./Globe"));
const DURATION = 24;
const empty: Feature = { brightness: 0, vertical: 0.5, horizontal: 0.5 };
function ListeningRoom({
  region,
  onClose,
}: {
  region: Scene;
  onClose: () => void;
}) {
  const details = info(region);
  const dialog = useRef<HTMLDialogElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    engine = useRef<AudioEngine | null>(null),
    image = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [playing, setPlaying] = useState(false),
    [progress, setProgress] = useState(0),
    [ascii, setAscii] = useState(false),
    [asciiText, setAsciiText] = useState(""),
    [enabled, setEnabled] = useState([true, true, true]),
    [volume, setVolume] = useState(0.65),
    [features, setFeatures] = useState<Feature[]>([empty, empty, empty]);
  const pos = useRef(0),
    mask = useRef(enabled),
    lastNote = useRef(-1),
    start = useRef(0);
  useEffect(() => {
    mask.current = enabled;
  }, [enabled]);
  useEffect(() => {
    const d = dialog.current!;
    const previous = document.activeElement as HTMLElement;
    d.showModal();
    return () => {
      d.close();
      previous?.focus();
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    setReady(false);
    img.onload = () => {
      if (cancelled) return;
      image.current = img;
      setReady(true);
    };
    img.onerror = () => {
      if (!cancelled)
        setError("This scene could not load. Close it and try again.");
    };
    img.src = asset(region.image);
    return () => {
      cancelled = true;
    };
  }, [region]);
  function draw(p: number) {
    const c = canvas.current,
      im = image.current;
    if (!c || !im) return;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    c.width = 384;
    c.height = 216;
    const [rx, ry, rw, rh] = region.roi ?? [0, 0, 1, 1];
    ctx.drawImage(
      im,
      rx * im.width,
      ry * im.height,
      rw * im.width,
      rh * im.height,
      0,
      0,
      384,
      216,
    );
    const x = Math.min(376, Math.floor(p * 376));
    const strip = ctx.getImageData(x, 0, 8, 216);
    const f = region.profile
      ? analyzeScene(
          ctx.getImageData(0, 0, 384, 216).data,
          384,
          216,
          p,
          region.profile,
        )
      : [0, 1, 2].map((b) => {
          const a = analyzeBand(strip.data, 8, 216, b);
          return { ...a, horizontal: p };
        });
    setFeatures(f);
    const ac = document.createElement("canvas");
    ac.width = 72;
    ac.height = 30;
    const ax = ac.getContext("2d")!;
    ax.drawImage(c, 0, 0, 72, 30);
    setAsciiText(asciiFrame(ax.getImageData(0, 0, 72, 30).data, 72, 30));
    return f;
  }
  useEffect(() => {
    if (ready) {
      draw(progress);
      void toggle();
    }
  }, [ready]);
  useEffect(() => {
    if (!playing) return;
    start.current = Tone.now() - pos.current * DURATION;
    const id = window.setInterval(() => {
      const p = (Tone.now() - start.current) / DURATION;
      if (p >= 1) {
        pos.current = 1;
        setProgress(1);
        setPlaying(false);
        engine.current?.stop();
        return;
      }
      pos.current = p;
      setProgress(p);
      const step = Math.floor((p * DURATION) / 0.32);
      if (step !== lastNote.current) {
        lastNote.current = step;
        const f = draw(p);
        if (f) engine.current?.play(f, mask.current);
      }
    }, 32);
    return () => window.clearInterval(id);
  }, [playing]);
  async function toggle() {
    if (playing) {
      engine.current?.stop();
      setPlaying(false);
      return;
    }
    try {
      if (!engine.current) engine.current = new AudioEngine(details.profile);
      await engine.current.start();
      engine.current.volume(volume);
      if (pos.current >= 1) {
        pos.current = 0;
        setProgress(0);
      }
      lastNote.current = -1;
      setPlaying(true);
      setError("");
    } catch {
      setError(
        "Audio could not start. Try Play again, or check your browser audio settings.",
      );
    }
  }
  function seek(p: number) {
    engine.current?.stop();
    pos.current = p;
    setProgress(p);
    start.current = Tone.now() - p * DURATION;
    lastNote.current = -1;
    draw(p);
  }
  return (
    <dialog
      ref={dialog}
      className="listening-room"
      aria-labelledby="scene-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="room-top">
        <span className="eyebrow">
          LISTENING STUDY / {region.category ?? "Night lights"}
        </span>
        <button
          className="icon-button"
          aria-label="Close listening room"
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </div>
      <div className="room-content">
        <div className="scene-source-label">
          NASA SCIENTIFIC VISUALIZATION STUDIO
        </div>
        <h2 id="scene-title">
          {region.name}
          <span>{region.suffix ?? " at night."}</span>
        </h2>
        <p className="room-subtitle">{region.subtitle}</p>
        <div className="scene-tabs">
          <button aria-pressed={!ascii} onClick={() => setAscii(false)}>
            NASA visual
          </button>
          <button aria-pressed={ascii} onClick={() => setAscii(true)}>
            ASCII signal <span>↗</span>
          </button>
          <span>{details.period}</span>
        </div>
        <div className="scene-image">
          <canvas
            ref={canvas}
            aria-label={`NASA source image: ${region.name}. Analysis uses the displayed crop.`}
            style={{ visibility: ascii ? "hidden" : "visible" }}
          />
          {ascii && <pre aria-hidden="true">{asciiText}</pre>}
          {details.profile === "stars" ? (
            <div
              className="scan-ray"
              style={{ transform: `rotate(${progress * 360 - 90}deg)` }}
            />
          ) : (
            <div className="scan-line" style={{ left: `${progress * 100}%` }} />
          )}
          <div className="image-caption">
            {ready
              ? details.profile === "stars"
                ? "CLOCKWISE / RADIAL IMAGE SCAN"
                : "LEFT TO RIGHT / IMAGE SCAN"
              : "LOADING NASA FRAME"}
          </div>
        </div>
        <div className="transport">
          <button
            className="play-button"
            aria-label={playing ? "Pause sonification" : "Play sonification"}
            disabled={!ready}
            onClick={toggle}
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div className="timeline">
            <label htmlFor="scan">
              {playing ? "Listening to the light" : "Explore the signal"}
              <span>
                {Math.round(progress * DURATION)
                  .toString()
                  .padStart(2, "0")}{" "}
                / 24 SEC
              </span>
            </label>
            <input
              id="scan"
              aria-label="Spatial scan position"
              type="range"
              min="0"
              max="1"
              step=".001"
              value={progress}
              onChange={(e) => seek(+e.target.value)}
            />
          </div>
          <Volume2 size={17} />
          <input
            className="volume"
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={volume}
            onChange={(e) => {
              setVolume(+e.target.value);
              engine.current?.volume(+e.target.value);
            }}
          />
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <p className="story">{region.story}</p>
        <div className="layer-heading">
          <span className="eyebrow">ISOLATE A VOICE</span>
          <span>Tap to mute · Double-click to solo</span>
        </div>
        <div className="layers">
          {details.layers.map((name, i) => (
            <button
              key={name}
              aria-pressed={enabled[i]}
              onClick={() =>
                setEnabled((v) => v.map((a, j) => (i === j ? !a : a)))
              }
              onDoubleClick={() => setEnabled((v) => v.map((_, j) => i === j))}
            >
              <span className="layer-number">0{i + 1}</span>
              <span>
                {name}
                <small>
                  {mapping(features[i]).midi} MIDI ·{" "}
                  {Math.round(features[i].brightness * 100)}% visual signal
                </small>
              </span>
              <AudioLines size={20} />
            </button>
          ))}
        </div>
        <details>
          <summary>
            What am I hearing? <Plus size={15} />
          </summary>
          <p>{details.explanation}</p>
          <p>
            Listen with one voice, then add the others. Muting all voices
            produces silence. Scan time explores an image, not a passage of
            observation dates.
          </p>
        </details>
        <details>
          <summary>
            Source, geography & limitations <Plus size={15} />
          </summary>
          <p>{details.credit}</p>
          <p>
            {details.period}. {details.limitation}
          </p>
          <p>
            The displayed image is cropped to exclude exterior legends and
            borders where possible. Color profiles suppress neutral labels;
            background and similarly colored annotations can still affect the
            signal. Full preprocessing provenance is available in the resource
            inventory.
          </p>
          <a href={details.source} target="_blank" rel="noreferrer">
            Original NASA resource and full credits
          </a>
        </details>
        <div className="room-footer">
          ORIGINAL FRAME → SPATIAL FEATURES → MUSICAL RULES → YOUR EARS
        </div>
      </div>
    </dialog>
  );
}
export default function App() {
  const reduced = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [rotate, setRotate] = useState(!reduced.current),
    [selected, setSelected] = useState<Scene | null>(null),
    [failed, setFailed] = useState(false),
    [about, setAbout] = useState(false);
  function selectRegion(r: Scene) {
    setRotate(false);
    setSelected(r);
    // Open the story immediately; audio permissions must never block its UI.
    Tone.getContext();
    void Tone.start().catch(() => {});
  }

  return (
    <main>
      <header className="header">
        <a className="brand" href="#" aria-label="Earth Jukebox home">
          <span className="brand-mark">
            <Globe2 size={24} />
          </span>
          EARTH<span className="brand-light">JUKEBOX</span>
        </a>
        <nav>
          <button
            onClick={() =>
              document.getElementById("regions")?.scrollIntoView({
                behavior: reduced.current ? "instant" : "smooth",
              })
            }
          >
            Explore the planet <ArrowUpRight size={13} />
          </button>
          <button onClick={() => setAbout(true)}>Behind the sound</button>
        </nav>
        <div className="mission-label">
          <span /> NASA SPACE APPS 2026
        </div>
      </header>
      <section className="hero" aria-label="Explore Earth through sound">
        <div className="orbital-caption">
          <span className="status-dot" /> LIVE SYNTHESIS / EARTH OBSERVATORY
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-line" /> A DIFFERENT WAY TO KNOW OUR WORLD
          </div>
          <h1>
            A planet worth
            <br />
            <em>listening to.</em>
          </h1>
          <p>
            Every light has a story.
            <br />
            Explore Earth’s night lights.
            <br />
            Hear the patterns hidden in plain sight.
          </p>
          <button
            className="primary"
            onClick={() =>
              document.getElementById("regions")?.scrollIntoView({
                behavior: reduced.current ? "instant" : "smooth",
              })
            }
          >
            Find your first sound <ArrowUpRight size={18} />
          </button>
          <div className="headphones">
            <Headphones size={15} /> Best experienced with headphones
          </div>
        </div>
        <div
          className="globe-stage"
          aria-label="Interactive 3D Earth. Drag to rotate and scroll to zoom."
        >
          <Suspense
            fallback={
              <div className="globe-loading">[ INITIALIZING EARTH ]</div>
            }
          >
            <Globe
              rotate={rotate && !selected}
              onSelect={selectRegion}
              onInteract={() => setRotate(false)}
              onFail={() => setFailed(true)}
            />
          </Suspense>
          {failed && (
            <p className="webgl-fallback">
              3D view unavailable. Choose a region below.
            </p>
          )}
          <div className="globe-instructions">
            <span>DRAG TO ROTATE</span>
            <span>SCROLL TO EXPLORE</span>
            <button
              onClick={() => setRotate((v) => !v)}
              aria-label={
                rotate ? "Pause globe rotation" : "Resume globe rotation"
              }
            >
              <RotateCw size={13} />
              {rotate ? "PAUSE ORBIT" : "RESUME ORBIT"}
            </button>
          </div>
        </div>
        <div className="side-coordinates" aria-hidden="true">
          23° N / 79° E <span>BLUE MARBLE, BLACK MARBLE.</span>
        </div>
        <div className="hero-bottom">
          <a href="#regions">
            <ArrowDown size={17} /> START EXPLORING
          </a>
          <span>ONE PLANET. COUNTLESS FREQUENCIES.</span>
          <span>01 — 02</span>
        </div>
      </section>
      <section id="regions" className="regions-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE LISTENING ATLAS</span>
            <h2>
              Choose a place.
              <br />
              <span>Discover its rhythm.</span>
            </h2>
          </div>
          <p>
            Two windows into our illuminated world.
            <br />
            Real NASA frames. Sound made as you listen.
          </p>
        </div>
        <div className="region-grid">
          {regions.map((r, i) => (
            <button
              className="region-card"
              key={r.id}
              onClick={() => selectRegion(r)}
            >
              <img
                src={asset(r.image)}
                alt={`NASA night-lights regional window around ${r.name}`}
                loading="lazy"
              />
              <div className="card-top">
                <span>0{i + 1} / NIGHT LIGHTS</span>
                <ArrowUpRight size={22} />
              </div>
              <div className="card-bottom">
                <span>
                  <h3>{r.name}</h3>
                  <p>{r.subtitle}</p>
                </span>
                <span className="listen-circle">
                  <Play size={18} />
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="atlas-note">
          <Info size={14} />
          <span>
            Curated regional windows from NASA’s Earth Information Center. Scan
            time represents spatial exploration, not historical change.
          </span>
        </div>
      </section>
      <ResourceLibrary onSelect={selectRegion} />
      <section className="method-section">
        <pre aria-hidden="true">
          {
            "    . : * : .\n . : * @ * : .\n: * @ # @ * :\n . : * @ * : .\n    . : * : ."
          }
        </pre>
        <div>
          <span className="eyebrow">SCIENCE, TRANSLATED INTO FEELING</span>
          <h2>
            Not just a view.
            <br />
            <em>A way to listen.</em>
          </h2>
          <p>
            Brightness becomes expression. Position becomes pitch. A NASA visual
            frame becomes a small, evolving composition—with every musical
            choice explained.
          </p>
          <button className="text-button" onClick={() => setAbout(true)}>
            Follow the signal <ChevronRight size={16} />
          </button>
        </div>
        <div className="signal-path">
          <span>01 / NASA VISUAL FRAME</span>
          <span>↓</span>
          <span>02 / PIXEL FEATURES</span>
          <span>↓</span>
          <span>03 / MUSICAL RULES</span>
          <span>↓</span>
          <span>04 / YOUR LISTENING EXPERIENCE</span>
        </div>
      </section>
      <footer>
        <span>
          EARTH JUKEBOX{" "}
          <small>© 2026 · An independent Space Apps project</small>
        </span>
        <a
          href="https://svs.gsfc.nasa.gov/5313/"
          target="_blank"
          rel="noreferrer"
        >
          Imagery: NASA Scientific Visualization Studio ↗
        </a>
        <span>MADE OF LIGHT. PLAYED AS SOUND.</span>
      </footer>
      {selected && (
        <ListeningRoom
          key={selected.id}
          region={selected}
          onClose={() => setSelected(null)}
        />
      )}
      {about && <About onClose={() => setAbout(false)} />}
    </main>
  );
}
function About({ onClose }: { onClose: () => void }) {
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
