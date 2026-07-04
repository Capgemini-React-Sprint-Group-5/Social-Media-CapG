import { useState } from 'react'

export default function ShareButton({ postId }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/Posts/${postId}`
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <button 
      onClick={handleShare}
      type="button"
      className="btn btn-link text-decoration-none p-1 px-2 rounded-3 d-flex align-items-center text-muted gap-2 border-0 shadow-none"
      style={{ backgroundColor: copied ? 'rgba(22, 163, 74, 0.08)' : 'transparent' }}
    >
      <i className={`bi ${copied ? 'bi-check2 text-success' : 'bi-share'} fs-5`}></i>
      <span className={`small fw-bold ${copied ? 'text-success' : 'text-secondary'}`}>
        {copied ? 'Copied!' : 'Share'}
      </span>
    </button>
  )
}