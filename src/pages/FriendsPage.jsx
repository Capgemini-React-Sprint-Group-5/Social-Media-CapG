import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/index.js'
import { useFriends, usePendingRequests, useSendFriendRequest, useRemoveFriend } from '../hooks/useFriends.js'
import Loader from '../components/common/Loader.jsx'
import Avatar from '../components/common/Avatar.jsx'

/**
 * FriendsPage  — Owner: C
 * Tabs: Friends List | Pending Requests | Find Friends (Search)
 *
 * TODO (C):
 *  - Build tab UI
 *  - Accept/Decline pending request actions (useAddFriend / useRemoveFriend)
 *  - Redirect to /profile/:friendId on avatar click
 */
export default function FriendsPage() {
  const currentUser = useSelector(selectCurrentUser)
  const userId      = currentUser?.userId

  const { data: friends,  isLoading: loadingFriends  } = useFriends(userId)
  const { data: pending,  isLoading: loadingPending  } = usePendingRequests(userId)
  const { mutate: remove, isPending: removing        } = useRemoveFriend()

  if (loadingFriends || loadingPending) return <Loader />

  return (
    <div>
      <h5 className="mb-3">Friends</h5>

      {/* TODO: replace with proper tab component */}

      <h6>Friends List ({friends?.length ?? 0})</h6>
      {friends?.length === 0 && <p className="text-muted">No friends yet.</p>}
      {friends?.map((f) => (
        <div key={f.friendId} className="d-flex align-items-center gap-2 mb-2">
          <Avatar username={f.username} size={36} />
          <span>{f.username}</span>
          <button
            className="btn btn-outline-danger btn-sm ms-auto"
            disabled={removing}
            onClick={() => remove({ userId, friendId: f.friendId })}
          >
            Remove
          </button>
        </div>
      ))}

      <hr />

      <h6>Pending Requests ({pending?.length ?? 0})</h6>
      {/* TODO: render pending list with Accept/Decline */}
      <p className="text-muted">TODO — pending request UI</p>
    </div>
  )
}
