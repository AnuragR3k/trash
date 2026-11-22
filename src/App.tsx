import { useEffect, useRef, useState } from "react";

export default function App() {
  const [menuActive, setMenuActive] = useState(false);

  const pipelineRef = useRef<HTMLDivElement | null>(null);
  const nodeStackRef = useRef<SVGSVGElement | null>(null);
  const nodeXRef = useRef<HTMLDivElement | null>(null);
  const nodeShieldRef = useRef<SVGSVGElement | null>(null);
  const beamPath1Ref = useRef<SVGPathElement | null>(null);
  const beamPath2Ref = useRef<SVGPathElement | null>(null);
  const beamGradientRef = useRef<SVGLinearGradientElement | null>(null);
  const splashRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => {
    setMenuActive((prev) => {
      const next = !prev;
      document.body.style.overflow = next ? "hidden" : "";
      return next;
    });
  };

  useEffect(() => {
    let raf: number;
    let lastStateChange = performance.now();
    let state: "p1" | "splash" | "p2" | "idle" = "p1";

    const updatePaths = () => {
      if (
        !pipelineRef.current ||
        !nodeStackRef.current ||
        !nodeXRef.current ||
        !nodeShieldRef.current
      )
        return;

      const pRect = pipelineRef.current.getBoundingClientRect();
      const sRect = nodeStackRef.current.getBoundingClientRect();
      const xRect = nodeXRef.current.getBoundingClientRect();
      const shRect = nodeShieldRef.current.getBoundingClientRect();

      const startX = sRect.left + sRect.width / 2 - pRect.left;
      const startY = sRect.top + sRect.height / 2 - pRect.top;
      const midX = xRect.left + xRect.width / 2 - pRect.left;
      const midY = xRect.top + xRect.height / 2 - pRect.top;
      const endX = shRect.left + shRect.width / 2 - pRect.left;
      const endY = shRect.top + shRect.height / 2 - pRect.top;

      const d = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;
      if (beamPath1Ref.current)
        beamPath1Ref.current.setAttribute("d", d);
      if (beamPath2Ref.current)
        beamPath2Ref.current.setAttribute("d", d);
    };

    const loop = (now: number) => {
      const elapsed = now - lastStateChange;

      switch (state) {
        case "p1":
          if (elapsed >= 800) {
            state = "splash";
            lastStateChange = now;
            if (beamPath1Ref.current)
              beamPath1Ref.current.style.opacity = "0";
            if (beamPath2Ref.current)
              beamPath2Ref.current.style.opacity = "0";
            if (splashRef.current)
              splashRef.current.classList.add("animate");
          } else {
            const p = Math.min(elapsed / 800, 1) * 0.5;
            if (nodeStackRef.current) {
              if (p < 0.4) {
                nodeStackRef.current.classList.add("active");
              } else {
                nodeStackRef.current.classList.remove("active");
              }
            }
          }
          break;

        case "splash":
          if (elapsed >= 800) {
            state = "p2";
            lastStateChange = now;
            if (splashRef.current)
              splashRef.current.classList.remove("animate");
            if (beamPath1Ref.current)
              beamPath1Ref.current.style.opacity = "1";
            if (beamPath2Ref.current)
              beamPath2Ref.current.style.opacity = "1";
          }
          break;

        case "p2":
          if (elapsed >= 800) {
            state = "idle";
            lastStateChange = now;
            if (nodeShieldRef.current)
              nodeShieldRef.current.classList.remove("active");
          } else {
            const p = 0.5 + Math.min(elapsed / 800, 1) * 0.5;
            if (nodeShieldRef.current) {
              if (p > 0.6) {
                nodeShieldRef.current.classList.add("active");
              } else {
                nodeShieldRef.current.classList.remove("active");
              }
            }
          }
          break;

        case "idle":
          if (elapsed >= 1000) {
            state = "p1";
            lastStateChange = now;
          }
          break;
      }

      if (beamGradientRef.current) {
        const percentage =
          state === "p1"
            ? Math.min((now - lastStateChange) / 800, 1) * 0.5
            : state === "p2"
            ? 0.5 + Math.min((now - lastStateChange) / 800, 1) * 0.5
            : state === "splash"
            ? 0.5
            : 1;
        const center = percentage * 100;
        const halfWidth = 5;
        beamGradientRef.current.setAttribute(
          "x1",
          `${center - halfWidth}%`
        );
        beamGradientRef.current.setAttribute(
          "x2",
          `${center + halfWidth}%`
        );
      }

      raf = requestAnimationFrame(loop);
    };

    updatePaths();
    window.addEventListener("resize", updatePaths);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePaths);
    };
  }, []);

  return (
    <>
      <nav>
        <span className="nav-logo">Xero</span>
        <div className="nav-menu">
          <ul className="nav-links">
            <li>
              <a href="#">Method</a>
            </li>
            <li>
              <a href="#">Pricing</a>
            </li>
            <li>
              <a href="#">Docs</a>
            </li>
          </ul>
          <div className="nav-actions">
            <button className="btn-login">Log in</button>
            <button className="btn-signup">Sign up</button>
          </div>
        </div>
        <button
          className={`menu-toggle ${menuActive ? "active" : ""}`}
          aria-label="Menu"
          aria-expanded={menuActive}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
        </button>
      </nav>

      <section className="hero-card">
        <div className="hero-grid" />
        <div className="icon-pipeline">
          <svg
            className="beam-svg"
            viewBox="0 0 700 200"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur
                  stdDeviation="2"
                  result="blur"
                />
                <feComposite
                  in="SourceGraphic"
                  in2="blur"
                  operator="over"
                />
              </filter>
              <linearGradient
                id="beam-gradient"
                gradientUnits="userSpaceOnUse"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
                ref={(el) => {
                  beamGradientRef.current = el as SVGLinearGradientElement;
                }}
              >
                <stop offset="0%" stopColor="#b04090" stopOpacity="0" />
                <stop offset="20%" stopColor="#b04090" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fff" stopOpacity="1" />
                <stop offset="80%" stopColor="#c8a0e0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c8a0e0" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className="beam-glow"
              ref={(el) => {
                beamPath1Ref.current = el as SVGPathElement;
              }}
              stroke="url(#beam-gradient)"
              strokeWidth="2"
              filter="url(#glow)"
              opacity="0.6"
              fill="none"
            />
            <path
              className="beam-core"
              ref={(el) => {
                beamPath2Ref.current = el as SVGPathElement;
              }}
              stroke="url(#beam-gradient)"
              strokeWidth="0.8"
              fill="none"
            />
          </svg>

          <svg
            id="node-stack"
            className="icon-node node-light-right"
            viewBox="0 0 24 24"
            ref={(el) => {
              nodeStackRef.current = el as SVGSVGElement;
            }}
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>

          <div className="pipeline-line" />

          <div className="center-wrapper">
            <div
              className="splash"
              ref={(el) => {
                splashRef.current = el as HTMLDivElement;
              }}
            />
            <div
              className="icon-node-center"
              ref={(el) => {
                nodeXRef.current = el as HTMLDivElement;
              }}
            >
              <svg
                viewBox="0 0 40 40"
                width="28"
                height="28"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 10 l20 20" />
                <path d="M30 10 l-20 20" />
              </svg>
            </div>
          </div>

          <div className="pipeline-line right" />

          <svg
            id="node-shield"
            className="icon-node node-light-left"
            viewBox="0 0 24 24"
            ref={(el) => {
              nodeShieldRef.current = el as SVGSVGElement;
            }}
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>

        <div className="hero-content">
          <h1 className="hero-heading">
            The simple way
            <strong>encryption your data</strong>
          </h1>
          <p className="hero-sub">
            Fully managed data encrypting service and annotation<br />
            platform for teams of all industries.
          </p>
          <a href="#" className="btn-cta">
            Get Started
          </a>
        </div>
      </section>

      <div className="brands">
        <div className="brand-item">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="10" fill="currentColor" />
            <path
              fill="var(--bg)"
              d="M8 9h8v2H8zm0 4h6v2H8z"
            />
          </svg>
          <span>Expedia</span>
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="7" r="4" fill="currentColor" />
            <circle cx="5" cy="16" r="3.5" fill="currentColor" />
            <circle cx="19" cy="16" r="3.5" fill="currentColor" />
          </svg>
          <span>asana</span>
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <polyline
              points="4 8 20 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <polyline
              points="8 12 16 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <polyline
              points="4 16 20 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <span>zenefits</span>
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="15.5" cy="8.5" r="2.5" fill="currentColor" />
            <circle cx="8.5" cy="8.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8.5 8.5 L15.5 8.5 L11 15 L8.5 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>
            HubSp<span className="hubspot-dot"></span>t
          </span>
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" />
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>loom</span>
        </div>
      </div>
    </>
  );
}
