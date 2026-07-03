import Avatar from './Avatar.jsx'

/**
 * MessageBubble
 * Renders an individual message bubble in a chat window.
 * Aligns own messages to the right, and other users' messages to the left with an avatar.
 */
export default function MessageBubble({ message, currentUserId, sender, formatTime }) {
  const isOwn = Number(message.senderID) === Number(currentUserId)
  const senderName = sender?.username || `User ${message.senderID}`

  return (
    <div className={`chat-bubble-container ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <div className="me-2 align-self-end mb-1">
          <Avatar username={senderName} src={sender?.profile_picture} size={32} />
        </div>
      )}
      <div className="chat-bubble">
        {!isOwn && <span className="chat-bubble-sender">{senderName}</span>}
        <div>{message.message_text}</div>
        <span className="chat-bubble-meta">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  )
}
