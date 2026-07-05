import { useState } from 'react'

export default function LikeButton({ isLiked, likesCount, onToggle }) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLikeClick = async (e) => {
    e.preventDefault()
    if (typeof onToggle !== 'function') return

    setIsAnimating(true)
    try {
      // Execute the parent trigger chain inside PostCard.jsx
      await onToggle() 
    } catch (error) {
      console.error("Like action failed:", error)
    } finally {
      setTimeout(() => setIsAnimating(false), 200)
    }
  }

  return (
    <div className="d-flex align-items-center">
      <button 
        onClick={handleLikeClick}
        type="button"
        className="btn btn-link text-decoration-none p-0 me-2 d-flex align-items-center border-0 shadow-none"
        style={{
          transform: isAnimating ? 'scale(1.25)' : 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {isLiked ? (
          // Filled red heart icon if liked
          <i className="bi bi-heart-fill text-danger fs-5"></i>
        ) : (
          // Muted outline heart icon if not liked
          <i className="bi bi-heart text-muted fs-5"></i>
        )}
      </button>
      
      <span className="fw-bold text-secondary small" style={{ userSelect: 'none' }}>
        {likesCount} {likesCount === 1 || likesCount===0 ? 'like' : 'likes'}
      </span>
    </div>
  )
}