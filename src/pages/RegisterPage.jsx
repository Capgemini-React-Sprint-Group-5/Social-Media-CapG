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
          dispatch(
            setUser({
              userId: userId,
              username: values.username,
              email: values.email,
            }),
          );
          navigate("/");
        },
      });
    },
  });

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: 440 }}>
        <h4 className="card-title text-center mb-4">Create Account</h4>

        {isError && (
          <div className="alert alert-danger py-2" role="alert">
            {error?.message || "Something went wrong. Please try again."}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className={`form-control ${formik.touched.username && formik.errors.username ? "is-invalid" : ""}`}
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="username"
            />
            {formik.touched.username && formik.errors.username && (
              <div className="invalid-feedback">{formik.errors.username}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-control ${formik.touched.email && formik.errors.email ? "is-invalid" : ""}`}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="email"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="invalid-feedback">{formik.errors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-control ${formik.touched.password && formik.errors.password ? "is-invalid" : ""}`}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="new-password"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="invalid-feedback">{formik.errors.password}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "is-invalid" : ""}`}
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
            className="btn btn-primary w-100"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
