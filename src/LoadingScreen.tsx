import { Globe2, ArrowUpRight } from "lucide-react";
export default function LoadingScreen({
  onContinue,
}: {
  onContinue: () => void;
}) {
  return (
    <div className="earth-loading-screen" data-testid="earth-loading-screen">
      <div className="loading-brand">
        <Globe2 size={24} />
        <span>EARTH JUKEBOX</span>
      </div>
      <div className="loading-center">
        <div className="loading-orbit" aria-hidden="true">
          <div className="loading-meridian" />
          <div className="loading-equator" />
          <span className="loading-satellite" />
        </div>
        <h2>
          A world worth
          <br />
          <span>waiting for.</span>
        </h2>
        <p role="status">
          Preparing your planet
          <span className="loading-dots" aria-hidden="true">
            ...
          </span>
        </p>
        <div className="loading-signal" aria-hidden="true">
          {Array.from({ length: 23 }, (_, i) => (
            <i
              key={i}
              style={{
                height: `${8 + Math.sin(i * 0.7) ** 2 * 20}px`,
                animationDelay: `${i * 45}ms`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="loading-bottom">
        <span>NASA imagery. A new way to listen.</span>
        <button onClick={onContinue}>
          Continue to the experience <ArrowUpRight size={15} />
        </button>
      </div>
    </div>
  );
}
