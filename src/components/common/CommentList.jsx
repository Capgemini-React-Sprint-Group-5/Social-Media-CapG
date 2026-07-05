import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../store/index.js'
import { useDeleteComment } from '../../hooks/useComments.js'
import Avatar from './Avatar.jsx'

export default function CommentList({ comments = [], onRefresh }) {
  const currentUser = useSelector(selectCurrentUser)
  const currentUserId = currentUser?.userID || currentUser?.userId || currentUser?.id
  const deleteCommentMutation = useDeleteComment()

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete your comment?')) {
      try {
        await deleteCommentMutation.mutateAsync(commentId)
        if (onRefresh) onRefresh() 
      } catch (err) {
        console.error(err)
      }
    }
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-2 rounded-3" style={{ backgroundColor: 'rgba(0,0,0,0.01)' }}>
        <p className="text-muted small m-0">No comments yet.</p>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-3 overflow-y-auto mt-2 px-1" style={{ maxHeight: '320px' }}>
      {comments.map((comment) => {
        const commentId = comment.commentID || comment.id
        const commentatorId = comment.userID || comment.userId
        const commentatorName = comment.user?.username || comment.username || `User #${commentatorId}`
        const displayCommentBody = comment.comment_text || comment.content
        const isCommentAuthor = String(commentatorId) === String(currentUserId)

        return (
          <div key={commentId} className="d-flex align-items-start gap-2 fade-up">
            {/* Tiny, clean avatar right next to the text */}
            <div className="flex-shrink-0 mt-0.5">
              <Avatar src={comment.user?.profile_picture} username={commentatorName} size={32} />
            </div>
            
            <div className="flex-grow-1">
              {/* Main Comment Text Bubble */}
              <div 
                className="py-1.5 px-3 rounded-4 d-inline-block"
                style={{ 
                  backgroundColor: '#f2f3f5', 
                  maxWidth: '100%'
                }}
              >
                <span className="fw-extrabold text-dark me-2" style={{ fontSize: '0.88rem', fontWeight: '800' }}>
                  {commentatorName}
                </span>
                <span className="text-dark-emphasis" style={{ fontSize: '0.88rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                  {displayCommentBody}
                </span>
              </div>
              
              {/* Metadata Sub-Row (Sits neatly underneath the bubble just like IG/FB) */}
              <div className="d-flex align-items-center gap-3 mt-1 ps-2 text-muted" style={{ fontSize: '0.72rem', fontWeight: '600' }}>
                <span>
                  {comment.timestamp && comment.timestamp !== 'NOW()' ? new Date(comment.timestamp).toLocaleDateString() : 'Just now'}
                </span>
                
                {isCommentAuthor && (
                  <button 
                    type="button"
                    className="btn btn-link p-0 text-danger border-0 fw-bold text-decoration-none" 
                    onClick={() => handleDeleteComment(commentId)}
                    style={{ fontSize: '0.72rem', boxShadow: 'none' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}