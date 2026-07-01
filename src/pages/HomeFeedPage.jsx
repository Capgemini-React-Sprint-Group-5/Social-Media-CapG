import Loader from '../components/common/Loader.jsx'
import { useFriendsFeed } from '../hooks/usePosts.js'

/**
 * HomeFeedPage  — Owner: B
 * Aggregates posts from all friends.
 * Hooks: useFriendsFeed (own — internally uses useFriends from C)
 *
 * TODO (B):
 *  - Render PostCard per post (build PostCard component)
 *  - Wire Likes + Comments on each PostCard
 *  - Handle empty state (no friends yet)
 */
export default function HomeFeedPage() {
  const { posts, isLoading, isError } = useFriendsFeed()

  if (isLoading) return <Loader />
  if (isError)   return <p className="text-danger">Failed to load feed.</p>

  return (
    <div>
      <h5 className="mb-3">Home Feed</h5>
      {posts.length === 0 ? (
        <p className="text-muted">Add friends to see their posts here.</p>
      ) : (
        posts.map((post) => (
          // TODO: replace with <PostCard post={post} />
          <div key={post.postId} className="card mb-3">
            <div className="card-body">
              <p>{post.content}</p>
              <small className="text-muted">{post.timestamp}</small>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
