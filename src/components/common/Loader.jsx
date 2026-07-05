export default function Loader({ size = '' }) {
  const spinnerClass = size === 'sm'
    ? 'spinner-border spinner-border-sm'
    : 'spinner-border'

  return (
    <div className="d-flex justify-content-center align-items-center py-4">
      <div className={spinnerClass} role="status">
        <span className="visually-hidden">Loading…</span>
      </div>
    </div>
  )
}
