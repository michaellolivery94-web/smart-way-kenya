import { useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2, MapPin, AlertTriangle,
  Shield, Zap, Users, TrendingUp, Target, Layers, Cpu, DollarSign,
  Rocket, Network, Map as MapIcon, BarChart3, AlertOctagon, Building2,
  Truck, Car, Bus, Siren, Briefcase, Globe2, CheckCircle2, XCircle,
  Brain, Database, Radio, Eye, Clock, Fuel, Gauge, ArrowRight,
  Sparkles, Activity, LineChart, PieChart, Award, Flag,
  Play, Pause, RotateCcw, SkipForward, SkipBack,
} from "lucide-react";

/* =========================================================
   Smart-Way Investor Pitch Deck
   Dark navy + orange · 18 slides · 1920x1080 scaled
   ========================================================= */

const NAVY = "#0A1628";
const NAVY_2 = "#0F1E36";
const NAVY_3 = "#152A47";
const ORANGE = "#FF7A1A";
const ORANGE_SOFT = "rgba(255,122,26,0.12)";
const INK = "#E8EEF7";
const MUTED = "#8FA3BF";

/* ----- Scaled slide wrapper ----- */
function ScaledSlide({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      setScale(s);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: NAVY, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", width: 1920, height: 1080,
          left: "50%", top: "50%", marginLeft: -960, marginTop: -540,
          transform: `scale(${scale})`, transformOrigin: "center center",
          background: NAVY, color: INK,
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ----- Shared bits ----- */
const Kicker = ({ children }: { children: ReactNode }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 10,
    padding: "10px 18px", borderRadius: 999,
    background: ORANGE_SOFT, color: ORANGE,
    fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
  }}>{children}</div>
);

const SlideHeader = ({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle?: string }) => (
  <div style={{ padding: "70px 110px 30px" }}>
    {kicker && <Kicker>{kicker}</Kicker>}
    <h1 style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "20px 0 0" }}>
      {title}
    </h1>
    {subtitle && (
      <p style={{ fontSize: 28, color: MUTED, lineHeight: 1.35, margin: "18px 0 0", maxWidth: 1500 }}>
        {subtitle}
      </p>
    )}
  </div>
);

const SlideFooter = ({ n, total }: { n: number; total: number }) => (
  <div style={{
    position: "absolute", bottom: 36, left: 110, right: 110,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 18, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: ORANGE, display: "grid", placeItems: "center" }}>
        <MapPin size={16} color={NAVY} />
      </div>
      <span style={{ color: INK }}>SMART-WAY</span>
      <span style={{ color: MUTED }}>· Pre-Seed 2026</span>
    </div>
    <div>{String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
  </div>
);

const Card = ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: NAVY_2, border: `1px solid ${NAVY_3}`, borderRadius: 24,
    padding: 36, ...style,
  }}>{children}</div>
);

const Stat = ({ value, label, accent = ORANGE }: { value: string; label: string; accent?: string }) => (
  <Card>
    <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, color: accent, letterSpacing: "-0.04em" }}>{value}</div>
    <div style={{ fontSize: 22, color: MUTED, marginTop: 14, lineHeight: 1.35 }}>{label}</div>
  </Card>
);

/* =========================================================
   SLIDES
   ========================================================= */

/* 1 — Cover */
const S1 = () => (
  <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <div style={{
      position: "absolute", inset: 0,
      background: `radial-gradient(circle at 75% 30%, rgba(255,122,26,0.18), transparent 55%),
                   radial-gradient(circle at 15% 80%, rgba(20,80,160,0.25), transparent 60%)`,
    }} />
    <div style={{ position: "relative", padding: "140px 110px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: ORANGE, display: "grid", placeItems: "center" }}>
          <MapPin size={36} color={NAVY} />
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>SMART-WAY</div>
      </div>
      <div>
        <Kicker><Sparkles size={16} /> Pre-Seed · $500K</Kicker>
        <h1 style={{ fontSize: 124, fontWeight: 800, lineHeight: 0.98, letterSpacing: "-0.04em", margin: "28px 0 36px", maxWidth: 1600 }}>
          The Real-Time Road<br />
          Intelligence Platform<br />
          for <span style={{ color: ORANGE }}>African Cities</span>.
        </h1>
        <p style={{ fontSize: 30, color: MUTED, lineHeight: 1.4, maxWidth: 1300 }}>
          Helping drivers, fleets and logistics companies save time, fuel and money
          through verified, community-powered road intelligence.
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 18, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        <span>Nairobi · Kenya</span>
        <span>Investor Deck · Confidential</span>
      </div>
    </div>
  </div>
);

/* 2 — Problem */
const S2 = () => (
  <div>
    <SlideHeader kicker="The Problem" title="African cities run on roads that maps don't understand."
      subtitle="Every day, millions of drivers lose hours, fuel and money to disruptions that no global navigation app can see in time." />
    <div style={{ padding: "30px 110px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
      <Stat value="2+ hrs" label="Lost daily to traffic by the average Nairobi commuter" />
      <Stat value="20–30%" label="Of fuel wasted in stop-and-go congestion" />
      <Stat value="< 11%" label="Of African road disruptions captured by global navigation apps" />
    </div>
    <div style={{ padding: "30px 110px" }}>
      <Card style={{ background: ORANGE_SOFT, borderColor: "rgba(255,122,26,0.35)" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <AlertTriangle size={48} color={ORANGE} style={{ flexShrink: 0, marginTop: 4 }} />
          <div>
            <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3 }}>
              Google Maps was built for mapped, structured roads.
            </div>
            <div style={{ fontSize: 24, color: MUTED, marginTop: 12, lineHeight: 1.4 }}>
              Africa runs on informal road closures, flooding, matatu diversions, protests,
              police checkpoints and unpaved estate roads that change faster than any global dataset can update.
            </div>
          </div>
        </div>
      </Card>
    </div>
    <SlideFooter n={2} total={18} />
  </div>
);

/* 3 — Why existing apps fail */
const S3 = () => {
  const rows = [
    ["Hyperlocal estate roads", false, false, true],
    ["Real-time local reports", "partial", "partial", true],
    ["Matatu / boda disruptions", false, false, true],
    ["Flood & weather alerts", false, false, true],
    ["Police checkpoints", false, true, true],
    ["Community verification", false, "partial", true],
    ["African data density", false, false, true],
    ["Fleet & logistics analytics", false, false, true],
  ];
  const cell = (v: any) => v === true
    ? <CheckCircle2 size={32} color={ORANGE} />
    : v === "partial"
      ? <div style={{ width: 28, height: 4, background: MUTED, borderRadius: 2 }} />
      : <XCircle size={32} color="#3A4A66" />;
  return (
    <div>
      <SlideHeader kicker="Why Existing Apps Fail" title="Why can't Google just do this?"
        subtitle="Because the data they need doesn't exist — and the community to generate it isn't theirs to activate." />
      <div style={{ padding: "20px 110px" }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr", padding: "26px 36px", borderBottom: `1px solid ${NAVY_3}`, fontSize: 22, color: MUTED, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <div>Capability</div>
            <div style={{ textAlign: "center" }}>Google Maps</div>
            <div style={{ textAlign: "center" }}>Waze</div>
            <div style={{ textAlign: "center", color: ORANGE }}>Smart-Way</div>
          </div>
          {rows.map(([label, g, w, s], i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr",
              padding: "20px 36px", borderBottom: i < rows.length - 1 ? `1px solid ${NAVY_3}` : "none",
              alignItems: "center", fontSize: 24,
              background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
            }}>
              <div style={{ fontWeight: 600 }}>{label as string}</div>
              <div style={{ textAlign: "center", display: "flex", justifyContent: "center" }}>{cell(g)}</div>
              <div style={{ textAlign: "center", display: "flex", justifyContent: "center" }}>{cell(w)}</div>
              <div style={{ textAlign: "center", display: "flex", justifyContent: "center" }}>{cell(s)}</div>
            </div>
          ))}
        </Card>
      </div>
      <SlideFooter n={3} total={18} />
    </div>
  );
};

/* 4 — Solution */
const S4 = () => {
  const layers = [
    { icon: MapIcon, label: "Existing Base Maps (OSM, Google, HERE)", color: MUTED },
    { icon: Layers, label: "Smart-Way Intelligence Layer", color: ORANGE },
    { icon: Users, label: "Verified Local Community Reports", color: INK },
    { icon: Brain, label: "AI Ranking & Confidence Scoring", color: INK },
    { icon: Radio, label: "Driver Alerts & Smart Rerouting", color: INK },
  ];
  return (
    <div>
      <SlideHeader kicker="Our Solution" title="A mobility intelligence layer — not another map."
        subtitle="Smart-Way sits on top of existing mapping infrastructure and adds the verified local intelligence Africa is missing." />
      <div style={{ padding: "30px 110px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 50, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {layers.map((l, i) => (
            <div key={i}>
              <div style={{
                display: "flex", alignItems: "center", gap: 22, padding: "22px 28px",
                background: i === 1 ? ORANGE_SOFT : NAVY_2,
                border: `1px solid ${i === 1 ? "rgba(255,122,26,0.4)" : NAVY_3}`,
                borderRadius: 18,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: i === 1 ? ORANGE : NAVY_3,
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>
                  <l.icon size={28} color={i === 1 ? NAVY : ORANGE} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 600, color: i === 1 ? ORANGE : INK }}>{l.label}</div>
              </div>
              {i < layers.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
                  <ArrowRight size={22} color={MUTED} style={{ transform: "rotate(90deg)" }} />
                </div>
              )}
            </div>
          ))}
        </div>
        <Card style={{ background: NAVY_2 }}>
          <Kicker>The Wedge</Kicker>
          <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.25, margin: "20px 0 18px" }}>
            We don't compete with maps. We make them <span style={{ color: ORANGE }}>finally work in Africa</span>.
          </div>
          <div style={{ fontSize: 22, color: MUTED, lineHeight: 1.5 }}>
            By focusing exclusively on hyperlocal, verified, real-time disruption data,
            Smart-Way becomes the intelligence layer every navigation, fleet and logistics
            platform on the continent will need.
          </div>
        </Card>
      </div>
      <SlideFooter n={4} total={18} />
    </div>
  );
};

/* 5 — User Journey */
const S5 = () => {
  const steps = [
    { icon: AlertOctagon, t: "Driver spots flooding" },
    { icon: Radio, t: "Reports in one tap" },
    { icon: MapPin, t: "GPS + time captured" },
    { icon: Users, t: "Nearby drivers verify" },
    { icon: Brain, t: "AI confidence score" },
    { icon: CheckCircle2, t: "Report approved" },
    { icon: Zap, t: "Area alerted instantly" },
    { icon: ArrowRight, t: "Reroute suggested" },
    { icon: Award, t: "Drivers rate usefulness" },
  ];
  return (
    <div>
      <SlideHeader kicker="Product · User Journey" title="From a single report to thousands of better trips."
        subtitle="One driver's 3-second tap becomes verified intelligence for an entire city in under 60 seconds." />
      <div style={{ padding: "30px 110px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: NAVY_2, border: `1px solid ${NAVY_3}`, borderRadius: 20,
              padding: 28, display: "flex", alignItems: "center", gap: 22,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: ORANGE_SOFT,
                display: "grid", placeItems: "center", flexShrink: 0,
                color: ORANGE, fontWeight: 800, fontSize: 22,
              }}>{i + 1}</div>
              <div>
                <s.icon size={26} color={ORANGE} />
                <div style={{ fontSize: 22, fontWeight: 600, marginTop: 8 }}>{s.t}</div>
              </div>
            </div>
          ))}
        </div>
        <Card style={{ marginTop: 28, background: ORANGE_SOFT, borderColor: "rgba(255,122,26,0.35)" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Clock size={40} color={ORANGE} />
            <div style={{ fontSize: 26, fontWeight: 600 }}>
              Average end-to-end alert time: <span style={{ color: ORANGE, fontWeight: 800 }}>under 60 seconds</span> from report to citywide notification.
            </div>
          </div>
        </Card>
      </div>
      <SlideFooter n={5} total={18} />
    </div>
  );
};

/* 6 — Verification Engine */
const S6 = () => {
  const layers = [
    { icon: MapPin, t: "GPS validation", d: "Reports geo-fenced to plausible road segments" },
    { icon: Clock, t: "Time decay", d: "Confidence drops as reports age" },
    { icon: Users, t: "Multi-user confirmation", d: "N independent drivers must confirm" },
    { icon: Brain, t: "AI confidence scoring", d: "ML model weights every signal" },
    { icon: Award, t: "Reputation score", d: "Trusted reporters carry more weight" },
    { icon: Activity, t: "Duplicate detection", d: "Cluster nearby reports into one incident" },
    { icon: Truck, t: "Fleet verification", d: "Verified fleet drivers as trust anchors" },
    { icon: Shield, t: "Moderator escalation", d: "Edge cases reviewed by ops team" },
  ];
  return (
    <div>
      <SlideHeader kicker="Trust Engine" title="The reason fake reports don't break Smart-Way."
        subtitle="An 8-layer verification stack — purpose-built for noisy, high-volume, community-generated road data." />
      <div style={{ padding: "20px 110px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {layers.map((l, i) => (
            <div key={i} style={{
              background: NAVY_2, border: `1px solid ${NAVY_3}`, borderRadius: 18, padding: 26,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 12, right: 16, fontSize: 14, fontWeight: 800, color: ORANGE, letterSpacing: "0.1em" }}>L{i + 1}</div>
              <l.icon size={32} color={ORANGE} />
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 14 }}>{l.t}</div>
              <div style={{ fontSize: 17, color: MUTED, marginTop: 8, lineHeight: 1.4 }}>{l.d}</div>
            </div>
          ))}
        </div>
        <Card style={{ marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Shield size={40} color={ORANGE} />
            <div style={{ fontSize: 24, color: INK, lineHeight: 1.4 }}>
              Every report passes through all 8 layers before a single driver is alerted.
              <span style={{ color: MUTED }}> Result: a verified-report rate above 90% in pilot conditions.</span>
            </div>
          </div>
        </Card>
      </div>
      <SlideFooter n={6} total={18} />
    </div>
  );
};

/* 7 — Market */
const S7 = () => (
  <div>
    <SlideHeader kicker="Market Opportunity" title="A mobility market the world's mapping giants don't serve."
      subtitle="Africa's urban population will hit 1.5B by 2050. The continent's mobility, logistics and ride-hailing markets are growing 2–3× faster than global averages." />
    <div style={{ padding: "30px 110px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {[
          { l: "TAM", v: "$48B", d: "African mobility, logistics & navigation services by 2030", w: "100%", c: ORANGE },
          { l: "SAM", v: "$6.2B", d: "East & West Africa fleet + ride-hailing + delivery", w: "55%", c: "#FFA864" },
          { l: "SOM", v: "$180M", d: "Kenya commercial drivers, fleets & API customers (5-yr)", w: "22%", c: INK },
        ].map((m, i) => (
          <Card key={i} style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: ORANGE, letterSpacing: "0.15em" }}>{m.l}</div>
              <div style={{ fontSize: 56, fontWeight: 800, color: m.c, letterSpacing: "-0.03em" }}>{m.v}</div>
            </div>
            <div style={{ fontSize: 20, color: MUTED, marginBottom: 14 }}>{m.d}</div>
            <div style={{ height: 8, background: NAVY_3, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: m.w, background: m.c }} />
            </div>
          </Card>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Card>
          <Kicker>Growth Drivers</Kicker>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14, fontSize: 22, lineHeight: 1.5 }}>
            {[
              ["1.2M+", "ride-hailing drivers across East Africa"],
              ["350K+", "registered commercial fleets in Kenya alone"],
              ["18%", "annual growth in African last-mile delivery"],
              ["$2.1B", "annual fuel waste from urban congestion (Kenya)"],
            ].map(([n, t], i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: ORANGE, minWidth: 130 }}>{n}</div>
                <div style={{ color: MUTED }}>{t}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 14, color: MUTED, marginTop: 18, fontStyle: "italic" }}>
            Projected Metrics — sources: World Bank, KNBS, GSMA Mobility 2024.
          </div>
        </Card>
      </div>
    </div>
    <SlideFooter n={7} total={18} />
  </div>
);

/* 8 — Target Users */
const S8 = () => {
  const segs = [
    { icon: Car, t: "Ride-Hailing", who: "Bolt, Uber, Little drivers", v: "Save 15+ mins/trip · more trips/day" },
    { icon: Truck, t: "Delivery Riders", who: "Glovo, Jumia, Sendy, Bolt Food", v: "Hit SLA windows · reduce failed deliveries" },
    { icon: Briefcase, t: "Logistics Fleets", who: "DHL, regional 3PLs, distributors", v: "Cut fuel 12%+ · optimize routing" },
    { icon: Building2, t: "Corporate Transport", who: "Staff shuttles, enterprise pools", v: "Predictable arrivals · safer routes" },
    { icon: Bus, t: "School Buses & Matatus", who: "Saccos, schools, transport co-ops", v: "Parent visibility · disruption alerts" },
    { icon: Siren, t: "Emergency Services", who: "Ambulance, fire, security response", v: "Fastest live-traffic routing" },
  ];
  return (
    <div>
      <SlideHeader kicker="Target Users" title="One platform, six high-value mobility segments."
        subtitle="Each segment has measurable, monetizable pain that Smart-Way solves from day one." />
      <div style={{ padding: "20px 110px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {segs.map((s, i) => (
          <Card key={i}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: ORANGE_SOFT, display: "grid", placeItems: "center" }}>
              <s.icon size={32} color={ORANGE} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 18 }}>{s.t}</div>
            <div style={{ fontSize: 18, color: MUTED, marginTop: 6 }}>{s.who}</div>
            <div style={{ height: 1, background: NAVY_3, margin: "16px 0" }} />
            <div style={{ fontSize: 19, color: INK, lineHeight: 1.5 }}>{s.v}</div>
          </Card>
        ))}
      </div>
      <SlideFooter n={8} total={18} />
    </div>
  );
};

/* 9 — Competitive Matrix */
const S9 = () => {
  const rows = [
    "Hyperlocal road coverage", "Estate / unmapped roads", "Verified community reports",
    "African-localized data", "Real-time disruptions", "Fleet analytics dashboard",
    "API / data licensing", "Road condition intelligence",
  ];
  const scores = [
    [2, 1, 5], [1, 0, 5], [1, 3, 5], [2, 1, 5],
    [3, 3, 5], [0, 0, 5], [2, 0, 5], [1, 1, 5],
  ];
  const Dot = ({ n, win }: { n: number; win?: boolean }) => (
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          width: 16, height: 16, borderRadius: 4,
          background: i <= n ? (win ? ORANGE : MUTED) : NAVY_3,
        }} />
      ))}
    </div>
  );
  return (
    <div>
      <SlideHeader kicker="Competitive Advantage" title="Where Smart-Way wins, the giants can't follow."
        subtitle="Global players optimize for scale. We optimize for the African road — the moat is data density and community trust." />
      <div style={{ padding: "20px 110px" }}>
        <Card style={{ padding: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr", padding: "26px 36px", borderBottom: `1px solid ${NAVY_3}`, fontSize: 20, fontWeight: 700, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <div>Category</div>
            <div style={{ textAlign: "center" }}>Google Maps</div>
            <div style={{ textAlign: "center" }}>Waze</div>
            <div style={{ textAlign: "center", color: ORANGE }}>Smart-Way</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr",
              padding: "18px 36px", borderBottom: i < rows.length - 1 ? `1px solid ${NAVY_3}` : "none",
              alignItems: "center", fontSize: 22,
            }}>
              <div style={{ fontWeight: 600 }}>{r}</div>
              <div><Dot n={scores[i][0]} /></div>
              <div><Dot n={scores[i][1]} /></div>
              <div><Dot n={scores[i][2]} win /></div>
            </div>
          ))}
        </Card>
      </div>
      <SlideFooter n={9} total={18} />
    </div>
  );
};

/* 10 — Traction */
const S10 = () => (
  <div>
    <SlideHeader kicker="MVP · Pilot Targets" title="Early signals from Nairobi pilot cohort."
      subtitle="Illustrative pilot targets shaping our first 90 days of live deployment." />
    <div style={{ padding: "20px 110px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
      <Stat value="500" label="Pilot drivers onboarded" />
      <Stat value="6,800+" label="Road reports submitted" />
      <Stat value="91%" label="Verified report rate" />
      <Stat value="18%" label="Average delay reduction" />
      <Stat value="12%" label="Average fuel savings" />
      <Stat value="71%" label="Monthly retention" />
      <Stat value="310" label="Daily active drivers" />
      <Stat value="4.7 / 5" label="Pilot user satisfaction" />
    </div>
    <div style={{ padding: "20px 110px" }}>
      <div style={{ fontSize: 16, color: MUTED, fontStyle: "italic" }}>
        * Illustrative Pilot Targets — figures represent projected milestones for the Nairobi launch cohort, not historical claims.
      </div>
    </div>
    <SlideFooter n={10} total={18} />
  </div>
);

/* 11 — Business Model */
const S11 = () => (
  <div>
    <SlideHeader kicker="Business Model" title="Two recurring revenue engines. Both B2B. Both high-margin."
      subtitle="We monetize value to fleets first, then unlock data licensing as the network thickens." />
    <div style={{ padding: "20px 110px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: ORANGE, display: "grid", placeItems: "center" }}>
            <Truck size={30} color={NAVY} />
          </div>
          <div>
            <div style={{ fontSize: 18, color: ORANGE, fontWeight: 800, letterSpacing: "0.15em" }}>REVENUE #1</div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>Fleet SaaS Subscription</div>
          </div>
        </div>
        <div style={{ fontSize: 20, color: MUTED, marginTop: 18, lineHeight: 1.5 }}>
          Monthly per-vehicle SaaS: live dashboard, driver monitoring,
          disruption alerts, route optimization & analytics.
        </div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["Starter", "≤ 10 vehicles", "$15 / vehicle / mo"],
            ["Growth", "11–100 vehicles", "$12 / vehicle / mo"],
            ["Enterprise", "100+ vehicles", "Custom + SLA"],
          ].map(([t, s, p], i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 22px", background: NAVY_3, borderRadius: 14,
            }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{t}</div>
                <div style={{ fontSize: 16, color: MUTED }}>{s}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: ORANGE }}>{p}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: ORANGE, display: "grid", placeItems: "center" }}>
            <Database size={30} color={NAVY} />
          </div>
          <div>
            <div style={{ fontSize: 18, color: ORANGE, fontWeight: 800, letterSpacing: "0.15em" }}>REVENUE #2</div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>API · Data-as-a-Service</div>
          </div>
        </div>
        <div style={{ fontSize: 20, color: MUTED, marginTop: 18, lineHeight: 1.5 }}>
          Anonymized, verified road intelligence licensed to navigation apps,
          insurers, logistics platforms, urban planners and government agencies.
        </div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["Developer", "Per-request tiers", "$0.002 / call"],
            ["Enterprise API", "Volume contracts", "From $2.5K / mo"],
            ["Gov & Infrastructure", "Annual licensing", "$50K–$250K / yr"],
          ].map(([t, s, p], i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 22px", background: NAVY_3, borderRadius: 14,
            }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{t}</div>
                <div style={{ fontSize: 16, color: MUTED }}>{s}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: ORANGE }}>{p}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    <SlideFooter n={11} total={18} />
  </div>
);

/* 12 — GTM */
const S12 = () => {
  const phases = [
    { p: "01", t: "Nairobi Launch", d: "Ride-hailing & delivery driver community, free consumer app", color: ORANGE },
    { p: "02", t: "Fleet Monetization", d: "Logistics, corporate transport, courier SaaS subscriptions", color: ORANGE },
    { p: "03", t: "Kenya Expansion", d: "Mombasa, Kisumu, Nakuru, Eldoret", color: INK },
    { p: "04", t: "East Africa", d: "Uganda, Tanzania, Rwanda", color: INK },
    { p: "05", t: "Pan-African", d: "Nigeria, Ghana, Ethiopia, South Africa", color: INK },
  ];
  return (
    <div>
      <SlideHeader kicker="Go-To-Market" title="A phased, capital-efficient expansion playbook."
        subtitle="Each phase compounds the data moat before unlocking the next geography." />
      <div style={{ padding: "30px 110px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
          {phases.map((p, i) => (
            <div key={i} style={{
              background: NAVY_2, border: `1px solid ${i < 2 ? "rgba(255,122,26,0.4)" : NAVY_3}`,
              borderRadius: 20, padding: 26, position: "relative",
            }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: p.color, letterSpacing: "-0.02em" }}>{p.p}</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 10 }}>{p.t}</div>
              <div style={{ fontSize: 17, color: MUTED, marginTop: 10, lineHeight: 1.45 }}>{p.d}</div>
            </div>
          ))}
        </div>
        <Card style={{ marginTop: 30 }}>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Flag size={40} color={ORANGE} />
            <div style={{ fontSize: 22, color: INK, lineHeight: 1.5 }}>
              <strong>Beachhead:</strong> Win Nairobi's ride-hailing community → onboard 25 fleets → license API to 3 mobility platforms by Month 18.
            </div>
          </div>
        </Card>
      </div>
      <SlideFooter n={12} total={18} />
    </div>
  );
};

/* 13 — Scalability Flywheel */
const S13 = () => {
  const ring = [
    "More drivers", "More verified reports", "Better routing intelligence",
    "Better user experience", "More fleets adopt", "More API-grade data",
    "Higher recurring revenue", "Stronger network effects",
  ];
  return (
    <div>
      <SlideHeader kicker="Scalability" title="A flywheel that gets stronger with every report."
        subtitle="Smart-Way doesn't scale by hiring city teams. It scales by data density — every driver makes the product better for every other driver." />
      <div style={{ padding: "30px 110px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 50, alignItems: "center" }}>
        <div style={{ position: "relative", width: 620, height: 620, margin: "0 auto" }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: `2px dashed ${NAVY_3}`,
          }} />
          <div style={{
            position: "absolute", inset: 180, borderRadius: "50%",
            background: ORANGE_SOFT, display: "grid", placeItems: "center",
            border: `2px solid ${ORANGE}`,
          }}>
            <div style={{ textAlign: "center" }}>
              <Network size={56} color={ORANGE} />
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 10 }}>The<br />Smart-Way<br />Flywheel</div>
            </div>
          </div>
          {ring.map((label, i) => {
            const angle = (i / ring.length) * 2 * Math.PI - Math.PI / 2;
            const x = 310 + 280 * Math.cos(angle) - 90;
            const y = 310 + 280 * Math.sin(angle) - 32;
            return (
              <div key={i} style={{
                position: "absolute", left: x, top: y, width: 180,
                textAlign: "center", fontSize: 16, fontWeight: 600,
                color: INK, background: NAVY_2, padding: "10px 12px",
                borderRadius: 12, border: `1px solid ${NAVY_3}`,
              }}>{label}</div>
            );
          })}
        </div>
        <div>
          <Card>
            <Kicker>Why this compounds</Kicker>
            <div style={{ fontSize: 22, color: INK, marginTop: 18, lineHeight: 1.55 }}>
              Once Smart-Way reaches data density in a city, no global player can catch up without
              years of community building.
            </div>
            <div style={{ height: 1, background: NAVY_3, margin: "22px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 20, color: MUTED }}>
              <div><strong style={{ color: ORANGE }}>Data moat:</strong> verified reports unique to Smart-Way</div>
              <div><strong style={{ color: ORANGE }}>Community moat:</strong> trusted reporter graph</div>
              <div><strong style={{ color: ORANGE }}>Distribution moat:</strong> fleet contracts & API integrations</div>
            </div>
          </Card>
        </div>
      </div>
      <SlideFooter n={13} total={18} />
    </div>
  );
};

/* 14 — Tech Roadmap */
const S14 = () => {
  const cols = [
    { t: "NOW", c: ORANGE, items: ["Community reporting", "8-layer verification", "Real-time driver alerts", "Smart rerouting", "Fleet dashboard v1"] },
    { t: "NEXT (12 mo)", c: "#FFA864", items: ["AI hazard prediction", "Traffic forecasting", "Predictive ETAs", "Public API v1", "Insurance data product"] },
    { t: "FUTURE", c: INK, items: ["Smart-city integrations", "Government data APIs", "Digital twin of road network", "Autonomous-vehicle feeds", "Infrastructure planning suite"] },
  ];
  return (
    <div>
      <SlideHeader kicker="Technology Roadmap" title="From community app to continental infrastructure."
        subtitle="A clear sequence: prove value with drivers, monetize with fleets, become infrastructure for cities." />
      <div style={{ padding: "20px 110px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {cols.map((c, i) => (
          <Card key={i} style={{ borderColor: i === 0 ? "rgba(255,122,26,0.4)" : NAVY_3 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.c, letterSpacing: "0.18em" }}>{c.t}</div>
            <div style={{ height: 4, width: 60, background: c.c, marginTop: 12, marginBottom: 22, borderRadius: 2 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {c.items.map((it, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20 }}>
                  <CheckCircle2 size={22} color={ORANGE} />
                  <span>{it}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <SlideFooter n={14} total={18} />
    </div>
  );
};

/* 15 — Risks */
const S15 = () => {
  const risks = [
    { r: "Network effects take time", m: "Seed with fleets & ride-hailing communities before consumer launch", icon: Users },
    { r: "Trust & fake reports", m: "8-layer verification + reputation scoring + AI filtering", icon: Shield },
    { r: "Driver safety while reporting", m: "Voice reporting, passenger reporting, park-before-report prompts", icon: Siren },
    { r: "Google / Waze entering", m: "Hyperlocal community density + fleet contracts + API ecosystem lock-in", icon: Target },
    { r: "Monetization timing", m: "B2B SaaS first, data licensing second, consumer monetization last", icon: DollarSign },
  ];
  return (
    <div>
      <SlideHeader kicker="Risk & Mitigation" title="Every concern we've already heard — answered."
        subtitle="" />
      <div style={{ padding: "20px 110px", display: "flex", flexDirection: "column", gap: 16 }}>
        {risks.map((r, i) => (
          <Card key={i} style={{ padding: 26 }}>
            <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1.4fr", gap: 28, alignItems: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: 14, background: ORANGE_SOFT, display: "grid", placeItems: "center" }}>
                <r.icon size={32} color={ORANGE} />
              </div>
              <div>
                <div style={{ fontSize: 14, color: MUTED, fontWeight: 700, letterSpacing: "0.18em" }}>RISK</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{r.r}</div>
              </div>
              <div>
                <div style={{ fontSize: 14, color: ORANGE, fontWeight: 700, letterSpacing: "0.18em" }}>MITIGATION</div>
                <div style={{ fontSize: 22, color: INK, marginTop: 4, lineHeight: 1.4 }}>{r.m}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <SlideFooter n={15} total={18} />
    </div>
  );
};

/* 16 — Financials */
const S16 = () => {
  const years = [
    { y: "Y1", rev: "$0.18M", arr: "$0.4M", fleets: 25, api: 2, ebitda: "-$0.6M" },
    { y: "Y2", rev: "$1.4M", arr: "$2.1M", fleets: 120, api: 8, ebitda: "-$0.4M" },
    { y: "Y3", rev: "$5.2M", arr: "$7.8M", fleets: 380, api: 22, ebitda: "$0.6M" },
    { y: "Y4", rev: "$14.5M", arr: "$19.2M", fleets: 850, api: 55, ebitda: "$3.8M" },
    { y: "Y5", rev: "$32M", arr: "$42M", fleets: 1800, api: 120, ebitda: "$11.2M" },
  ];
  const bars = [10, 35, 95, 200, 380];
  return (
    <div>
      <SlideHeader kicker="Financial Projections" title="Path to $42M ARR and profitability by Year 5."
        subtitle="Projections built bottom-up from fleet ACV, API tiers and pilot conversion rates. Financial Assumptions — not historical results." />
      <div style={{ padding: "10px 110px" }}>
        <Card style={{ padding: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr", padding: "20px 32px", borderBottom: `1px solid ${NAVY_3}`, fontSize: 18, color: MUTED, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <div>Year</div><div>Revenue</div><div>ARR</div><div>Fleet Customers</div><div>API Customers</div><div>EBITDA</div>
          </div>
          {years.map((y, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
              padding: "20px 32px", borderBottom: i < years.length - 1 ? `1px solid ${NAVY_3}` : "none",
              fontSize: 22, alignItems: "center",
            }}>
              <div style={{ fontWeight: 800, color: ORANGE, fontSize: 26 }}>{y.y}</div>
              <div style={{ fontWeight: 700 }}>{y.rev}</div>
              <div>{y.arr}</div>
              <div>{y.fleets}</div>
              <div>{y.api}</div>
              <div style={{ color: y.ebitda.startsWith("-") ? "#FF6B6B" : "#4ADE80", fontWeight: 700 }}>{y.ebitda}</div>
            </div>
          ))}
        </Card>
        <div style={{ marginTop: 22, display: "flex", alignItems: "flex-end", gap: 28, height: 180, padding: "0 30px" }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 18, color: MUTED }}>{years[i].rev}</div>
              <div style={{ width: "100%", height: h, background: `linear-gradient(180deg, ${ORANGE}, rgba(255,122,26,0.3))`, borderRadius: "10px 10px 0 0" }} />
              <div style={{ fontSize: 16, color: MUTED, letterSpacing: "0.1em" }}>{years[i].y}</div>
            </div>
          ))}
        </div>
      </div>
      <SlideFooter n={16} total={18} />
    </div>
  );
};

/* 17 — Ask */
const S17 = () => {
  const alloc = [
    { p: 40, t: "Engineering", d: "Core platform, mobile, fleet dashboard", c: ORANGE },
    { p: 25, t: "AI & Product", d: "Verification ML, prediction, UX", c: "#FFA864" },
    { p: 20, t: "Customer Acquisition", d: "Driver ambassadors, fleet sales", c: "#FFCB9A" },
    { p: 10, t: "Operations", d: "Ops, support, infrastructure", c: "#7C8DA8" },
    { p: 5, t: "Legal & Compliance", d: "Data, mobility & licensing", c: "#4B5C76" },
  ];
  const milestones = [
    "5,000+ active drivers in Nairobi",
    "50 paying fleet customers",
    "5 API / data licensing contracts",
    "Verified report SLA < 60s, > 92% accuracy",
    "Series A readiness in 18 months",
  ];
  return (
    <div>
      <SlideHeader kicker="The Ask" title="Raising $500K Pre-Seed to own East African road intelligence." />
      <div style={{ padding: "20px 110px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 36 }}>
        <Card>
          <div style={{ fontSize: 22, color: MUTED, fontWeight: 700, letterSpacing: "0.18em" }}>USE OF FUNDS</div>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {alloc.map((a, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{a.t}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: a.c }}>{a.p}%</div>
                </div>
                <div style={{ fontSize: 16, color: MUTED, marginTop: 2 }}>{a.d}</div>
                <div style={{ height: 8, background: NAVY_3, borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${a.p * 2.5}%`, background: a.c }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <Card style={{ background: ORANGE, color: NAVY }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.18em" }}>RAISING</div>
            <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", marginTop: 8 }}>$500K</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 10 }}>Pre-Seed · SAFE · 18-month runway</div>
          </Card>
          <Card>
            <div style={{ fontSize: 22, color: MUTED, fontWeight: 700, letterSpacing: "0.18em" }}>POST-FUNDING MILESTONES</div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {milestones.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 19 }}>
                  <CheckCircle2 size={22} color={ORANGE} /> {m}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <SlideFooter n={17} total={18} />
    </div>
  );
};

/* 18 — Vision */
const S18 = () => (
  <div style={{ position: "relative", width: "100%", height: "100%" }}>
    <div style={{
      position: "absolute", inset: 0,
      background: `radial-gradient(circle at 50% 50%, rgba(255,122,26,0.2), transparent 60%)`,
    }} />
    <div style={{ position: "relative", padding: 110, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <Kicker><Globe2 size={16} /> Our Vision</Kicker>
      <h1 style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", margin: "32px 0", maxWidth: 1600 }}>
        To become Africa's <span style={{ color: ORANGE }}>real-time mobility</span><br />
        <span style={{ color: ORANGE }}>intelligence infrastructure</span>.
      </h1>
      <p style={{ fontSize: 30, color: MUTED, lineHeight: 1.45, maxWidth: 1300 }}>
        Powering safer, faster and more efficient transportation
        for millions of drivers, fleets and cities across the continent.
      </p>
      <div style={{ display: "flex", gap: 50, marginTop: 80, fontSize: 20, color: MUTED, letterSpacing: "0.18em", textTransform: "uppercase" }}>
        <div>smart-way.africa</div>
        <div style={{ color: ORANGE }}>· Let's build it together ·</div>
        <div>invest@smart-way.africa</div>
      </div>
    </div>
    <SlideFooter n={18} total={18} />
  </div>
);

/* ----- Slide registry ----- */
const SLIDES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18];
const TITLES = [
  "Cover", "Problem", "Why Apps Fail", "Solution", "User Journey",
  "Trust Engine", "Market", "Product", "Traction", "Business Model",
  "Go-To-Market", "Competition", "Flywheel", "Roadmap", "Team",
  "Financials", "The Ask", "Vision",
];

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

/* ----- Page ----- */
export default function Pitch() {
  const [i, setI] = useState(0);
  const [fs, setFs] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [hudOpen, setHudOpen] = useState(true);
  const navigate = useNavigate();
  const tickRef = useRef<number | null>(null);

  const go = useCallback((d: number) => {
    setI(p => Math.max(0, Math.min(SLIDES.length - 1, p + d)));
  }, []);

  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  // Timer
  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [running]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      else if (e.key === "Home") setI(0);
      else if (e.key === "End") setI(SLIDES.length - 1);
      else if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleFs(); }
      else if (e.key === "t" || e.key === "T") { e.preventDefault(); setRunning(r => !r); }
      else if (e.key === "r" || e.key === "R") { e.preventDefault(); setSeconds(0); setRunning(false); }
      else if (e.key === "h" || e.key === "H") { e.preventDefault(); setHudOpen(o => !o); }
      else if (e.key === "Escape" && !document.fullscreenElement) navigate("/");
    };
    window.addEventListener("keydown", onKey);
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("fullscreenchange", onFs); };
  }, [go, navigate, toggleFs]);

  const Slide = SLIDES[i];
  const nextTitle = i < SLIDES.length - 1 ? TITLES[i + 1] : "— End —";
  const prevTitle = i > 0 ? TITLES[i - 1] : "— Start —";
  const progress = ((i + 1) / SLIDES.length) * 100;

  return (
    <div style={{ background: NAVY, width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ScaledSlide><Slide /></ScaledSlide>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.06)", zIndex: 60 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: ORANGE, transition: "width 0.3s ease" }} />
      </div>

      {/* Presenter HUD */}
      {hudOpen ? (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "stretch", gap: 0, zIndex: 50,
          background: "rgba(10,22,40,0.92)", backdropFilter: "blur(16px)",
          border: `1px solid ${NAVY_3}`, borderRadius: 20, padding: 10,
          fontFamily: "Inter, sans-serif", boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}>
          {/* Prev with title */}
          <button onClick={() => go(-1)} disabled={i === 0} style={navBtn(i === 0)} aria-label="Previous slide">
            <SkipBack size={16} color={INK} />
            <div style={{ textAlign: "left", lineHeight: 1.15 }}>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>Prev</div>
              <div style={{ fontSize: 12, color: INK, fontWeight: 600, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prevTitle}</div>
            </div>
          </button>

          <div style={divider} />

          {/* Slide counter */}
          <div style={{ padding: "6px 18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 80 }}>
            <div style={{ fontSize: 9, color: MUTED, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>Slide</div>
            <div style={{ fontSize: 18, color: INK, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              {i + 1}<span style={{ color: MUTED, fontWeight: 600 }}>/{SLIDES.length}</span>
            </div>
          </div>

          <div style={divider} />

          {/* Next with title */}
          <button onClick={() => go(1)} disabled={i === SLIDES.length - 1} style={navBtn(i === SLIDES.length - 1)} aria-label="Next slide">
            <div style={{ textAlign: "right", lineHeight: 1.15 }}>
              <div style={{ fontSize: 9, color: ORANGE, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>Next</div>
              <div style={{ fontSize: 12, color: INK, fontWeight: 600, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nextTitle}</div>
            </div>
            <SkipForward size={16} color={INK} />
          </button>

          <div style={divider} />

          {/* Timer */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px" }}>
            <Clock size={14} color={running ? ORANGE : MUTED} />
            <div style={{
              fontSize: 16, color: running ? ORANGE : INK, fontWeight: 700,
              fontVariantNumeric: "tabular-nums", minWidth: 56, fontFamily: "Inter, monospace",
            }}>{fmt(seconds)}</div>
            <button onClick={() => setRunning(r => !r)} style={iconBtn} aria-label={running ? "Pause timer" : "Start timer"}>
              {running ? <Pause size={14} color={INK} /> : <Play size={14} color={INK} />}
            </button>
            <button onClick={() => { setSeconds(0); setRunning(false); }} style={iconBtn} aria-label="Reset timer">
              <RotateCcw size={13} color={MUTED} />
            </button>
          </div>

          <div style={divider} />

          {/* Fullscreen */}
          <button onClick={toggleFs} style={iconBtnLg} aria-label="Toggle fullscreen">
            {fs ? <Minimize2 size={16} color={INK} /> : <Maximize2 size={16} color={INK} />}
          </button>

          {/* Hide HUD */}
          <button onClick={() => setHudOpen(false)} style={{ ...iconBtnLg, marginLeft: 2 }} aria-label="Hide HUD" title="Hide HUD (H)">
            <Eye size={16} color={MUTED} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setHudOpen(true)}
          aria-label="Show presenter HUD"
          style={{
            position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
            zIndex: 50, background: "rgba(10,22,40,0.85)", backdropFilter: "blur(12px)",
            border: `1px solid ${NAVY_3}`, borderRadius: 999, padding: "8px 16px",
            color: MUTED, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
            fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif",
          }}
        >
          Show HUD · H
        </button>
      )}

      {/* Shortcut hint */}
      {!fs && hudOpen && (
        <div style={{
          position: "fixed", top: 14, right: 20, color: MUTED, fontSize: 11,
          fontFamily: "Inter, sans-serif", letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          ←/→ nav · T timer · R reset · F fullscreen · H hide · Esc exit
        </div>
      )}
    </div>
  );
}

const divider: React.CSSProperties = { width: 1, background: NAVY_3, margin: "4px 4px" };

const navBtn = (disabled: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 10, padding: "6px 14px",
  background: "transparent", border: "none", borderRadius: 12,
  cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
  color: INK, fontFamily: "Inter, sans-serif",
});

const iconBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8, background: NAVY_3,
  border: "none", display: "grid", placeItems: "center", cursor: "pointer",
};

const iconBtnLg: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, background: NAVY_3,
  border: "none", display: "grid", placeItems: "center", cursor: "pointer",
};

