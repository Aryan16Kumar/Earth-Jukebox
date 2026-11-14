import { useState } from "react";
import { ArrowUpRight, Play, Search } from "lucide-react";
import { catalog } from "./catalog";
import { asset, type Scene } from "./scenes";
export default function ResourceLibrary({
  onSelect,
}: {
  onSelect: (scene: Scene) => void;
}) {
  const [filter, setFilter] = useState("All"),
    [query, setQuery] = useState("");
  const visible = catalog.filter(
    (s) =>
      (filter === "All" || s.category === filter) &&
      `${s.name} ${s.subtitle} ${s.story}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section
      id="library"
      className="resource-library"
      aria-labelledby="library-title"
    >
      <div className="section-heading">
        <div>
          <h2 id="library-title">More worlds to hear.</h2>
          <p>
            Oceans, atmosphere, forests—and a lesson from the stars.
            <br />
            Each resource has its own image-driven musical rules.
          </p>
        </div>
        <a
          className="source-directory"
          href="https://svs.gsfc.nasa.gov/gallery/earth-information-center/"
          target="_blank"
          rel="noreferrer"
        >
          Explore the EIC content database <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="library-tools">
        <div className="library-filters" aria-label="Filter NASA resources">
          {["All", "Ocean", "Atmosphere", "Land", "Space lesson"].map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="library-search">
          <Search size={16} />
          <input
            type="search"
            aria-label="Search NASA resources"
            placeholder="Find a sound story"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="resource-list">
        {visible.map((s) => (
          <button
            className="resource-row"
            key={s.id}
            aria-label={`Listen to ${s.name}`}
            onClick={() => onSelect(s)}
          >
            <img src={asset(s.image)} loading="lazy" alt="" />
            <div className="resource-text">
              <span>
                {s.category} ·{" "}
                {s.profile === "stars"
                  ? "Teaching example"
                  : "Still-image study"}
              </span>
              <h3>{s.name}</h3>
              <p>{s.subtitle}</p>
            </div>
            <span className="resource-period">{s.period}</span>
            <span className="resource-play">
              <Play size={18} />
            </span>
          </button>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="library-empty" role="status">
          No stories match. Try another term or choose All.
        </p>
      )}
      <p className="library-note">
        All studies generate original sound from bundled NASA imagery. Scan
        position represents image space, not elapsed observation time. The EIC
        database supplies the content directory; Caldwell 73 is an astronomy
        teaching reference, not an Earth dataset.
      </p>
    </section>
  );
}
