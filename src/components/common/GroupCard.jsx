import { memo } from 'react'

/**
 * GroupCard
 * Renders an individual group's details, member count, ownership status, 
 * and provides context-appropriate action buttons (Join, Chat, Leave).
 */
function GroupCard({
  group,
  currentUserId,
  activeTab,
  onJoin,
  onLeave,
  onDelete,
  onNavigateToChat,
  isJoining = false,
  isLeaving = false,
  isDeleting = false,
}) {
  const currentUserIdNum = Number(currentUserId)
  const membersList = group.members || [Number(group.adminID)]
  const memberCount = membersList.length
  const isOwner = Number(group.adminID) === currentUserIdNum
  const groupId = group.id || group.groupID

  const isPrivate = Number(groupId) % 2 === 1
  const privacyText = isPrivate ? 'Private Community' : 'Public Community'
  const privacyIcon = isPrivate ? 'bi-lock-fill' : 'bi-globe'
  const privacyClass = isPrivate ? 'private' : 'public'
  const description = group.description || (isPrivate ? 'A space for members to connect, share ideas and grow together.' : 'Open group for discussions, updates and knowledge sharing.')
  const avatarClass = (Number(groupId) % 2 === 0) ? 'purple-gradient' : 'blue-gradient'

  const numericId = typeof groupId === 'string' ? groupId.charCodeAt(0) + (groupId.charCodeAt(1) || 0) : Number(groupId || 0)
  const daysAgo = (numericId % 9) + 2
  const newMessagesCount = (numericId % 14) + 3

  return (
    <div className="card glass-card h-100 border-0 shadow-sm">
      <div className="card-body d-flex flex-column p-4">
        {/* Top Info Header Row */}
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className={`group-card-avatar ${avatarClass}`}>
              <i className="bi bi-chat-left-dots-fill"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h6
                  className="card-title fw-bold text-dark mb-0 text-truncate"
                  style={{ maxWidth: '180px', cursor: 'pointer' }}
                  onClick={() => onNavigateToChat(groupId)}
                  title={group.groupName}
                >
                  {group.groupName}
                </h6>
                {isOwner && <span className="admin-badge">Admin</span>}
              </div>
              <div>
                <span className={`privacy-tag ${privacyClass}`}>
                  <i className={`bi ${privacyIcon}`}></i> {privacyText}
                </span>
              </div>
            </div>
          </div>
          <button className="btn p-0 border-0 bg-transparent" title="Options">
            <i className="bi bi-three-dots-vertical text-muted fs-5"></i>
          </button>
        </div>

        {/* Group Description */}
        <p className="text-muted small mb-3" style={{ fontSize: '0.8rem', lineHeight: '1.4', minHeight: '36px' }}>
          {description}
        </p>

        {/* Metadata Details Grid */}
        <div className="meta-info-grid pt-3 border-top">
          <div className="meta-info-item">
            <i className="bi bi-people-fill text-muted"></i>
            <span>{memberCount} {memberCount === 1 ? 'Member' : 'Members'}</span>
          </div>
          <div className="meta-info-item text-success">
            <span className="bg-success rounded-circle" style={{ width: '8px', height: '8px', display: 'inline-block' }}></span>
            <span style={{ fontWeight: 600 }}>Active now</span>
          </div>
          <div className="meta-info-item">
            <i className="bi bi-calendar-event text-muted"></i>
            <span>Created {daysAgo} days ago</span>
          </div>
          <div className="meta-info-item text-primary" style={{ color: 'var(--primary)' }}>
            <i className="bi bi-lightning-charge-fill"></i>
            <span style={{ fontWeight: 600 }}>{newMessagesCount} new messages</span>
          </div>
        </div>

        {/* Stacked Member Avatars Row */}
        <div className="avatar-stack mt-2">
          <div className="avatar-stack-item text-white" style={{ backgroundColor: '#10B981', fontSize: '0.65rem' }}>US</div>
          <div className="avatar-stack-item text-white" style={{ backgroundColor: '#8B5CF6', fontSize: '0.65rem' }}>U2</div>
          <div className="avatar-stack-item text-white" style={{ backgroundColor: '#3b82f6', fontSize: '0.65rem' }}>U3</div>
          <div className="avatar-stack-item more-badge">+{memberCount > 3 ? memberCount - 3 : 1}</div>
        </div>

        {/* Card Action Buttons */}
        <div className="mt-auto d-flex gap-2 pt-2 border-top">
          {activeTab === 'my-groups' ? (
            <>
              <button
                className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
                onClick={() => onNavigateToChat(groupId)}
                style={{ borderRadius: '12px' }}
              >
                <i className="bi bi-chat-dots-fill"></i>
                <span>Chat</span>
              </button>
              {isOwner ? (
                <button
                  className="btn btn-outline-danger btn-sm px-3"
                  disabled={isDeleting}
                  onClick={() => onDelete(groupId)}
                  title="Delete Group"
                  style={{ borderRadius: '12px' }}
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              ) : (
                <button
                  className="btn btn-outline-danger btn-sm px-3"
                  disabled={isLeaving}
                  onClick={() => onLeave(groupId)}
                  title="Leave Group"
                  style={{ borderRadius: '12px' }}
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              )}
            </>
          ) : (
            <button
              className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              disabled={isJoining}
              onClick={() => onJoin(groupId)}
              style={{ borderRadius: '12px' }}
            >
              {isJoining ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Joining...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill"></i>
                  <span>Join Group</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(GroupCard)
