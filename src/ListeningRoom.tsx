import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { AudioLines, Pause, Play, Plus, Volume2, X } from "lucide-react";
import * as Tone from "tone";
import { AudioEngine } from "./audio";
import { analyzeBand, type Feature } from "./analysis";
import { asset, type Region, type Scene } from "./scenes";
import { info } from "./catalog";
import { analyzeScene } from "./catalogAnalysis";
import {
  calibrate,
  defaultCalibration,
  soundDesigns,
  soundParameters,
  type Calibration,
} from "./soundDesign";
import Waveform from "./Waveform";
const DURATION = 24;
const empty: Feature = { brightness: 0, vertical: 0.5, horizontal: 0.5 };
export default function ListeningRoom({
  region,
  onClose,
}: {
  region: Scene;
  onClose: () => void;
}) {
  const temporal = region.id === "india" || region.id === "ukraine";
  const [year, setYear] = useState(2012);
  const comparison = useRef<HTMLImageElement[]>([]);
  const baseDetails = info(region);
  const details = temporal
    ? {
        ...baseDetails,
        period: `${year} / annual average`,
        limitation:
          "Two annual-average rendered snapshots from the EIC sequence, using identical regional windows. Scan time is spatial. Rendered brightness is not calibrated radiance and cannot establish the cause of a change.",
      }
    : baseDetails;
  const [expanded, setExpanded] = useState(false);
  const calibration = useRef<Calibration>(defaultCalibration);
  const panel = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    engine = useRef<AudioEngine | null>(null),
    image = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [playing, setPlaying] = useState(false),
    [progress, setProgress] = useState(0),
    [enabled, setEnabled] = useState([true, true, true]),
    [volume, setVolume] = useState(0.65),
    [features, setFeatures] = useState<Feature[]>([empty, empty, empty]);
  const pos = useRef(0),
    mask = useRef(enabled),
    lastNote = useRef(-1),
    start = useRef(0);
  useEffect(() => {
    mask.current = enabled;
    engine.current?.setEnabled(enabled);
  }, [enabled]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    panel.current?.focus({ preventScroll: true });
    return () => {
      if (previous?.isConnected) previous.focus({ preventScroll: true });
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    const paths = temporal
      ? [region.image, `${region.id}-2023.jpg`]
      : [region.image];
    Promise.all(
      paths.map(
        (path) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = asset(path);
          }),
      ),
    )
      .then((images) => {
        if (cancelled) return;
        comparison.current = images;
        image.current = images[0];
        setReady(true);
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "NASA comparison could not load. Close this study and try again.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [region]);
  function draw(p: number, publish = true, source = image.current) {
    const c = canvas.current,
      im = source;
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
    if (!publish) return f;
    setFeatures(f);
    return f;
  }
  useEffect(() => {
    if (ready) {
      calibration.current = calibrate(
        comparison.current.flatMap((im) =>
          Array.from({ length: 48 }, (_, i) => draw(i / 48, false, im)!),
        ),
      );
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
      const step = Math.floor(
        (p * DURATION) / soundDesigns[details.profile].step,
      );
      if (step !== lastNote.current) {
        lastNote.current = step;
        const f = draw(p);
        if (f) engine.current?.play(f, mask.current, step);
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
      if (!engine.current)
        engine.current = new AudioEngine(details.profile, calibration.current);
      await engine.current.start();
      engine.current.volume(volume);
      engine.current.resume();
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
    if (playing) engine.current?.resume();
    pos.current = p;
    setProgress(p);
    start.current = Tone.now() - p * DURATION;
    lastNote.current = -1;
    draw(p);
  }
  function chooseYear(next: number) {
    if (!ready || next === year) return;
    engine.current?.stop();
    image.current = comparison.current[next === 2012 ? 0 : 1];
    setYear(next);
    lastNote.current = -1;
    draw(pos.current);
    if (playing) engine.current?.resume();
  }
  return (
    <>
      <section
        ref={panel}
        tabIndex={-1}
        className={`listening-room ${expanded ? "expanded" : ""}`}
        aria-labelledby="scene-title"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
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
          {"lat" in region && (
            <p className="coordinates">
              {(region as Region).lat}° N / {(region as Region).lon}° E ·
              Regional window
            </p>
          )}
          <button
            className="sheet-toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse details" : "Expand details"}
          </button>
          {temporal && (
            <div
              className="year-comparison"
              aria-label="Compare annual night lights"
            >
              <strong>Hear a decade of change</strong>
              <div className="year-buttons">
                {[2012, 2023].map((y) => (
                  <button
                    key={y}
                    disabled={!ready}
                    aria-pressed={year === y}
                    onClick={() => chooseYear(y)}
                  >
                    {y}
                  </button>
                ))}
              </div>
              <p role="status">
                {year} annual average / Same place, same audio scale.
              </p>
              <small>
                Switch years while listening. The 24-second scan moves across
                the image, not through years.
              </small>
            </div>
          )}
          <div className="scene-tabs">
            <span className="visual-label">NASA visual</span>
            <span>{details.period}</span>
          </div>
          <div className="scene-image">
            <canvas
              ref={canvas}
              aria-label={`NASA source image: ${region.name}. Analysis uses the displayed crop.`}
            />
            {details.profile === "stars" ? (
              <div
                className="scan-ray"
                style={{ transform: `rotate(${progress * 360 - 90}deg)` }}
              />
            ) : (
              <div
                className="scan-line"
                style={{ left: `${progress * 100}%` }}
              />
            )}
            <div className="image-caption">
              {ready
                ? details.profile === "stars"
                  ? "CLOCKWISE / RADIAL IMAGE SCAN"
                  : "LEFT TO RIGHT / IMAGE SCAN"
                : "LOADING NASA FRAME"}
            </div>
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
                onDoubleClick={() =>
                  setEnabled((v) => v.map((_, j) => i === j))
                }
              >
                <span className="layer-number">0{i + 1}</span>
                <span>
                  {name}
                  <small>
                    {
                      soundParameters(
                        features[i],
                        details.profile,
                        i,
                        calibration.current[i],
                      ).midi
                    }{" "}
                    MIDI · {Math.round(features[i].brightness * 100)}% visual
                    signal
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
              <strong>{soundDesigns[details.profile].name}.</strong>{" "}
              {soundDesigns[details.profile].description} Pitch, filter opening,
              note strength, and phrase density respond to the image. Intensity
              is scaled to a fixed reference computed once from{" "}
              {temporal ? "both annual snapshots together" : "this scene"};
              loudness comparisons across different scenes are not physical
              comparisons.
            </p>
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
      </section>
      {createPortal(
        <div className="transport" aria-label="Audio player">
          <div className="now-playing">
            <AudioLines size={20} />
            <span>
              {region.name}
              <small>
                {region.category ?? "Night lights"} /{" "}
                {temporal ? year : "image sonification"}
              </small>
            </span>
          </div>
          <Waveform engine={engine} playing={playing} />
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
              {playing ? "Scanning the image" : "Explore the signal"}
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
        </div>,
        document.body,
      )}
    </>
  );
}
