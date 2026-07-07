import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setUser } from "../store/slices/authSlice.js";
import { useCreateUser } from "../hooks/useUsers.js";

/**
 * RegisterPage — Owner: A
 * POST /api/users — body: { username, email, password }
 * On success → set session → redirect to /
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate: register, isPending, isError, error } = useCreateUser();

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Must be at least 3 characters")
        .required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string()
        .min(6, "Must be at least 6 characters")
        .required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
    }),
    onSubmit: (values) => {
      const { confirmPassword, ...payload } = values;
      register(payload, {
        onSuccess: (data) => {
          // Store session — adjust field names to match actual API response
          const userId = data?.userID || data?.userId || data?.id;
          dispatch(setUser({ ...user, userId }));
          navigate("/home");
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
        {/* Left Section */}

        <div
          className="col-lg-6 d-none d-lg-flex flex-column justify-content-center px-5"
          style={{
            background: "linear-gradient(135deg, #198754, #20c997)",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "50px",
              fontWeight: "700",
            }}
          >
            SocialSphere
          </h1>

          <p
            style={{
              fontSize: "22px",
              marginTop: "20px",
              lineHeight: "1.6",
            }}
          >
            Join thousands of users.
            <br />
            Share your ideas.
            <br />
            Connect with your community.
          </p>

          <div
            style={{
              marginTop: "40px",
              fontSize: "18px",
              opacity: "0.9",
            }}
          >
            Fast • Secure • Easy to Use
          </div>
        </div>

        {/* Right Section */}

        <div className="col-lg-6 d-flex justify-content-center align-items-center">
          <div
            className="card border-0 shadow-lg"
            style={{
              width: "100%",
              maxWidth: "470px",
              borderRadius: "20px",
              padding: "40px",
            }}
          >
            <h2
              className="text-center"
              style={{
                fontWeight: "700",
              }}
            >
              Create Account
            </h2>

            <p className="text-center text-muted mb-4">
              Register to get started
            </p>

            {isError && (
              <div className="alert alert-danger py-2">
                {error?.message || "Something went wrong. Please try again."}
              </div>
            )}

            <form onSubmit={formik.handleSubmit} noValidate>
              {/* Username */}

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
                  autoComplete="username"
                />

                {formik.touched.username && formik.errors.username && (
                  <div className="invalid-feedback">
                    {formik.errors.username}
                  </div>
                )}
              </div>

              {/* Email */}

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  className={`form-control ${
                    formik.touched.email && formik.errors.email
                      ? "is-invalid"
                      : ""
                  }`}
                  style={{
                    height: "50px",
                    borderRadius: "12px",
                  }}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="email"
                />

                {formik.touched.email && formik.errors.email && (
                  <div className="invalid-feedback">{formik.errors.email}</div>
                )}
              </div>

              {/* Password */}

              <div className="mb-3">
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
                  autoComplete="new-password"
                />

                {formik.touched.password && formik.errors.password && (
                  <div className="invalid-feedback">
                    {formik.errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  className={`form-control ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "is-invalid"
                      : ""
                  }`}
                  style={{
                    height: "50px",
                    borderRadius: "12px",
                  }}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="new-password"
                />

                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {formik.errors.confirmPassword}
                    </div>
                  )}
              </div>

              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={isPending}
                style={{
                  height: "50px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "16px",
                }}
              >
                {isPending ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted">Already have an account?</span>{" "}
              <Link to="/login" className="fw-semibold text-decoration-none">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
