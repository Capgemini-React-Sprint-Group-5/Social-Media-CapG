import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/index.js'
import { useGroup, useGroupMessages, useSendGroupMessage } from '../hooks/useGroups.js'
import Loader from '../components/common/Loader.jsx'
import { useState } from 'react'

/**
 * GroupChatPage  — Owner: E (with pattern borrowed from D's MessagesPage)
 *
 * TODO (E):
 *  - Reuse MessageBubble component from D once available
 *  - Show member list in sidebar
 *  - Admin controls (remove member, delete group) if current user is admin
 */
export default function GroupChatPage() {
  const { groupId }  = useParams()
  const currentUser  = useSelector(selectCurrentUser)
  const userId       = currentUser?.userId
  const [text, setText] = useState('')

  const { data: group,    isLoading: loadingGroup    } = useGroup(groupId)
  const { data: messages, isLoading: loadingMessages } = useGroupMessages(groupId)
  const { mutate: send,   isPending: sending          } = useSendGroupMessage()

  const handleSend = () => {
    if (!text.trim()) return
    send({ groupId, userId, messageData: { message_text: text } })
    setText('')
  }

  if (loadingGroup) return <Loader />

  return (
    <div className="d-flex flex-column" style={{ height: '75vh' }}>
      <h5 className="mb-3"># {group?.groupName}</h5>

      <div className="flex-grow-1 border rounded p-3 overflow-auto mb-2">
        {loadingMessages ? <Loader size="sm" /> : (
          messages?.map((m) => (
            <div key={m.messageId} className={`mb-2 ${m.senderID == userId ? 'text-end' : ''}`}>
              <span className="badge bg-secondary">{m.message_text}</span>
            </div>
          ))
        )}
      </div>

      <div className="d-flex gap-2">
        <input
          className="form-control"
          placeholder="Message group…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
          Send
        </button>
      </div>
    </div>
  )
}
