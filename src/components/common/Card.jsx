export default function Card({ children, className = '', style = {}, ...rest }) {
  return (
    <div
      className={`card shadow-sm p-4 ${className}`}
      style={{ borderRadius: '22px', background: 'white', ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}