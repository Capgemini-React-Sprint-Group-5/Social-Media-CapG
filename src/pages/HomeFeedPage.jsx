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
  // Preserves your original exact Redux lookup key
  const userId = currentUser?.userId
  
  // Custom API Aggregators
  const { posts = [], isLoading, isError } = useFriendsFeed()
  const { data: rawFriends = [] } = useFriends(userId)

  // FILTER SIDEBAR DECK: Restrict sidebar visibility and status counters strictly to accepted matches
  const acceptedFriends = Array.isArray(rawFriends) 
    ? rawFriends.filter(friend => friend.status === 'accepted') 
    : [];

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
              <h5 className="fw-bold mt-3 mb-1 text-dark">{currentUser?.username || 'Profile'}</h5>
              <p className="small text-muted mb-3">{currentUser?.email || ''}</p>
            </div>
            
            <hr className="text-muted opacity-25 my-2" />
            
            <div className="d-flex justify-content-around py-2">
              <div className="text-center">
                <span className="d-block fw-bold text-dark">{acceptedFriends.length}</span>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Friends</small>
              </div>
              <div className="text-center">
                <span className="d-block fw-bold text-dark">{posts.length}</span>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Feed Posts</small>
              </div>
            </div>

            <hr className="text-muted opacity-25 my-2" />

            {/* FIXED CLASS: Uses your non-colliding profile link styling handle */}
            <Link 
              to={`/profile/${userId}`} 
              className="btn hs-btn-profile-soft w-100 fw-semibold text-decoration-none py-2 mt-2 d-block"
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
                {/* REMOVED EMOJI ICON MODULE FOR PROFESSIONAL ALIGNMENT */}
                <h5 className="fw-semibold text-dark mb-1 mt-2">Your feed is looking empty</h5>
                <p className="text-muted small mx-auto" style={{ maxWidth: '340px' }}>
                  Connect with friends using the Search panel to start curating your custom dashboard timeline!
                </p>
                {/* FIXED CLASS: Uses your isolated primary gradient button handle */}
                <Link to="/search" className="btn hs-btn-feed-gradient mx-auto px-4 mt-2 text-decoration-none">
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
            
            {acceptedFriends.length === 0 ? (
              <p className="text-muted small text-center py-3 mb-0">No active friends found.</p>
            ) : (
              <div className="d-flex flex-column gap-3 hs-feed-sidebar-scroll overflow-auto pe-1">
                {acceptedFriends.slice(0, 5).map((friend) => {
                  const targetFriendId = friend.friendId || friend.userId || friend.userID2;
                  const friendUsername = friend.username || friend.user?.username || `User #${targetFriendId}`;
                  
                  return (
                    <Link 
                      key={friend.friendshipID || friend.id} 
                      to={`/messages/${targetFriendId}`} 
                      className="d-flex align-items-center gap-3 py-2.5 px-3 rounded-4 text-decoration-none hover-scale border border-light bg-white bg-opacity-50 transition-all shadow-sm"
                    >
                      <div className="position-relative flex-shrink-0">
                        <Avatar src={friend.profile_picture || friend.user?.profile_picture} username={friendUsername} size={42} />
                        <span 
                          className="position-absolute bottom-0 end-0 p-1 bg-success border border-2 border-white rounded-circle"
                          style={{ transform: 'translate(1px, 1px)' }}
                        ></span>
                      </div>
                      
                      <div className="flex-grow-1 min-w-0 ps-1">
                        {/* 1. USERNAME: Upgraded from small to standard text size and forced maximum bold (fw-black) */}
                        <div className="fw-black text-dark text-truncate mb-0.5" style={{ fontSize: '1rem', fontWeight: '800' }}>
                          {friendUsername}
                        </div>
                        {/* 2. CLICK TO CHAT: Upgraded font size to 0.8rem and changed to semi-bold text */}
                        <div className="text-primary fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.1px' }}>
                          Click to chat
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            
            {acceptedFriends.length > 5 && (
              <Link to="/friends" className="text-center small fw-semibold text-primary text-decoration-none d-block pt-2 mt-2 border-top border-light">
                See all friends ({acceptedFriends.length})
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}