import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { setUser } from "../store/slices/authSlice.js";
import { useUserSearch } from "../hooks/useUsers.js";

/**
 * LoginPage — Owner: A
 *
 * MOCK LOGIN FLOW:
 * 1. User enters username + password
 * 2. Call GET /api/users/search/:username
 * 3. If user found → store in Redux (setUser) → redirect to /
 * 4. No real password check — backend has no auth endpoint
 */
export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchUsername, setSearchUsername] = useState("");
  const [loginError, setLoginError] = useState("");

  const {
    data: searchResult,
    isFetching,
    isError,
  } = useUserSearch(searchUsername);

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: (values) => {
      setLoginError("");
      // Trigger the search query by setting the username
      setSearchUsername(values.username.trim());
    },
  });

  // React to search results once the query settles (avoids dispatching mid-render)
  useEffect(() => {
    if (!searchUsername || isFetching) return;

    if (isError) {
      setLoginError("No account found with that username.");
      setSearchUsername("");
      return;
    }

    const user = Array.isArray(searchResult) ? searchResult[0] : searchResult;

    if (user?.userId) {
      dispatch(
        setUser({
          userId: user.userId,
          username: user.username,
          email: user.email,
        }),
      );
      navigate("/");
    } else if (searchResult !== undefined) {
      setLoginError("No account found with that username.");
      setSearchUsername(""); // reset so the same username can be retried
    }
  }, [searchResult, isFetching, isError, searchUsername, dispatch, navigate]);

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: 400 }}>
        <h4 className="card-title text-center mb-4">Login</h4>

        {loginError && (
          <div className="alert alert-danger py-2" role="alert">
            {loginError}
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
              autoComplete="current-password"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="invalid-feedback">{formik.errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
