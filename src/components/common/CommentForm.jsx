import { useState } from 'react'

export default function CommentForm({ postId, onSubmit }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      await onSubmit(content.trim())
      setContent('') // Instantly clear input upon successful addition
    } catch (err) {
      console.error('Comment dispatch block:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div 
        className="d-flex align-items-center gap-2 p-1.5 rounded-pill"
        style={{ 
          backgroundColor: 'var(--background)', 
          border: '1px solid var(--border)',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="text"
          className="form-control bg-transparent border-0 shadow-none py-1.5 px-3"
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          style={{ fontSize: '0.9rem' }}
        />
        
        <button
          type="submit"
          className="btn rounded-circle d-flex align-items-center justify-content-center border-0 p-0 shadow-sm"
          disabled={!content.trim() || isSubmitting}
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: content.trim() ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          {isSubmitting ? (
            <span className="spinner-border spinner-border-sm text-white" role="status" style={{ width: '12px', height: '12px' }} />
          ) : (
            <i className="bi bi-send-fill text-white" style={{ fontSize: '0.85rem', marginLeft: '2px' }}></i>
          )}
        </button>
      </div>
    </form>
  )
}