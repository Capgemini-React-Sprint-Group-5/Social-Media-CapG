import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectCurrentUser } from '../../store/index.js'
import { usePostLikes, useAddLike, useRemoveLike } from '../../hooks/useLikes.js'
import { usePostComments, useAddComment, useUpdateComment, useDeleteComment } from '../../hooks/useComments.js'
import { useAllUsers } from '../../hooks/useUsers.js'
import Avatar from './Avatar.jsx'
import Card from './Card.jsx'
import Modal from './Modal.jsx'

export default function PostCard({ post }) {
  const currentUser = useSelector(selectCurrentUser)
  const { data: users = [] } = useAllUsers()
  
  // Likes Queries & Mutations
  const { data: likes = [], isLoading: loadingLikes } = usePostLikes(post.postID)
  const { mutate: addLike } = useAddLike()
  const { mutate: removeLike } = useRemoveLike()
  
  // Comments Queries & Mutations
  const { data: comments = [], isLoading: loadingComments } = usePostComments(post.postID)
  const { mutate: addComment, isPending: addingComment } = useAddComment()
  const { mutate: editComment } = useUpdateComment()
  const { mutate: deleteComment } = useDeleteComment()

  // State
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingText, setEditingText] = useState('')

  // Lookups
  const findUser = (id) => {
    return users.find((u) => Number(u.userID) === Number(id) || Number(u.id) === Number(id))
  }

  const postAuthor = findUser(post.userID)
  const isLiked = likes.some((l) => Number(l.userID) === Number(currentUser?.userId))
  const userLike = likes.find((l) => Number(l.userID) === Number(currentUser?.userId))

  // Handlers
  const handleLikeToggle = () => {
    if (isLiked && userLike) {
      removeLike({ likeId: userLike.likeID || userLike.id, postId: post.postID })
    } else {
      addLike({ postId: post.postID, userId: currentUser.userId })
    }
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const commentId = Date.now()
    addComment({
      postId: post.postID,
      commentData: {
        id: commentId,
        commentID: commentId,
        postID: post.postID,
        userID: currentUser.userId,
        comment_text: commentText.trim(),
        timestamp: new Date().toISOString()
      }
    }, {
      onSuccess: () => setCommentText('')
    })
  }

  const handleSaveEdit = (commentId) => {
    if (!editingText.trim()) return
    editComment({
      commentId,
      postId: post.postID,
      commentData: {
        comment_text: editingText.trim()
      }
    }, {
      onSuccess: () => {
        setEditingCommentId(null)
        setEditingText('')
      }
    })
  }

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment({ commentId, postId: post.postID })
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'NOW()') return 'Just now'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Recent'
    }
  }

  return (
    <Card className="mb-4 border-0 shadow-sm rounded-3 overflow-hidden">
      {/* Post Header */}
      <div className="d-flex align-items-center mb-3">
        <Link to={`/profile/${post.userID}`} className="text-decoration-none">
          <Avatar src={postAuthor?.profile_picture} username={postAuthor?.username} size={44} />
        </Link>
        <div className="ms-3">
          <Link to={`/profile/${post.userID}`} className="text-decoration-none text-dark fw-bold hover-primary">
            {postAuthor?.username || 'Loading...'}
          </Link>
          <div className="text-muted small">{formatDate(post.timestamp)}</div>
        </div>
      </div>

      {/* Post Body */}
      <p className="card-text fs-6 text-dark-emphasis mb-3" style={{ whiteSpace: 'pre-wrap' }}>
        {post.content}
      </p>

      {/* Action Stats & Buttons */}
      <div className="d-flex align-items-center justify-content-between pt-2 border-top border-bottom py-2 mb-3">
        {/* Likes Stat & Trigger */}
        <div className="d-flex align-items-center">
          <button 
            onClick={handleLikeToggle}
            className="btn btn-link text-decoration-none p-0 me-2 d-flex align-items-center"
            style={{ transition: 'transform 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isLiked ? (
              <i className="bi bi-heart-fill text-danger fs-5"></i>
            ) : (
              <i className="bi bi-heart text-muted fs-5"></i>
            )}
          </button>
          <span 
            className="fw-semibold text-muted small cursor-pointer"
            style={{ cursor: likes.length > 0 ? 'pointer' : 'default' }}
            onClick={() => likes.length > 0 && setShowLikesModal(true)}
          >
            {likes.length} {likes.length === 1 ? 'like' : 'likes'}
          </span>
        </div>

        {/* Comments Stat */}
        <div className="d-flex align-items-center text-muted small fw-semibold">
          <i className="bi bi-chat-left-text me-2 fs-5"></i>
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
      </div>

      {/* Comments List */}
      <div className="comments-section bg-light rounded-3 p-3 mb-3">
        {loadingComments ? (
          <div className="text-center py-2 text-muted small">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-muted small text-center py-2">No comments yet. Be the first to share your thoughts!</div>
        ) : (
          <div className="d-flex flex-column gap-3 mb-3 max-vh-50 overflow-auto pe-1">
            {comments.map((comment) => {
              const commentUser = findUser(comment.userID)
              const isOwner = Number(comment.userID) === Number(currentUser?.userId)
              const isEditing = editingCommentId === comment.commentID

              return (
                <div key={comment.commentID || comment.id} className="d-flex align-items-start gap-2">
                  <Link to={`/profile/${comment.userID}`} className="text-decoration-none">
                    <Avatar src={commentUser?.profile_picture} username={commentUser?.username} size={32} />
                  </Link>
                  <div className="flex-grow-1 bg-white p-2 rounded-3 shadow-sm border border-light">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <Link to={`/profile/${comment.userID}`} className="text-decoration-none text-dark fw-bold small">
                        {commentUser?.username || 'Loading...'}
                      </Link>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {formatDate(comment.timestamp)}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-1">
                        <textarea
                          className="form-control form-control-sm mb-2"
                          rows={2}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                        />
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => setEditingCommentId(null)}
                          >
                            Cancel
                          </button>
                          <button 
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => handleSaveEdit(comment.commentID)}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mb-0 text-dark-emphasis small" style={{ whiteSpace: 'pre-wrap' }}>
                        {comment.comment_text}
                      </p>
                    )}
                  </div>

                  {/* Comment Actions (Edit/Delete) */}
                  {isOwner && !isEditing && (
                    <div className="d-flex flex-column gap-1">
                      <button 
                        className="btn btn-link text-muted p-0 hover-primary"
                        onClick={() => {
                          setEditingCommentId(comment.commentID)
                          setEditingText(comment.comment_text)
                        }}
                        title="Edit Comment"
                      >
                        <i className="bi bi-pencil-square" style={{ fontSize: '0.85rem' }}></i>
                      </button>
                      <button 
                        className="btn btn-link text-danger p-0"
                        onClick={() => handleDeleteComment(comment.commentID)}
                        title="Delete Comment"
                      >
                        <i className="bi bi-trash" style={{ fontSize: '0.85rem' }}></i>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="d-flex gap-2 align-items-center mt-2">
          <Avatar src={currentUser?.profile_picture} username={currentUser?.username} size={32} />
          <div className="input-group">
            <input
              type="text"
              placeholder="Write a comment..."
              className="form-control form-control-sm rounded-pill px-3 border-light shadow-sm"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={addingComment}
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-sm rounded-pill ms-2 px-3 shadow-sm d-flex align-items-center"
              disabled={addingComment || !commentText.trim()}
            >
              {addingComment ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <span className="d-none d-sm-inline me-1">Send</span>
                  <i className="bi bi-send-fill" style={{ fontSize: '0.8rem' }}></i>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Likes Modal */}
      <Modal isOpen={showLikesModal} onClose={() => setShowLikesModal(false)} title="Likes">
        {loadingLikes ? (
          <div className="text-center py-3 text-muted">Loading likes...</div>
        ) : (
          <div className="d-flex flex-column gap-3 max-vh-50 overflow-auto px-1 py-2">
            {likes.map((like) => {
              const likeUser = findUser(like.userID)
              return (
                <div key={like.likeID || like.id} className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <Link to={`/profile/${like.userID}`} onClick={() => setShowLikesModal(false)} className="text-decoration-none">
                      <Avatar src={likeUser?.profile_picture} username={likeUser?.username} size={36} />
                    </Link>
                    <Link to={`/profile/${like.userID}`} onClick={() => setShowLikesModal(false)} className="text-decoration-none text-dark fw-bold">
                      {likeUser?.username || 'Loading...'}
                    </Link>
                  </div>
                  <span className="text-muted small">{formatDate(like.timestamp)}</span>
                </div>
              )
            })}
          </div>
        )}
      </Modal>
    </Card>
  )
}
