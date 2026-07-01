/**
 * Card
 * Thin wrapper around Bootstrap card.
 * Usage: <Card className="mb-3"><p>content</p></Card>
 */
export default function Card({ children, className = '' }) {
  return (
    <div className={`card shadow-sm ${className}`}>
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}
