import Avatar from './Avatar.jsx'

/**
 * GroupMemberList
 * Displays a list of members in a group. Shows an "Admin" badge for the owner.
 * If the current user is the owner, allows removing members who are not admins.
 */
export default function GroupMemberList({
  members,
  adminId,
  currentUserId,
  onRemoveMember,
  isRemoving = false,
}) {
  const isOwner = Number(adminId) === Number(currentUserId)

  if (!members || members.length === 0) {
    return <div className="text-muted small p-2">No members found.</div>
  }

  return (
    <div className="scrollable-panel" style={{ maxHeight: '42vh', overflowY: 'auto' }}>
      {members.map((m) => {
        const isMemberAdmin = Number(m.userID) === Number(adminId)

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
                onClick={() => onRemoveMember(m)}
                disabled={isRemoving}
                title="Remove Member"
              >
                <i className="bi bi-person-dash fs-5"></i>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
