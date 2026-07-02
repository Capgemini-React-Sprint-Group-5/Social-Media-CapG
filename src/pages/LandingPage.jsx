import { useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/index.js";

/**
 * LandingPage — Owner: A
 *
 * Public entry point at "/".
 * - Already logged in?  -> bounce straight to /home
 * - Not logged in?      -> flashy welcome screen with Login / Register choice
 *
 * Colour theme matches LoginPage / RegisterPage:
 *   gradient: #0d6efd -> #4e8cff, background #eef2f7, 12-20px rounded corners
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const features = [
    {
      icon: "📸",
      title: "Share Moments",
      desc: "Post photos, thoughts & updates in seconds.",
    },
    {
      icon: "🤝",
      title: "Grow Your Circle",
      desc: "Find friends and build communities you love.",
    },
    {
      icon: "🔔",
      title: "Stay in the Loop",
      desc: "Never miss a like, comment, or mention.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#eef2f7",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes floatBlob {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(20px, -30px) scale(1.08); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(13,110,253,0.35); }
          70%  { box-shadow: 0 0 0 18px rgba(13,110,253,0); }
          100% { box-shadow: 0 0 0 0 rgba(13,110,253,0); }
        }
        .ss-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(10px);
          opacity: 0.35;
          animation: floatBlob 8s ease-in-out infinite;
          pointer-events: none;
        }
        .ss-hero-title {
          background: linear-gradient(90deg, #0d6efd, #4e8cff, #0d6efd);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 6s ease infinite;
        }
        .ss-fade-1 { animation: fadeUp 0.6s ease both; }
        .ss-fade-2 { animation: fadeUp 0.6s ease 0.15s both; }
        .ss-fade-3 { animation: fadeUp 0.6s ease 0.3s both; }
        .ss-feature-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .ss-feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 30px rgba(13,110,253,0.15) !important;
        }
        .ss-btn-primary-glow {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: pulseRing 2.4s ease-out infinite;
        }
        .ss-btn-primary-glow:hover {
          transform: translateY(-2px) scale(1.03);
        }
        .ss-btn-outline:hover {
          transform: translateY(-2px) scale(1.03);
          background: #0d6efd !important;
          color: white !important;
        }
      `}</style>

      {/* Decorative floating blobs */}
      <div
        className="ss-blob d-none d-md-block"
        style={{
          width: "260px",
          height: "260px",
          top: "-60px",
          left: "-60px",
          background: "linear-gradient(135deg,#0d6efd,#4e8cff)",
        }}
      />
      <div
        className="ss-blob d-none d-md-block"
        style={{
          width: "220px",
          height: "220px",
          bottom: "-40px",
          right: "-40px",
          background: "linear-gradient(135deg,#4e8cff,#0d6efd)",
          animationDelay: "2s",
        }}
      />
      <div
        className="ss-blob d-none d-lg-block"
        style={{
          width: "160px",
          height: "160px",
          top: "40%",
          right: "8%",
          background: "linear-gradient(135deg,#0d6efd,#4e8cff)",
          animationDelay: "1s",
        }}
      />

      <div className="container position-relative" style={{ zIndex: 1 }}>
        {/* Nav */}
        <div className="d-flex justify-content-between align-items-center pt-4">
          <h4 className="fw-bold mb-0" style={{ color: "#0d6efd" }}>
            SocialSphere
          </h4>
          <div>
            <button
              className="btn btn-outline-primary btn-sm me-2 ss-btn-outline"
              style={{ borderRadius: "10px", fontWeight: 600 }}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="btn btn-primary btn-sm"
              style={{ borderRadius: "10px", fontWeight: 600 }}
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center px-3" style={{ paddingTop: "70px" }}>
          <div
            className="ss-fade-1"
            style={{
              display: "inline-block",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "1px",
              color: "#0d6efd",
              background: "rgba(13,110,253,0.1)",
              padding: "6px 16px",
              borderRadius: "999px",
              marginBottom: "20px",
            }}
          >
            ✨ WELCOME TO THE SPHERE
          </div>

          <h1
            className="ss-hero-title ss-fade-2"
            style={{
              fontSize: "clamp(38px, 6vw, 68px)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            Connect. Share. Belong.
          </h1>

          <p
            className="ss-fade-3 text-muted mx-auto"
            style={{
              fontSize: "20px",
              maxWidth: "640px",
              marginBottom: "36px",
            }}
          >
            SocialSphere is where your friends, your moments, and your
            communities come together — all in one vibrant place.
          </p>

          <div
            className="d-flex flex-column flex-sm-row justify-content-center gap-3 ss-fade-3"
            style={{ marginBottom: "16px" }}
          >
            <button
              className="btn btn-primary ss-btn-primary-glow"
              style={{
                height: "54px",
                minWidth: "200px",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "17px",
              }}
              onClick={() => navigate("/register")}
            >
              Get Started — It's Free
            </button>

            <button
              className="btn btn-outline-primary ss-btn-outline"
              style={{
                height: "54px",
                minWidth: "200px",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "17px",
                background: "white",
              }}
              onClick={() => navigate("/login")}
            >
              I Already Have an Account
            </button>
          </div>

          <div style={{ fontSize: "15px", color: "#6c757d" }}>
            Secure • Fast • Reliable
          </div>
        </div>

        {/* Feature grid */}
        <div
          className="row g-4 justify-content-center"
          style={{ marginTop: "70px", paddingBottom: "90px" }}
        >
          {features.map((f) => (
            <div className="col-6 col-md-3" key={f.title}>
              <div
                className="ss-feature-card card border-0 shadow-sm h-100 text-center"
                style={{ borderRadius: "18px", padding: "28px 16px" }}
              >
                <div style={{ fontSize: "34px", marginBottom: "12px" }}>
                  {f.icon}
                </div>
                <div
                  className="fw-bold mb-1"
                  style={{ fontSize: "16px", color: "#212529" }}
                >
                  {f.title}
                </div>
                <div className="text-muted" style={{ fontSize: "13.5px" }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
