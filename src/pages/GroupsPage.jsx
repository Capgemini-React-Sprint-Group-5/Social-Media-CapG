import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectCurrentUser } from '../store/index.js'
import { useAllGroups, useJoinGroup, useLeaveGroup, useCreateGroup } from '../hooks/useGroups.js'
import Loader from '../components/common/Loader.jsx'

/**
 * GroupsPage  — Owner: E
 *
 * TODO (E):
 *  - Create Group modal (Formik form)
 *  - Show joined vs not-joined state per group
 *  - Link to /groups/:groupId/chat
 */
export default function GroupsPage() {
  const navigate    = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const userId      = currentUser?.userId

  const { data: groups, isLoading } = useAllGroups()
  const { mutate: join  } = useJoinGroup()
  const { mutate: leave } = useLeaveGroup()

  if (isLoading) return <Loader />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Groups</h5>
        <button className="btn btn-primary btn-sm">+ Create Group</button>
      </div>

      {groups?.length === 0 && <p className="text-muted">No groups found.</p>}
      {groups?.map((g) => (
        <div key={g.groupId} className="card mb-2">
          <div className="card-body d-flex align-items-center gap-2">
            <span
              className="fw-semibold flex-grow-1"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/groups/${g.groupId}/chat`)}
            >
              {g.groupName}
            </span>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => join({ groupId: g.groupId, userId })}
            >
              Join
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => leave({ groupId: g.groupId, userId })}
            >
              Leave
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
