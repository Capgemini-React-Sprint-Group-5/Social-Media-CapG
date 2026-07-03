/**
 * GroupCard
 * Renders an individual group's details, member count, ownership status, 
 * and provides context-appropriate action buttons (Join, Chat, Leave).
 */
export default function GroupCard({
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

  return (
    <div className="card glass-card h-100 border-0 shadow-sm">
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', minWidth: '48px' }}
            >
              <i className="bi bi-chat-left-text-fill fs-4"></i>
            </div>
            <div>
              <h6
                className="card-title fw-bold text-dark mb-1 text-truncate"
                style={{ maxWidth: '180px', cursor: 'pointer' }}
                onClick={() => onNavigateToChat(groupId)}
                title={group.groupName}
              >
                {group.groupName}
              </h6>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small font-monospace">
                  <i className="bi bi-people me-1"></i>
                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </span>
                {isOwner && <span className="admin-badge">Admin</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto d-flex gap-2 pt-2 border-top">
          {activeTab === 'my-groups' ? (
            <>
              <button
                className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                onClick={() => onNavigateToChat(groupId)}
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
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              ) : (
                <button
                  className="btn btn-outline-danger btn-sm px-3"
                  disabled={isLeaving}
                  onClick={() => onLeave(groupId)}
                  title="Leave Group"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              )}
            </>
          ) : (
            <button
              className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
              disabled={isJoining}
              onClick={() => onJoin(groupId)}
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
