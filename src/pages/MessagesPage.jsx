import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, selectActiveThread } from '../store/index.js'
import { setActiveThread } from '../store/slices/uiSlice.js'
import { useFriends } from '../hooks/useFriends.js'
import { useConversation, useSendMessage } from '../hooks/useMessages.js'
import Loader from '../components/common/Loader.jsx'
import Avatar from '../components/common/Avatar.jsx'
import { useState } from 'react'

/**
 * MessagesPage  — Owner: D
 * Two-panel layout: left = friends list, right = active thread.
 * Active thread stored in Redux uiSlice.activeThread (otherUserId).
 * Route /messages/:otherUserId also pre-selects a thread.
 *
 * TODO (D):
 *  - Build message bubble components (sent/received alignment)
 *  - Scroll to bottom on new message
 *  - Show message timestamp + edit/delete on hover
 */
export default function MessagesPage() {
  const { otherUserId: routeUserId } = useParams()
  const dispatch    = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const activeId    = useSelector(selectActiveThread) || routeUserId
  const userId      = currentUser?.userId
  const [text, setText] = useState('')

  const { data: friends, isLoading: loadingFriends } = useFriends(userId)
  const { data: messages, isLoading: loadingThread  } = useConversation(userId, activeId)
  const { mutate: send, isPending: sending           } = useSendMessage()

  const handleSend = () => {
    if (!text.trim() || !activeId) return
    send({ userId, otherUserId: activeId, messageData: { message_text: text } })
    setText('')
  }

  return (
    <div className="d-flex gap-3" style={{ height: '75vh' }}>

      {/* Left panel — friend list */}
      <div className="border rounded p-2" style={{ width: 240, overflowY: 'auto' }}>
        <h6 className="mb-2">Conversations</h6>
        {loadingFriends ? <Loader size="sm" /> : (
          friends?.map((f) => (
            <div
              key={f.friendId}
              className={`d-flex align-items-center gap-2 p-2 rounded mb-1 ${activeId == f.friendId ? 'bg-primary text-white' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => dispatch(setActiveThread(f.friendId))}
            >
              <Avatar username={f.username} size={32} />
              <span className="text-truncate">{f.username}</span>
            </div>
          ))
        )}
      </div>

      {/* Right panel — message thread */}
      <div className="flex-grow-1 border rounded d-flex flex-column">
        <div className="flex-grow-1 p-3 overflow-auto">
          {!activeId && <p className="text-muted">Select a conversation.</p>}
          {loadingThread ? <Loader size="sm" /> : (
            messages?.map((m) => (
              // TODO: replace with MessageBubble component
              <div key={m.messageId} className={`mb-2 ${m.senderID == userId ? 'text-end' : ''}`}>
                <span className="badge bg-secondary">{m.message_text}</span>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        {activeId && (
          <div className="d-flex gap-2 p-2 border-top">
            <input
              className="form-control"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
