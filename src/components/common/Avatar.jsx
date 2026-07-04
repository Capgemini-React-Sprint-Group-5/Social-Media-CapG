export default function Avatar({ src, username = '?', size = 40 }) {
  const initials = username.slice(0, 2).toUpperCase()

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    fontSize: size * 0.38,
    lineHeight: `${size}px`,
    textAlign: 'center',
    display: 'inline-block',
    backgroundColor: '#6c757d',
    color: '#fff',
    fontWeight: 600,
    flexShrink: 0,
  }

  if (src && src !== 'profile1.jpg' && !src.startsWith('profile')) {
    return <img src={src} alt={username} style={style} />
  }

  return <span style={style}>{initials}</span>
}