import { useParams } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../store/index.js'
import { queryKeys } from '../queryKeys.js'
import * as usersApi from '../api/users.api.js'
import Loader from '../components/common/Loader.jsx'
import Avatar from '../components/common/Avatar.jsx'

/**
 * ProfilePage  — Owner: A
 * Aggregates: user info, posts, friends, likes received.
 * All four queries fire in parallel via useQueries.
 *
 * TODO (A):
 *  - Render posts list (reuse PostCard from B once ready)
 *  - Render friends list (reuse FriendCard from C once ready)
 *  - Add/Remove friend button (conditional on whether viewing own profile)
 *  - Edit profile button (own profile only)
 */
export default function ProfilePage() {
  const { userId }    = useParams()
  const currentUser   = useSelector(selectCurrentUser)
  const isOwnProfile  = currentUser?.userId === Number(userId)

  const [userQuery, postsQuery, friendsQuery, likesQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.users.byId(userId),
        queryFn:  () => usersApi.getUserById(userId),
        enabled:  !!userId,
      },
      {
        queryKey: queryKeys.posts.byUser(userId),
        queryFn:  () => usersApi.getUserPosts(userId),
        enabled:  !!userId,
      },
      {
        queryKey: queryKeys.friends.list(userId),
        queryFn:  () => usersApi.getUserById(userId), // swap: friendsApi.getFriends(userId)
        enabled:  !!userId,
      },
      {
        queryKey: queryKeys.likes.receivedByUser(userId),
        queryFn:  () => usersApi.getUserPostLikes(userId),
        enabled:  !!userId,
      },
    ],
  })

  if (userQuery.isLoading) return <Loader />

  const user = userQuery.data

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Avatar src={user?.profile_picture} username={user?.username} size={64} />
        <div>
          <h4 className="mb-0">{user?.username}</h4>
          <small className="text-muted">{user?.email}</small>
        </div>
        {isOwnProfile && (
          <button className="btn btn-outline-secondary btn-sm ms-auto">Edit Profile</button>
        )}
      </div>

      {/* TODO: tab panel — Posts | Friends | Likes */}
      <p className="text-muted">TODO — build tab panels for Posts, Friends, Likes</p>
    </div>
  )
}
