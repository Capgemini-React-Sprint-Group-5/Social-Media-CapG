import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { setUser } from "../store/slices/authSlice.js";
import { useLoginUser } from "../hooks/useUsers.js";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const { mutate: login, isPending } = useLoginUser();

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      password: Yup.string().required("Password is required"),
    }),
    // inside formik onSubmit handler in pages/LoginPage.jsx
    onSubmit: (values) => {
      setLoginError("");
      login(values, {
        onSuccess: (user) => {
          const userId = user?.userID || user?.userId || user?.id;
          dispatch(setUser({ ...user, userId }));
          navigate("/home");
        },
        onError: () => {
          // Completely wipes status codes/network errors and overwrites with your precise text
          setLoginError("Invalid credentials.");
        },
      });
    },
  });

  return (
    <div
      className="container-fluid"
      style={{
        minHeight: "100vh",
        backgroundColor: "#eef2f7",
      }}
    >
      <div className="row min-vh-100">
        <div
          className="col-lg-6 d-none d-lg-flex flex-column justify-content-center px-5"
          style={{
            background: "linear-gradient(135deg,#0d6efd,#4e8cff)",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "52px",
              fontWeight: "700",
            }}
          >
            SocialSphere
          </h1>

          <p
            style={{
              fontSize: "22px",
              marginTop: "20px",
              opacity: ".95",
            }}
          >
            Connect with friends.
            <br />
            Share your moments.
            <br />
            Discover amazing communities.
          </p>

          <div
            style={{
              marginTop: "40px",
              fontSize: "18px",
              opacity: ".85",
            }}
          >
            Secure • Fast • Reliable
          </div>
        </div>
        <div className="col-lg-6 d-flex justify-content-center align-items-center">
          <div
            className="card shadow-lg border-0"
            style={{
              width: "100%",
              maxWidth: "430px",
              borderRadius: "20px",
              padding: "40px",
            }}
          >
            <h2
              className="text-center mb-2"
              style={{
                fontWeight: "700",
              }}
            >
              Welcome Back
            </h2>

            <p className="text-center text-muted mb-4">Login to continue</p>

            {loginError && (
              <div className="alert alert-danger py-2">{loginError}</div>
            )}

            <form onSubmit={formik.handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Username</label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  className={`form-control ${
                    formik.touched.username && formik.errors.username
                      ? "is-invalid"
                      : ""
                  }`}
                  style={{
                    height: "50px",
                    borderRadius: "12px",
                  }}
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                {formik.touched.username && formik.errors.username && (
                  <div className="invalid-feedback">
                    {formik.errors.username}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Password</label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  className={`form-control ${
                    formik.touched.password && formik.errors.password
                      ? "is-invalid"
                      : ""
                  }`}
                  style={{
                    height: "50px",
                    borderRadius: "12px",
                  }}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                {formik.touched.password && formik.errors.password && (
                  <div className="invalid-feedback">
                    {formik.errors.password}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isPending}
                style={{
                  height: "50px",
                  borderRadius: "12px",
                  fontWeight: "600",
                }}
              >
                {isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
            {loginError && (
              <div
                className="d-flex align-items-center gap-3 p-3 mb-4 border-0 text-start"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.08)", // Subtle crimson backdrop hue
                  borderLeft: "4px solid #ef4444", // Left indicator stripe accent
                  borderRadius: "12px",
                  animation: "fadeUp 0.25s ease-out forwards",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                  }}
                >
                  <i
                    className="bi bi-exclamation-circle-fill"
                    style={{ fontSize: "0.95rem" }}
                  ></i>
                </div>
                <div className="flex-grow-1">
                  <h6
                    className="fw-bold mb-0 text-dark"
                    style={{ fontSize: "0.88rem" }}
                  >
                    Authentication Failed
                  </h6>
                  <p
                    className="text-secondary mb-0 small"
                    style={{ fontSize: "0.78rem" }}
                  >
                    {loginError} {/* Always renders "Invalid credentials." */}
                  </p>
                </div>
              </div>
            )}

            <div className="text-center mt-4">
              <span className="text-muted">Don't have an account?</span>{" "}
              <Link to="/register" className="text-decoration-none fw-semibold">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
