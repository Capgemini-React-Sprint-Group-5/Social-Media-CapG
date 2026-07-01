import Loader from '../components/common/Loader.jsx'
import PostCard from '../components/common/PostCard.jsx'
import { useFriendsFeed } from '../hooks/usePosts.js'

/**
 * HomeFeedPage  — Owner: B
 * Aggregates posts from all friends.
 * Hooks: useFriendsFeed (own — internally uses useFriends from C)
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
          <PostCard key={post.postID} post={post} />
        ))
      )}
    </div>
  )
}
