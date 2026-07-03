import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { selectCurrentUser } from "../store/index.js";
import { useCreatePost } from "../hooks/usePosts.js";

/**
 * CreatePostPage  — Owner: B
 * POST /api/post  — body: { userId, content }
 *
 * TODO (B): add image upload field if backend supports it
 */
export default function CreatePostPage() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const { mutate: createPost, isPending, isError } = useCreatePost();

  const formik = useFormik({
    initialValues: { content: "" },
    validationSchema: Yup.object({
      content: Yup.string()
        .min(1)
        .max(500)
        .required("Post content is required"),
    }),
    onSubmit: (values) => {
      createPost(
        { userId: currentUser.userId, content: values.content },
        { onSuccess: () => navigate("/home") },
      );
    },
  });

  return (
    <div style={{ maxWidth: 600 }}>
      <h5 className="mb-3">Create Post</h5>
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-3">
          <textarea
            className={`form-control ${formik.touched.content && formik.errors.content ? "is-invalid" : ""}`}
            name="content"
            rows={4}
            placeholder="What's on your mind?"
            value={formik.values.content}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.content && formik.errors.content && (
            <div className="invalid-feedback">{formik.errors.content}</div>
          )}
        </div>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Posting…" : "Post"}
        </button>
        {isError && <p className="text-danger mt-2">Failed to create post.</p>}
      </form>
    </div>
  );
}
