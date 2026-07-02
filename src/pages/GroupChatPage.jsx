import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { selectCurrentUser } from '../store/index.js'
import {
  useGroup,
  useGroupMessages,
  useSendGroupMessage,
  useGroupMembers,
  useJoinGroup,
  useLeaveGroup
} from '../hooks/useGroups.js'
import { useAllUsers } from '../hooks/useUsers.js'
import Loader from '../components/common/Loader.jsx'
import Avatar from '../components/common/Avatar.jsx'
import Modal from '../components/common/Modal.jsx'

/**
 * GroupChatPage
 * Dual-panel view: Left is the chat room, Right is group info/member sidebar.
 * Includes admin-only controls for adding and removing group members.
 */
export default function GroupChatPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const userId = currentUser?.userId

  const [text, setText] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [memberToRemove, setMemberToRemove] = useState(null)

  const messagesEndRef = useRef(null)

  const { data: group, isLoading: loadingGroup } = useGroup(groupId)
  const { data: messages, isLoading: loadingMessages } = useGroupMessages(groupId)
  const { data: members, isLoading: loadingMembers } = useGroupMembers(groupId)
  const { data: allUsers } = useAllUsers()

  const { mutate: send, isPending: sending } = useSendGroupMessage()
  const { mutate: join, isPending: addingMember } = useJoinGroup()
  const { mutate: leave, isPending: removingMember } = useLeaveGroup()

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages) {
      scrollToBottom()
    }
  }, [messages])

  if (loadingGroup) return <Loader />
  if (!group) return <div className="alert alert-warning m-4">Group not found.</div>

  const isOwner = Number(group.adminID) === Number(userId)

  // Map of all users for quick lookup of details (username, profile picture)
  const userMap = new Map()
  if (Array.isArray(allUsers)) {
    allUsers.forEach((u) => userMap.set(Number(u.userID), u))
  }

  // Filter out users who are already group members to populate "Add Member" modal
  const currentMemberIds = new Set(members?.map((m) => Number(m.userID)) || [])
  const nonMembersList =
    allUsers?.filter((u) => {
      // Exclude current members
      if (currentMemberIds.has(Number(u.userID))) return false
      // Match query
      if (searchQuery.trim()) {
        return u.username.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    }) || []

  const handleSend = () => {
    if (!text.trim()) return
    send({ groupId, userId, messageData: { message_text: text } })
    setText('')
  }

  const formatTime = (isoString) => {
    if (!isoString || isoString === 'NOW()') return 'Just now'
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return ''
    }
  }

  const handleAddMember = (targetUserId) => {
    join(
      { groupId, userId: targetUserId },
      {
        onSuccess: () => {
          // Keep modal open, just reset query
          setSearchQuery('')
        },
      }
    )
  }

  // Removed handleRemoveMember to use custom modal instead

  return (
    <div className="container-fluid page-container px-0">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-light border-bottom py-2 px-3 mb-3 d-flex align-items-center justify-content-between">
        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => navigate('/groups')}>
          <i className="bi bi-arrow-left"></i>
          <span>Back to Groups</span>
        </button>
        <span className="badge bg-secondary font-monospace">Group Chat Room</span>
      </div>

      <div className="row g-3">
        {/* ================= LEFT/CENTER PANEL: CHAT INTERFACE ================= */}
        <div className="col-lg-8 col-xl-9 d-flex flex-column">
          <div className="card shadow-sm border-0 glass-card">
            <div className="card-header bg-primary-subtle border-0 py-3 px-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-chat-left-text-fill text-primary fs-5"></i>
                <h5 className="mb-0 fw-bold text-dark"># {group.groupName}</h5>
              </div>
              <span className="badge bg-primary rounded-pill font-monospace">{messages?.length || 0} messages</span>
            </div>

            {/* Scrollable messages area */}
            <div
              className="card-body p-4 scrollable-panel"
              style={{ height: '55vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}
            >
              {loadingMessages ? (
                <Loader size="sm" />
              ) : messages?.length === 0 ? (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                  <i className="bi bi-chat-dots fs-1 mb-2"></i>
                  <p className="mb-0">No messages in this community yet.</p>
                  <p className="small text-muted">Be the first to say hello!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isOwn = Number(m.senderID) === Number(userId)
                  const sender = userMap.get(Number(m.senderID))
                  const senderName = sender?.username || `User ${m.senderID}`

                  return (
                    <div key={m.messageID || m.id} className={`chat-bubble-container ${isOwn ? 'own' : 'other'}`}>
                      {!isOwn && (
                        <div className="me-2 align-self-end mb-1">
                          <Avatar username={senderName} src={sender?.profile_picture} size={32} />
                        </div>
                      )}
                      <div className="chat-bubble">
                        {!isOwn && <span className="chat-bubble-sender">{senderName}</span>}
                        <div>{m.message_text}</div>
                        <span className="chat-bubble-meta">{formatTime(m.timestamp)}</span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input field area */}
            <div className="card-footer bg-white border-top-0 p-3">
              <div className="d-flex gap-2">
                <input
                  className="form-control px-3"
                  placeholder={`Message #${group.groupName}...`}
                  style={{ borderRadius: '24px' }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  className="btn btn-primary d-flex align-items-center justify-content-center gap-1 shadow-sm px-4"
                  style={{ borderRadius: '24px' }}
                  onClick={handleSend}
                  disabled={sending || !text.trim()}
                >
                  <i className="bi bi-send-fill"></i>
                  <span className="d-none d-md-inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL: GROUP DETS & MEMBERS ================= */}
        <div className="col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 glass-card p-3 h-100">
            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Group Details</h6>

            <div className="mb-4">
              <label className="text-muted small d-block">Group Owner</label>
              <span className="fw-semibold text-secondary">
                {userMap.get(Number(group.adminID))?.username || `User ${group.adminID}`}
              </span>
            </div>

            <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
              <h6 className="fw-bold text-dark mb-0">
                Members
                <span className="badge bg-secondary ms-2 rounded-pill font-monospace">
                  {members?.length || 0}
                </span>
              </h6>
              {isOwner && (
                <button
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <i className="bi bi-person-plus"></i>
                  <span>Add</span>
                </button>
              )}
            </div>

            {/* Member List */}
            <div
              className="scrollable-panel"
              style={{ maxHeight: '42vh', overflowY: 'auto' }}
            >
              {loadingMembers ? (
                <Loader size="sm" />
              ) : (
                members?.map((m) => {
                  const isMemberAdmin = Number(m.userID) === Number(group.adminID)

                  return (
                    <div
                      key={m.userID}
                      className="d-flex align-items-center justify-content-between p-2 member-item mb-1"
                    >
                      <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: '80%' }}>
                        <Avatar username={m.username} src={m.profile_picture} size={32} />
                        <span className="text-dark fw-semibold text-truncate small" title={m.username}>
                          {m.username}
                        </span>
                        {isMemberAdmin && <span className="admin-badge ms-1">Admin</span>}
                      </div>

                      {isOwner && !isMemberAdmin && (
                        <button
                          className="btn btn-outline-danger border-0 btn-sm py-0 px-2"
                          onClick={() => setMemberToRemove(m)}
                          disabled={removingMember}
                          title="Remove Member"
                        >
                          <i className="bi bi-person-dash fs-5"></i>
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Members Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Invite Members">
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div
          className="scrollable-panel"
          style={{ maxHeight: '300px', overflowY: 'auto' }}
        >
          {nonMembersList.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              No matching users found to invite.
            </div>
          ) : (
            nonMembersList.map((u) => (
              <div
                key={u.userID}
                className="d-flex align-items-center justify-content-between p-2 border-bottom"
              >
                <div className="d-flex align-items-center gap-2">
                  <Avatar username={u.username} src={u.profile_picture} size={32} />
                  <span className="fw-semibold small text-dark">{u.username}</span>
                </div>
                <button
                  className="btn btn-primary btn-sm px-3 py-1"
                  style={{ borderRadius: '16px' }}
                  onClick={() => handleAddMember(u.userID)}
                  disabled={addingMember}
                >
                  Invite
                </button>
              </div>
            ))
          )}
        </div>

        <div className="d-flex justify-content-end pt-3 border-top mt-3">
          <button className="btn btn-secondary btn-sm" onClick={() => setIsAddModalOpen(false)}>
            Close
          </button>
        </div>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal isOpen={!!memberToRemove} onClose={() => setMemberToRemove(null)} title="Remove Member">
        <div className="mb-3">
          Are you sure you want to remove <strong>{memberToRemove?.username}</strong> from the group?
        </div>
        <div className="d-flex justify-content-end gap-2 pt-2 border-top">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setMemberToRemove(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm px-4"
            disabled={removingMember}
            onClick={() => {
              leave(
                { groupId, userId: memberToRemove?.userID },
                {
                  onSuccess: () => {
                    setMemberToRemove(null)
                  },
                }
              )
            }}
          >
            {removingMember ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
