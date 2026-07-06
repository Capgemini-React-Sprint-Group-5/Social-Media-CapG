import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { selectCurrentUser } from "../store/index.js";
import { useFriendsFeed } from "../hooks/usePosts.js";
import { useFriends } from "../hooks/useFriends.js";
import { useAllGroups } from "../hooks/useGroups.js"; // Added to pull real communities
import Loader from "../components/common/Loader.jsx";
import PostCard from "../components/common/PostCard.jsx";
import CreatePostPage from "./CreatePostPage.jsx";
import Avatar from "../components/common/Avatar.jsx";
import { setActiveThread } from "../store/slices/uiSlice.js";

export default function HomeFeedPage() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.userId;

  // Custom API Aggregators
  const { posts = [], isLoading, isError } = useFriendsFeed();
  const { data: acceptedFriends = [], isLoading: loadingFriends } = useFriends(userId);
  const { data: groups = [], isLoading: loadingGroups } = useAllGroups(); // Fetching groups

  if (isLoading || loadingFriends || loadingGroups) return <Loader />;
  if (isError)
    return (
      <div className="alert alert-danger shadow-sm rounded-3 m-3">
        Failed to sync feed.
      </div>
    );

  // Mock Trending Data (Can be replaced with an API later)
  const trendingTopics = [
    { tag: "#React19", posts: "24.5k posts" },
    { tag: "#ViteJs", posts: "12.3k posts" },
    { tag: "#Bootstrap5", posts: "8.9k posts" },
    { tag: "#WebDev", posts: "42.1k posts" }
  ];

  return (
    <div className="container-fluid page-container">
      <div className="row g-4">
        {/* ================= LEFT COLUMN: MINI PROFILE & SHORTCUTS ================= */}
        <div className="col-lg-3 d-none d-lg-block">
          <div
            className="d-flex flex-column gap-3 sticky-top"
            style={{ top: "90px", zIndex: 10 }}
          >
            {/* User Card */}
            <div className="card glass-card border-0 p-3 text-center">
              <div className="pt-3">
                <Avatar
                  src={currentUser?.profile_picture}
                  username={currentUser?.username}
                  size={70}
                />
                <h5 className="fw-bold mt-3 mb-1 text-dark">
                  {currentUser?.username || "Profile"}
                </h5>
                <p className="small text-muted mb-3">
                  {currentUser?.email || ""}
                </p>
              </div>

              <hr className="text-muted opacity-25 my-2" />

              <div className="d-flex justify-content-around py-2">
                <div className="text-center">
                  <span className="d-block fw-bold text-dark">
                    {acceptedFriends.length}
                  </span>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Friends
                  </small>
                </div>
                <div className="text-center">
                  <span className="d-block fw-bold text-dark">
                    {posts.length}
                  </span>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Feed Posts
                  </small>
                </div>
              </div>

              <hr className="text-muted opacity-25 my-2" />

              <Link
                to={`/profile/${userId}`}
                className="btn hs-btn-profile-soft w-100 fw-semibold text-decoration-none py-2 mt-2 d-block"
              >
                View Profile
              </Link>
            </div>

            {/* NEW SECTION: QUICK NAVIGATION / SHORTCUTS */}
            <div className="card glass-card border-0 p-3">
              <h6 className="fw-bold text-dark px-1 mb-3">Shortcuts</h6>
              <div className="d-flex flex-column gap-2">
                <Link to="/friends" className="text-decoration-none text-dark d-flex align-items-center gap-2 p-2 rounded hover-bg-light small fw-medium">
                  <i className="bi bi-people-fill text-primary"></i> Friends List
                </Link>
                <Link to="/groups" className="text-decoration-none text-dark d-flex align-items-center gap-2 p-2 rounded hover-bg-light small fw-medium">
                  <i className="bi bi-collection-fill text-primary"></i> Communities
                </Link>
                <Link to="/notifications" className="text-decoration-none text-dark d-flex align-items-center gap-2 p-2 rounded hover-bg-light small fw-medium">
                  <i className="bi bi-bell-fill text-primary"></i> Notifications
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MIDDLE COLUMN: CENTRAL FEED ENGINE ================= */}
        <div className="col-lg-6 col-md-8 col-12 mx-auto">
          <div className="card glass-card border-0 p-4 mb-4 fade-up">
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar
                src={currentUser?.profile_picture}
                username={currentUser?.username}
                size={42}
              />
              <div className="flex-grow-1">
                <h6 className="fw-bold m-0 text-dark">Share Something New</h6>
                <small className="text-muted">What's on your mind today?</small>
              </div>
            </div>
            <CreatePostPage />
          </div>

          <div className="d-flex align-items-center justify-content-between mb-3 px-1">
            <h5 className="fw-bold text-dark mb-0">Recent Activity</h5>
            <span className="badge bg-light text-muted border px-2.5 py-1.5 rounded-pill fw-medium">
              {posts.length} entries
            </span>
          </div>

          <div className="feed-container">
            {posts.length === 0 ? (
              <div className="card glass-card border-0 text-center p-5 fade-up">
                <h5 className="fw-semibold text-dark mb-1">
                  Your feed is looking empty
                </h5>
                <p className="text-muted small mx-auto" style={{ maxWidth: "340px" }}>
                  Connect with friends using the Search panel to start curating your timeline!
                </p>
                <Link to="/search" className="btn btn-primary mx-auto px-4 mt-2 text-decoration-none">
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

        {/* ================= RIGHT COLUMN: QUICK CONNECTIONS & TRENDING ================= */}
        <div className="col-lg-3 col-md-4 d-none d-md-block">
          <div
            className="d-flex flex-column gap-3 sticky-top"
            style={{ top: "90px", zIndex: 10 }}
          >
            {/* Active Threads Section */}
            <div className="card glass-card border-0 p-3">
              <h6 className="fw-bold text-dark px-1 mb-3">Active Threads</h6>

              {acceptedFriends.length === 0 ? (
                <p className="text-muted small text-center py-3 mb-0">
                  No active friends found.
                </p>
              ) : (
                <div className="d-flex flex-column gap-2 max-height-sidebar overflow-auto pe-1">
                  {acceptedFriends.slice(0, 3).map((friend) => {
                    const targetFriendId = friend.friendId || friend.userId || friend.userID2;
                    const friendUsername = friend.username || friend.user?.username || `User #${targetFriendId}`;

                    return (
                      <Link
                        key={friend.friendshipId || friend.id}
                        to={`/messages/${targetFriendId}`}
                        onClick={() => dispatch(setActiveThread(targetFriendId))}
                        className="d-flex align-items-center gap-3 py-2 px-3 rounded-4 text-decoration-none hover-scale border border-light bg-white bg-opacity-50 transition-all shadow-sm"
                      >
                        <div className="position-relative flex-shrink-0">
                          <Avatar
                            src={friend.profile_picture || friend.user?.profile_picture}
                            username={friendUsername}
                            size={36}
                          />
                          <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-2 border-white rounded-circle" style={{ transform: "translate(1px, 1px)" }}></span>
                        </div>
                        <div className="flex-grow-1 min-w-0 ps-1">
                          <div className="fw-bold text-dark text-truncate small">
                            {friendUsername}
                          </div>
                          <div className="text-primary" style={{ fontSize: "0.75rem" }}>
                            Click to chat
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* NEW SECTION: TRENDING TOPICS */}
            <div className="card glass-card border-0 p-3">
              <h6 className="fw-bold text-dark px-1 mb-2">Trending News</h6>
              <div className="d-flex flex-column gap-2">
                {trendingTopics.map((topic, idx) => (
                  <div key={idx} className="p-2 rounded hover-bg-light" style={{ cursor: "pointer" }}>
                    <div className="fw-bold text-dark small">{topic.tag}</div>
                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>{topic.posts}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW SECTION: DISCOVER COMMUNITIES SUGGESTIONS */}
            <div className="card glass-card border-0 p-3">
              <h6 className="fw-bold text-dark px-1 mb-2">Explore Groups</h6>
              <div className="d-flex flex-column gap-2">
                {groups.slice(0, 3).map((group, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded hover-bg-light">
                    <div className="min-w-0">
                      <div className="fw-bold text-dark text-truncate small">#{group.groupName}</div>
                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>{group.members?.length || 1} members</div>
                    </div>
                    <Link to={`/groups/${group.id || group.groupID}/chat`} className="btn btn-sm btn-soft py-1 px-2.5 small text-decoration-none">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}