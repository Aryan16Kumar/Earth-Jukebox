import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  AudioLines,
  Globe2,
  Headphones,
  Library,
  Pause,
  Play,
  Search,
  X,
} from "lucide-react";
import * as Tone from "tone";
import { asset, regions, type Scene } from "./scenes";
import { catalog } from "./catalog";
import ListeningRoom from "./ListeningRoom";
import ResourceLibrary from "./ResourceLibrary";
import About from "./About";
import AsciiField from "./AsciiField";
const Globe = lazy(() => import("./Globe"));
export default function App() {
  const [path, setPath] = useState(location.pathname);
  const explorer = path.endsWith("/explore");
  const [reduced, setReduced] = useState(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [rotate, setRotate] = useState(!reduced);
  const [selected, setSelected] = useState<Scene | null>(null);
  const [library, setLibrary] = useState(false);
  const [about, setAbout] = useState(false);
  const [query, setQuery] = useState("");
  const [failed, setFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(m.matches);
      if (m.matches) setRotate(false);
    };
    m.addEventListener("change", change);
    return () => m.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const pop = () => {
      setPath(location.pathname);
      setSelected(null);
      setLibrary(false);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    document.title = explorer
      ? "Explore Earth — Earth Jukebox"
      : "Earth Jukebox — The planet has a soundtrack";
  }, [explorer]);
  function go(explore: boolean) {
    const next = import.meta.env.BASE_URL + (explore ? "explore" : "");
    history.pushState({}, "", next);
    setPath(next);
    setSelected(null);
    setLibrary(false);
    setQuery("");
    window.scrollTo(0, 0);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function select(scene: Scene) {
    if (!explorer) go(true);
    setSelected(scene);
    setLibrary(false);
    setQuery("");
    setRotate(false);
    Tone.getContext();
    void Tone.start().catch(() => {});
  }
  const matches = [...regions, ...catalog].filter((s) =>
    `${s.name} ${s.category ?? "Night lights"} ${s.subtitle}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <main
      className={explorer ? "explorer" : "landing"}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !about) {
          setQuery("");
          if (library) setLibrary(false);
          else setSelected(null);
        }
      }}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="app-header">
        <a
          className="brand"
          href={import.meta.env.BASE_URL}
          onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              go(false);
            }
          }}
        >
          <Globe2 size={27} />
          <span>
            EARTH
            <br />
            <b>JUKEBOX</b>
          </span>
        </a>
        {explorer && (
          <div className="search-wrap">
            <label className="search-box">
              <Search size={17} />
              <input
                type="search"
                aria-label="Search places and NASA studies"
                placeholder="Find a place or a sound…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            {query && (
              <div className="search-results" aria-label="Search results">
                {matches.length ? (
                  matches.map((s) => (
                    <button key={s.id} onClick={() => select(s)}>
                      <span>
                        {s.name}
                        <small>
                          {s.category ?? "Night lights · Regional study"}
                        </small>
                      </span>
                      <ArrowUpRight size={16} />
                    </button>
                  ))
                ) : (
                  <p role="status">
                    No studies found. Try India, ocean or forest.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        <nav aria-label="Main navigation">
          <button
            className={explorer ? "nav-active" : ""}
            onClick={() => (explorer ? setLibrary(!library) : go(true))}
          >
            Explore
          </button>
          <button onClick={() => setAbout(true)}>About</button>
          {!explorer && (
            <button className="nav-enter" onClick={() => go(true)}>
              Enter Earth <ArrowUpRight size={16} />
            </button>
          )}
        </nav>
      </header>
      {explorer ? (
        <>
          <h1 className="sr-only" id="main-content" ref={heading} tabIndex={-1}>
            Earth Explorer
          </h1>
          <div className={`explorer-globe ${selected ? "has-selection" : ""}`}>
            <Suspense
              fallback={
                <div className="globe-loading">Preparing your planet…</div>
              }
            >
              <Globe
                rotate={rotate && !reduced && !selected}
                selected={regions.find((r) => r.id === selected?.id)}
                onSelect={select}

                onFail={() => setFailed(true)}
              />
            </Suspense>
          </div>
          <div className="explorer-intro">
            <span className="planet-status">
              <span /> EARTH / SOUND ATLAS
            </span>
            <h2>
              {selected
                ? "Follow the signal."
                : "A world waiting\nto be heard."}
            </h2>
            <p>Drag the globe. Choose a place. Listen closer.</p>
          </div>
          <aside className="atlas-controls" aria-label="Explore studies">
            <button
              className="library-trigger"
              aria-expanded={library}
              onClick={() => setLibrary(!library)}
            >
              <Library size={18} /> Sound library <span>11</span>
            </button>
            <div className="place-links">
              {regions.map((r) => (
                <button
                  className="region-card"
                  key={r.id}
                  aria-pressed={selected?.id === r.id}
                  onClick={() => select(r)}
                >
                  <span className="place-dot" />
                  {r.name}
                  <small>Night lights</small>
                  <ArrowUpRight size={15} />
                </button>
              ))}
            </div>
          </aside>
          <div className="orbit-controls">
            <button
              aria-label={
                rotate ? "Pause globe rotation" : "Resume globe rotation"
              }
              onClick={() => setRotate((v) => !v)}
            >
              {rotate ? <Pause size={16} /> : <Play size={16} />} Orbit
            </button>
            <span>Drag to rotate · Scroll or pinch to zoom</span>
          </div>
          {failed && (
            <p className="webgl-fallback" role="status">
              3D view unavailable. All sounds are available in the library and
              regional list.
            </p>
          )}
          <div className="globe-credit">NASA Blue Marble · Context imagery</div>
          {library && (
            <aside className="library-drawer" aria-label="Sound library">
              <button
                className="icon-button library-close"
                aria-label="Close library"
                onClick={() => setLibrary(false)}
              >
                <X />
              </button>
              <ResourceLibrary onSelect={select} />
            </aside>
          )}
          {selected ? (
            <ListeningRoom
              key={selected.id}
              region={selected}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="idle-player">
              <AudioLines size={23} />
              <span>
                The next sound is yours to discover.
                <small>Choose a marker or explore the sound library.</small>
              </span>
              <Headphones size={19} />
            </div>
          )}
        </>
      ) : (
        <>
          <section className="landing-hero" id="main-content">
            <AsciiField paused={reduced || !rotate} />
            <div className="landing-globe">
              <Suspense
                fallback={
                  <div className="globe-loading">Preparing your planet…</div>
                }
              >
                <Globe
                  rotate={rotate && !reduced}
                  presentation
                  onSelect={select}

                  onFail={() => setFailed(true)}
                />
              </Suspense>
            </div>
            <div className="hero-heading">
              <h1 ref={heading} tabIndex={-1}>
                THE PLANET HAS
                <br />A <span>SOUNDTRACK.</span>
              </h1>
            </div>
            <div className="hero-caption">
              <span>
                LOOK CLOSER.
                <br />
                LISTEN DIFFERENTLY.
              </span>
              <p>
                Travel across Earth. Discover its rhythms.
                <br />
                Listen to the planet.
              </p>
            </div>
            <div className="hero-actions">
              <button className="primary" onClick={() => go(true)}>
                ENTER EARTH <ArrowUpRight size={21} />
              </button>
              <a href="#experience">
                DISCOVER THE EXPERIENCE <ArrowDown size={15} />
              </a>
            </div>
            <div className="landing-foot">
              <span>
                <Headphones size={15} /> Best with headphones
              </span>
              <button
                onClick={() => setRotate((v) => !v)}
                aria-label={
                  rotate ? "Pause ambient motion" : "Resume ambient motion"
                }
              >
                {rotate ? <Pause size={14} /> : <Play size={14} />}{" "}
                {rotate ? "Pause motion" : "Resume motion"}
              </button>
              <span>NASA imagery. Original sound.</span>
            </div>
          </section>
          <section id="experience" className="experience">
            <div>
              <h2>
                See the patterns.
                <br />
                <span>Hear the connections.</span>
              </h2>
              <p>
                Light becomes melody. Ocean color shapes a flowing score.
                Atmospheric patterns become layers you can explore, isolate, and
                understand.
              </p>
              <button className="text-button" onClick={() => setAbout(true)}>
                How the translation works <ArrowUpRight size={18} />
              </button>
            </div>
            <div className="experience-image">
              <img
                src={asset("catalog/currents.jpg")}
                alt="NASA visualization of ocean currents and temperature"
                loading="lazy"
              />
              <button onClick={() => select(catalog[0])}>
                <Play size={18} /> Listen to ocean currents
              </button>
            </div>
          </section>
          <section className="experience-notes">
            <div>
              <h3>Your own listening path.</h3>
              <p>
                Explore regional night lights and nine additional NASA visual
                studies, each with distinct musical rules.
              </p>
            </div>
            <div>
              <h3>Every sound has a source.</h3>
              <p>
                Follow the image scan, isolate its voices, and open the original
                NASA resource. These are image interpretations, not recordings
                of Earth.
              </p>
            </div>
            <div>
              <h3>Another way to perceive.</h3>
              <p>
                Switch between NASA imagery and ASCII, explore with a keyboard,
                and read the mapping behind each sound.
              </p>
            </div>
          </section>
          <footer>
            <span>EARTH JUKEBOX · NASA Space Apps project</span>
            <a
              href="https://earthobservatory.nasa.gov/features/BlueMarble/BlueMarble.php"
              target="_blank"
              rel="noreferrer"
            >
              Globe imagery: NASA / Blue Marble Next Generation
            </a>
            <span>Independent project · Not endorsed by NASA</span>
          </footer>
        </>
      )}
      {about && <About onClose={() => setAbout(false)} />}
    </main>
  );
}
