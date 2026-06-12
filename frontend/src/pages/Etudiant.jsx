import { useEffect, useState } from "react";

const RESULT_CONFIG = {
  Distinction: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    bar: "bg-emerald-500",
    dot: "bg-emerald-400",
  },
  Pass: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    bar: "bg-blue-500",
    dot: "bg-blue-400",
  },
  Fail: {
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    bar: "bg-rose-500",
    dot: "bg-rose-400",
  },
  default: {
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    bar: "bg-slate-500",
    dot: "bg-slate-400",
  },
};

const getConfig = (result) => RESULT_CONFIG[result] ?? RESULT_CONFIG.default;

const GENRE_ICON = { M: "♂", F: "♀" };

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl bg-[#1C1F2E] border border-[#2A2D3E] p-5 flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <span className={`text-3xl font-bold tabular-nums ${accent}`}>
        {value}
      </span>
    </div>
  );
}

function EtudiantCard({ e, index }) {
  const cfg = getConfig(e.resultat_final);
  return (
    <div
      className="group relative rounded-2xl bg-[#1C1F2E] border border-[#2A2D3E] overflow-hidden
                 hover:border-[#6C63FF]/50 hover:shadow-lg hover:shadow-[#6C63FF]/10
                 transition-all duration-300"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Colored left bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`} />

      <div className="pl-5 pr-5 py-4 flex items-center gap-4">
        {/* Avatar */}
        <div
          className="shrink-0 w-10 h-10 rounded-full bg-[#6C63FF]/20 border border-[#6C63FF]/30
                        flex items-center justify-center text-[#6C63FF] font-bold text-sm select-none"
        >
          {e.genre ? GENRE_ICON[e.genre] ?? e.genre : "?"}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#E8EAF0] text-sm">
              Étudiant #{e.id_etudiant}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}
            >
              {e.resultat_final ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {e.region ?? "Région inconnue"}
            </span>
            {e.code_module && (
              <span className="font-mono text-[#6C63FF]/80">
                {e.code_module}
              </span>
            )}
            {e.code_session && (
              <span className="text-slate-600">session {e.code_session}</span>
            )}
          </div>
        </div>

        {/* Status dot */}
        <div
          className={`shrink-0 w-2.5 h-2.5 rounded-full ${cfg.dot} opacity-80`}
        />
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-2xl bg-[#1C1F2E] border border-[#2A2D3E] overflow-hidden animate-pulse">
      <div className="pl-5 pr-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#2A2D3E]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-[#2A2D3E] rounded w-32" />
          <div className="h-3 bg-[#2A2D3E] rounded w-20" />
        </div>
      </div>
    </div>
  );
}

function Etudiants() {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterResult, setFilterResult] = useState("Tous");

  useEffect(() => {
    fetch("http://localhost/SAE/backend/api/etudiants.php")
      .then((res) => res.json())
      .then((data) => {
        setEtudiants(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les données.");
        setLoading(false);
      });
  }, []);

  const filtered = etudiants.filter((e) => {
    const matchSearch =
      String(e.id_etudiant).includes(search) ||
      (e.region ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterResult === "Tous" || e.resultat_final === filterResult;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: etudiants.length,
    distinction: etudiants.filter((e) => e.resultat_final === "Distinction")
      .length,
    pass: etudiants.filter((e) => e.resultat_final === "Pass").length,
    fail: etudiants.filter((e) => e.resultat_final === "Fail").length,
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#E8EAF0] font-sans">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 rounded-full bg-[#6C63FF]" />
            <h1 className="text-3xl font-bold tracking-tight">Étudiants</h1>
          </div>
          <p className="text-slate-500 text-sm pl-5">
            Vue d'ensemble des résultats et profils
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total" value={stats.total} accent="text-[#E8EAF0]" />
          <StatCard
            label="Distinction"
            value={stats.distinction}
            accent="text-emerald-400"
          />
          <StatCard label="Pass" value={stats.pass} accent="text-blue-400" />
          <StatCard label="Fail" value={stats.fail} accent="text-rose-400" />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par ID ou région…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1C1F2E] border border-[#2A2D3E] rounded-xl pl-9 pr-4 py-2.5
                         text-sm text-[#E8EAF0] placeholder-slate-600
                         focus:outline-none focus:border-[#6C63FF]/60 focus:ring-1 focus:ring-[#6C63FF]/30
                         transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Tous", "Distinction", "Pass", "Fail"].map((r) => (
              <button
                key={r}
                onClick={() => setFilterResult(r)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200
                  ${
                    filterResult === r
                      ? "bg-[#6C63FF] border-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/25"
                      : "bg-[#1C1F2E] border-[#2A2D3E] text-slate-400 hover:border-[#6C63FF]/40 hover:text-[#E8EAF0]"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {!loading && !error && (
          <p className="text-xs text-slate-600 mb-4 tabular-nums">
            {filtered.length} étudiant{filtered.length !== 1 ? "s" : ""} affiché
            {filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* List */}
        <div className="space-y-2">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}

          {error && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-center">
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl bg-[#1C1F2E] border border-[#2A2D3E] p-10 text-center">
              <p className="text-slate-500 text-sm">Aucun résultat trouvé.</p>
            </div>
          )}

          {!loading &&
            !error &&
            filtered.map((e, i) => (
              <EtudiantCard
                key={`${e.code_module}-${e.code_session}-${e.id_etudiant}`}
                e={e}
                index={i}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Etudiants;