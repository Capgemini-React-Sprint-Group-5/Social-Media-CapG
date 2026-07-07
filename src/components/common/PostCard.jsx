import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/index.js";

import {
  usePostLikes,
  useAddLike,
  useRemoveLike,
} from "../../hooks/useLikes.js";
import { usePostComments, useAddComment } from "../../hooks/useComments.js";
import { useUpdatePost, useDeletePost } from "../../hooks/usePosts.js";

import Avatar from "./Avatar.jsx";
import Card from "./Card.jsx";
import CommentList from "./CommentList.jsx";
import CommentForm from "./CommentForm.jsx";
import LikeButton from "./LikeButton.jsx";
import ShareButton from "./ShareButton.jsx";
import SaveButton from "./SaveButton.jsx";
import Modal from "./Modal.jsx";

export default function PostCard({ post }) {
  const currentUser = useSelector(selectCurrentUser);

  const currentUserId =
    currentUser?.userId || currentUser?.userID || currentUser?.id;
  const currentPostId = post?.postID || post?.id;

  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post?.content || "");

  // Custom states replacing native alerts completely
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: likesData = [], refetch: refetchLikes } =
    usePostLikes(currentPostId);
  const { data: comments = [], refetch: refetchComments } =
    usePostComments(currentPostId);

  const addLikeMutation = useAddLike();
  const removeLikeMutation = useRemoveLike();
  const createCommentMutation = useAddComment();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  const likes = Array.isArray(likesData) ? likesData : likesData?.data || [];
  const isLiked = likes.some(
    (like) => String(like.userID) === String(currentUserId),
  );

  const postAuthorId =
    post?.userID || post?.userId || post?.user?.userID || post?.user?.userId;
  const isAuthor = String(postAuthorId) === String(currentUserId);

  const handleLikeToggle = async () => {
    if (!currentUserId || !currentPostId) return;
    try {
      if (isLiked) {
        const existingLike = likes.find(
          (like) => String(like.userID) === String(currentUserId),
        );
        const targetLikeId = existingLike?.likeID || existingLike?.id;

        if (targetLikeId) {
          await removeLikeMutation.mutateAsync({
            likeId: targetLikeId,
            postId: currentPostId,
          });
          await refetchLikes();
        }
      } else {
        await addLikeMutation.mutateAsync({
          postId: currentPostId,
          userId: currentUserId,
        });
        await refetchLikes();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (contentString) => {
    try {
      await createCommentMutation.mutateAsync({
        postId: currentPostId,
        userId: currentUserId,
        content: contentString,
      });
      await refetchComments();
    } catch (error) {
      console.error(error);
    }
  };

  // --- SAVE ACTION SUITE ---
  const triggerSaveCheck = (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setShowSaveConfirm(true);
  };

  const handleSaveEditFinal = () => {
    try {
      updatePostMutation.mutate({
        postId: currentPostId,
        content: editContent.trim(),
      });
      setIsEditing(false);
      setShowSaveConfirm(false);
    } catch (err) {
      console.error(err);
    }
  };

  // --- DELETE ACTION SUITE ---
  const handleLabelDeleteFinal = () => {
    try {
      deletePostMutation.mutate(currentPostId);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const authorName =
    post?.user?.username || post?.username || `User #${post?.userID}`;
  const handle = (
    post?.user?.username ||
    post?.username ||
    "user"
  ).toLowerCase();

  return (
    <Card
      id={currentPostId ? `post-${currentPostId}` : undefined}
      style={{ padding: "1.25rem 1.5rem" }}
      className="border-0 shadow-sm rounded-4"
    >
      {/* Header row */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <Avatar
            src={post?.user?.profile_picture}
            username={authorName}
            size={40}
          />
          <div className="d-flex flex-column">
            <span
              className="fw-bold text-dark"
              style={{ fontSize: "0.95rem", lineHeight: 1.2 }}
            >
              {authorName}
            </span>
            <span className="text-muted" style={{ fontSize: "0.78rem" }}>
              @{handle} ·{" "}
              {post?.timestamp && post.timestamp !== "NOW()"
                ? new Date(post.timestamp).toLocaleDateString()
                : "Just now"}
            </span>
          </div>
        </div>

        {isAuthor && (
          <div className="dropdown">
            <button
              type="button"
              className="btn btn-link text-muted p-1 rounded-circle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-three-dots fs-5"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm rounded-3">
              <li>
                <button
                  className="dropdown-item d-flex align-items-center small fw-semibold"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="bi bi-pencil me-2 text-primary"></i>Edit Post
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item d-flex align-items-center small fw-semibold text-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <i className="bi bi-trash me-2"></i>Delete Post
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        {isEditing ? (
          <div className="fade-up">
            <textarea
              className="form-control mb-2 rounded-3"
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-sm btn-light rounded-3 fw-semibold px-3"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-3 px-3 fw-semibold"
                onClick={triggerSaveCheck}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p
            className="text-dark-emphasis m-0"
            style={{
              fontSize: "1.02rem",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}
          >
            {post?.content}
          </p>
        )}
      </div>

      {/* Action row */}
      <div className="d-flex align-items-center justify-content-between pt-2 border-top">
        <LikeButton
          isLiked={isLiked}
          likesCount={likes.length}
          onToggle={handleLikeToggle}
        />
        <button
          type="button"
          className="btn btn-link text-decoration-none p-1 px-2 rounded-3 d-flex align-items-center text-muted gap-2 border-0"
          onClick={() => setShowComments(!showComments)}
        >
          <i
            className={`bi ${showComments ? "bi-chat-fill text-primary" : "bi-chat"} fs-5`}
          ></i>
          <span
            className={`small fw-bold ${showComments ? "text-primary" : "text-secondary"}`}
          >
            {comments.length}
          </span>
        </button>
        <ShareButton postId={currentPostId} />
        <SaveButton />
      </div>

      {showComments && (
        <div className="fade-up mt-3 pt-3 border-top">
          <CommentForm postId={currentPostId} onSubmit={handleCommentSubmit} />
          <div className="mt-2">
            <CommentList comments={comments} onRefresh={refetchComments} />
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM SAVE CHANGES ================= */}
      <Modal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        title="Save Modifications?"
      >
        <div className="text-center py-2">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle"
            style={{ width: "56px", height: "56px" }}
          >
            <i className="bi bi-cloud-arrow-up fs-3"></i>
          </div>
          <p
            className="text-secondary-emphasis fw-medium mb-1 px-2"
            style={{ fontSize: "1.05rem" }}
          >
            Do you want to save changes?
          </p>
          <p className="text-muted small px-3 mb-4">
            This action will rewrite the existing timeline content instantly.
          </p>
          <div className="d-flex gap-2 justify-content-center border-top pt-3 w-100">
            <button
              type="button"
              className="btn btn-light px-4 rounded-3 fw-semibold text-secondary"
              style={{ minWidth: "110px" }}
              onClick={() => setShowSaveConfirm(false)}
            >
              Discard
            </button>
            <button
              type="button"
              className="btn text-white px-4 rounded-3 fw-semibold shadow-sm"
              style={{
                background: "var(--primary-gradient)",
                border: "none",
                minWidth: "110px",
              }}
              onClick={handleSaveEditFinal}
            >
              Save Content
            </button>
          </div>
        </div>
      </Modal>

      {/* ================= MODAL: CONFIRM DELETE POST ================= */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Permanently Delete Post?"
      >
        <div className="text-center py-2">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle"
            style={{ width: "56px", height: "56px" }}
          >
            <i className="bi bi-exclamation-triangle fs-3"></i>
          </div>
          <p
            className="text-secondary-emphasis fw-medium mb-1 px-2"
            style={{ fontSize: "1.05rem" }}
          >
            Are you absolutely sure?
          </p>
          <p className="text-muted small px-3 mb-4">
            This process cannot be undone. This post will be wiped from your
            friends' feeds forever.
          </p>
          <div className="d-flex gap-2 justify-content-center border-top pt-3 w-100">
            <button
              type="button"
              className="btn btn-light px-4 rounded-3 fw-semibold text-secondary"
              style={{ minWidth: "110px" }}
              onClick={() => setShowDeleteConfirm(false)}
            >
              Keep Post
            </button>
            <button
              type="button"
              className="btn btn-danger px-4 rounded-3 fw-semibold shadow-sm"
              style={{ minWidth: "110px" }}
              onClick={handleLabelDeleteFinal}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
