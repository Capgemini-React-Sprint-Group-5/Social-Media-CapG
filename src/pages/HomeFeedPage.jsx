import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectCurrentUser } from '../store/index.js'
import { useFriendsFeed } from '../hooks/usePosts.js'
import { useFriends } from '../hooks/useFriends.js'
import Loader from '../components/common/Loader.jsx'
import PostCard from '../components/common/PostCard.jsx'
import CreatePostPage from './CreatePostPage.jsx'
import Avatar from '../components/common/Avatar.jsx'

export default function HomeFeedPage() {
  const currentUser = useSelector(selectCurrentUser)
  const userId = currentUser?.userId
  
  // Custom API Aggregators
  const { posts, isLoading, isError } = useFriendsFeed()
  const { data: friends = [] } = useFriends(userId)

  if (isLoading) return <Loader />
  if (isError) return <div className="alert alert-danger shadow-sm rounded-3 m-3">Failed to sync feed.</div>

  return (
    <div className="container-fluid page-container">
      <div className="row g-4">
        
        {/* ================= LEFT COLUMN: STICKY MINI USER PANEL ================= */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="card glass-card border-0 p-3 text-center sticky-top" style={{ top: '90px', zIndex: 10 }}>
            <div className="pt-3">
              <Avatar src={currentUser?.profile_picture} username={currentUser?.username} size={70} />
              <h5 className="fw-bold mt-3 mb-1 text-dark">{currentUser?.username}</h5>
              <p className="small text-muted mb-3">{currentUser?.email}</p>
            </div>
            
            <hr className="text-muted opacity-25 my-2" />
            
            <div className="d-flex justify-content-around py-2">
              <div className="text-center">
                <span className="d-block fw-bold text-dark">{friends.length}</span>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Friends</small>
              </div>
              <div className="text-center">
                <span className="d-block fw-bold text-dark">{posts.length}</span>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Feed Posts</small>
              </div>
            </div>

            <hr className="text-muted opacity-25 my-2" />

            <Link 
              to={`/profile/${userId}`} 
              className="btn btn-soft w-100 fw-semibold text-decoration-none py-2 mt-2 d-block"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* ================= MIDDLE COLUMN: CENTRAL FEED ENGINE ================= */}
        <div className="col-lg-6 col-md-8 col-12 mx-auto">
          {/* Quick Post Box Wrapper utilizing Glassmorphism parameters */}
          <div className="card glass-card border-0 p-4 mb-4 fade-up">
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar src={currentUser?.profile_picture} username={currentUser?.username} size={42} />
              <div className="flex-grow-1">
                <h6 className="fw-bold m-0 text-dark">Share Something New</h6>
                <small className="text-muted">What's on your mind today?</small>
              </div>
            </div>
            <CreatePostPage />
          </div>

          {/* Home Feed Header */}
          <div className="d-flex align-items-center justify-content-between mb-3 px-1">
            <h5 className="fw-bold text-dark mb-0">Recent Activity</h5>
            <span className="badge bg-light text-muted border px-2.5 py-1.5 rounded-pill fw-medium">
              {posts.length} entries
            </span>
          </div>

          {/* Timeline Feed Stream */}
          <div className="feed-container">
            {posts.length === 0 ? (
              <div className="card glass-card border-0 text-center p-5 fade-up">
                <div className="fs-1 text-muted mb-2"></div>
                <h5 className="fw-semibold text-dark mb-1">Your feed is looking empty</h5>
                <p className="text-muted small mx-auto" style={{ maxWidth: '340px' }}>
                  Connect with friends using the Search panel to start curating your custom dashboard timeline!
                </p>
                <Link to="/search" className="btn btn-primary-gradient mx-auto px-4 mt-2 text-decoration-none">
                  Find Communities
                </Link>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.postID || post.id} className="hover-scale mb-4">
                  <PostCard post={post} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: QUICK CONNECTIONS SIDEBAR ================= */}
        <div className="col-lg-3 col-md-4 d-none d-md-block">
          <div className="card glass-card border-0 p-3 sticky-top" style={{ top: '90px', zIndex: 10 }}>
            <h6 className="fw-bold text-dark px-1 mb-3">Active Threads</h6>
            
            {friends.length === 0 ? (
              <p className="text-muted small text-center py-3 mb-0">No active friends found.</p>
            ) : (
              <div className="d-flex flex-column gap-2.5 max-vh-40 overflow-auto pe-1">
                {friends.slice(0, 5).map((friend) => (
                  <Link 
                    key={friend.friendId} 
                    to={`/messages/${friend.friendId}`} 
                    className="d-flex align-items-center gap-2.5 p-2 rounded-3 text-decoration-none hover-scale border border-light bg-white bg-opacity-50 transition-all"
                    style={{ contentVisibility: 'auto' }}
                  >
                    <div className="position-relative">
                      <Avatar src={friend.profile_picture} username={friend.username} size={36} />
                      <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle"></span>
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="small fw-bold text-dark text-truncate">{friend.username}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>Click to chat</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {friends.length > 5 && (
              <Link to="/friends" className="text-center small fw-semibold text-primary text-decoration-none d-block pt-2 mt-2 border-top border-light">
                See all friends ({friends.length})
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}