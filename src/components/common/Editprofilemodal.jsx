import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setUser } from "../../store/slices/authSlice.js";
import { useUpdateUser } from "../../hooks/useUsers.js";
import Modal from "./Modal.jsx";

export default function EditProfileModal({ isOpen, onClose, user }) {
  const dispatch = useDispatch();
  const { mutate: updateUser, isPending, isError, error } = useUpdateUser();

  const formik = useFormik({
    enableReinitialize: true, // repopulate if `user` prop arrives/changes after mount
    initialValues: {
      username: user?.username || "",
      email: user?.email || "",
      profile_picture: user?.profile_picture || "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Must be at least 3 characters")
        .required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      profile_picture: Yup.string().url("Must be a valid URL").nullable(),
    }),
    onSubmit: (values) => {
      updateUser(
        { userId: user.userID ?? user.id, userData: values },
        {
          onSuccess: () => {
            // Keep Redux session in sync with what was just saved
            dispatch(
              setUser({
                userId: user.userID ?? user.id,
                username: values.username,
                email: values.email,
                profile_picture: values.profile_picture,
              }),
            );
            onClose();
          },
        },
      );
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
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
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="username"
          />
          {formik.touched.username && formik.errors.username && (
            <div className="invalid-feedback">{formik.errors.username}</div>
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
              formik.touched.email && formik.errors.email ? "is-invalid" : ""
            }`}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="email"
          />
          {formik.touched.email && formik.errors.email && (
            <div className="invalid-feedback">{formik.errors.email}</div>
          )}
        </div>

        {/* Profile picture URL */}
        <div className="mb-4">
          <label className="form-label fw-semibold">Profile Picture URL</label>
          <input
            id="profile_picture"
            name="profile_picture"
            type="text"
            placeholder="https://example.com/photo.jpg"
            className={`form-control ${
              formik.touched.profile_picture && formik.errors.profile_picture
                ? "is-invalid"
                : ""
            }`}
            value={formik.values.profile_picture}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.profile_picture && formik.errors.profile_picture && (
            <div className="invalid-feedback">
              {formik.errors.profile_picture}
            </div>
          )}
          <div className="form-text">
            No file upload backend — paste an image URL instead.
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
