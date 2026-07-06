import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../store/index.js'

import { usePostLikes, useAddLike, useRemoveLike } from '../../hooks/useLikes.js'
import { usePostComments, useAddComment } from '../../hooks/useComments.js'
import { useUpdatePost, useDeletePost } from '../../hooks/usePosts.js'

import Avatar from './Avatar.jsx'
import Card from './Card.jsx'
import CommentList from './CommentList.jsx'
import CommentForm from './CommentForm.jsx'
import LikeButton from './LikeButton.jsx'
import ShareButton from './ShareButton.jsx'
import SaveButton from './SaveButton.jsx'
import Modal from './Modal.jsx'

export default function PostCard({ post }) {
  const currentUser = useSelector(selectCurrentUser)
  
  const currentUserId = currentUser?.userId || currentUser?.userID || currentUser?.id
  const currentPostId = post?.postID || post?.id

  const [showComments, setShowComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post?.content || '')
  
  // Custom states replacing native alerts completely
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: likesData = [], refetch: refetchLikes } = usePostLikes(currentPostId)
  const { data: comments = [], refetch: refetchComments } = usePostComments(currentPostId)

  const addLikeMutation = useAddLike()
  const removeLikeMutation = useRemoveLike()
  const createCommentMutation = useAddComment()
  const updatePostMutation = useUpdatePost()
  const deletePostMutation = useDeletePost()

  const likes = Array.isArray(likesData) ? likesData : (likesData?.data || [])
  const isLiked = likes.some((like) => String(like.userID) === String(currentUserId))
  
  const postAuthorId = post?.userID || post?.userId || post?.user?.userID || post?.user?.userId
  const isAuthor = String(postAuthorId) === String(currentUserId)

  const handleLikeToggle = async () => {
    if (!currentUserId || !currentPostId) return
    try {
      if (isLiked) {
        const existingLike = likes.find((like) => String(like.userID) === String(currentUserId))
        const targetLikeId = existingLike?.likeID || existingLike?.id 
        
        if (targetLikeId) {
          await removeLikeMutation.mutateAsync({ likeId: targetLikeId, postId: currentPostId })
          await refetchLikes() 
        }
      } else {
        await addLikeMutation.mutateAsync({ postId: currentPostId, userId: currentUserId })
        await refetchLikes() 
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleCommentSubmit = async (contentString) => {
    try {
      await createCommentMutation.mutateAsync({
        postId: currentPostId,
        userId: currentUserId,
        content: contentString
      })
      await refetchComments() 
    } catch (error) {
      console.error(error)
    }
  }

  // --- SAVE ACTION SUITE ---
  const triggerSaveCheck = (e) => {
    e.preventDefault()
    if (!editContent.trim()) return
    setShowSaveConfirm(true)
  }

  const handleSaveEditFinal = () => {
    try {
      updatePostMutation.mutate({ postId: currentPostId, content: editContent.trim() })
      setIsEditing(false)
      setShowSaveConfirm(false)
    } catch (err) {
      console.error(err)
    }
  }

  // --- DELETE ACTION SUITE ---
  const handleLabelDeleteFinal = () => {
    try {
      deletePostMutation.mutate(currentPostId)
      setShowDeleteConfirm(false)
    } catch (err) {
      console.error(err)
    }
  }

  const authorName = post?.user?.username || post?.username || `User #${post?.userID}`

  return (
    <Card
      id={currentPostId ? `post-${currentPostId}` : undefined}
      style={{ padding: '1.5rem', marginBottom: '1rem' }}
      className="border-0 shadow-sm rounded-4"
    >
      {/* Streamlined Horizontal Header Section */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          {/* Clean, flatter avatar layout alignment */}
          <div className="flex-shrink-0">
            <Avatar src={post?.user?.profile_picture} username={authorName} size={40} />
          </div>
          
          {/* Combined Horizontal Baseline Row */}
          <div className="d-flex align-items-baseline gap-2 ps-1">
            {/* Username signature footprint */}
            <span className="text-dark" style={{ fontSize: '0.95rem', fontWeight: '800', letterSpacing: '-0.1px' }}>
              {authorName}
            </span>
            
            {/* Subtle mid-dot divider asset */}
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>•</span>
            
            {/* Inline semantic relative timestamp signature */}
            <span className="text-muted fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.1px' }}>
              {post?.timestamp && post.timestamp !== "NOW()" ? new Date(post.timestamp).toLocaleDateString() : 'Just now'}
            </span>
          </div>
        </div>

        {isAuthor && (
          <div className="position-relative">
            <button 
              className="btn btn-link text-muted p-1 rounded-circle border-0 transition-all" 
              style={{ backgroundColor: dropdownOpen ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.02)' }} 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <i className="bi bi-three-dots fs-5"></i>
            </button>
            
            {dropdownOpen && (
              <ul 
                className="dropdown-menu dropdown-menu-end shadow border border-light rounded-3 d-block position-absolute" 
                style={{ 
                  right: 0, 
                  top: '105%', 
                  zIndex: 1000,
                  minWidth: '170px',
                  background: '#ffffff',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                }}
              >
                <li>
                  <button 
                    className="dropdown-item py-2 px-3 small fw-semibold d-flex align-items-center text-secondary" 
                    onClick={() => { setIsEditing(true); setDropdownOpen(false); }}
                  >
                    <i className="bi bi-pencil me-2 text-primary"></i>Edit Post
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider my-1 opacity-25" />
                </li>
                <li>
                  <button 
                    className="dropdown-item py-2 px-3 small fw-semibold d-flex align-items-center text-danger" 
                    onClick={() => { setShowDeleteConfirm(true); setDropdownOpen(false); }}
                  >
                    <i className="bi bi-trash me-2"></i>Delete Post
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="px-1 mb-4">
        {isEditing ? (
          <div className="fade-up">
            <textarea className="form-control mb-2 rounded-3" rows={3} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-sm btn-light rounded-3 fw-semibold px-3" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn btn-sm btn-primary rounded-3 px-3 fw-semibold" onClick={triggerSaveCheck}>Save</button>
            </div>
          </div>
        ) : (
          <p className="text-dark-emphasis m-0" style={{ fontSize: '1.02rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {post?.content}
          </p>
        )}
      </div>

      <div className="d-flex align-items-center justify-content-between px-2 py-2 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
        <LikeButton isLiked={isLiked} likesCount={likes.length} onToggle={handleLikeToggle} />
        <button 
          className="btn btn-link text-decoration-none p-1 px-2 rounded-3 d-flex align-items-center text-muted gap-2 border-0"
          style={{ transition: 'all 0.2s ease', backgroundColor: showComments ? 'rgba(79, 70, 229, 0.08)' : 'transparent' }}
          onClick={() => setShowComments(!showComments)}
        >
          <i className={`bi ${showComments ? 'bi-chat-fill text-primary' : 'bi-chat'} fs-5`}></i>
          <span className={`small fw-bold ${showComments ? 'text-primary' : 'text-secondary'}`}>{comments.length}</span>
        </button>
        <ShareButton postId={currentPostId} />
        <SaveButton />
      </div>

      {showComments && (
        <div className="fade-up mt-4 pt-3" style={{ borderTop: '1px dashed rgba(0, 0, 0, 0.08)' }}>
          <CommentForm postId={currentPostId} onSubmit={handleCommentSubmit} />
          <div className="mt-2">
            <CommentList comments={comments} onRefresh={refetchComments} />
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM SAVE CHANGES ================= */}
      <Modal isOpen={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} title="Save Modifications?">
        <div className="text-center py-2">
          <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle" style={{ width: '56px', height: '56px' }}>
            <i className="bi bi-cloud-arrow-up fs-3"></i>
          </div>
          <p className="text-secondary-emphasis fw-medium mb-1 px-2" style={{ fontSize: '1.05rem' }}>
            Do you want to save changes?
          </p>
          <p className="text-muted small px-3 mb-4">
            This action will rewrite the existing timeline content instantly.
          </p>
          <div className="d-flex gap-2 justify-content-center border-top pt-3 w-100">
            <button type="button" className="btn btn-light px-4 rounded-3 fw-semibold text-secondary" style={{ minWidth: '110px' }} onClick={() => setShowSaveConfirm(false)}>
              Discard
            </button>
            <button type="button" className="btn btn-indigo text-white px-4 rounded-3 fw-semibold shadow-sm" style={{ backgroundColor: 'var(--primary)', minWidth: '110px' }} onClick={handleSaveEditFinal}>
              Save Content
            </button>
          </div>
        </div>
      </Modal>

      {/* ================= MODAL: CONFIRM DELETE POST ================= */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Permanently Delete Post?">
        <div className="text-center py-2">
          <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle" style={{ width: '56px', height: '56px' }}>
            <i className="bi bi-exclamation-triangle fs-3"></i>
          </div>
          <p className="text-secondary-emphasis fw-medium mb-1 px-2" style={{ fontSize: '1.05rem' }}>
            Are you absolutely sure?
          </p>
          <p className="text-muted small px-3 mb-4">
            This process cannot be undone. This post will be wiped from your friends' feeds forever.
          </p>
          <div className="d-flex gap-2 justify-content-center border-top pt-3 w-100">
            <button type="button" className="btn btn-light px-4 rounded-3 fw-semibold text-secondary" style={{ minWidth: '110px' }} onClick={() => setShowDeleteConfirm(false)}>
              Keep Post
            </button>
            <button type="button" className="btn btn-danger px-4 rounded-3 fw-semibold shadow-sm" style={{ minWidth: '110px' }} onClick={handleLabelDeleteFinal}>
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </Card>
  )
}