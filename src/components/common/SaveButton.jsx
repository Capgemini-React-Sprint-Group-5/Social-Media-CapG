import { useState } from 'react'

export default function SaveButton() {
  const [isSaved, setIsSaved] = useState(false)

  return (
    <button 
      onClick={() => setIsSaved(!isSaved)}
      type="button"
      className="btn btn-link text-decoration-none p-1 px-2 rounded-3 d-flex align-items-center text-muted gap-2 border-0 shadow-none"
      style={{ backgroundColor: isSaved ? 'rgba(234, 179, 8, 0.08)' : 'transparent', transition: 'all 0.2s ease' }}
    >
      {/* Enforces the bookmark icon clearly */}
      <i className={`bi ${isSaved ? 'bi-bookmark-fill text-warning' : 'bi-bookmark'} fs-5`}></i>
      <span className={`small fw-bold ${isSaved ? 'text-warning' : 'text-secondary'}`}>
        {isSaved ? 'Saved' : 'Save'}
      </span>
    </button>
  )
}