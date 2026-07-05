export default function Card({ children, className = '' }) {
  return (
    <div className={`card shadow-sm p-4 ${className}`} style={{ borderRadius: '22px', background: 'white' }}>
      {children}
    </div>
  )
}