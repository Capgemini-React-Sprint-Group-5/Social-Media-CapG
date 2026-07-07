import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { selectCurrentUser } from "../store/index.js";
import { useFriendsFeed } from "../hooks/usePosts.js";
import { useFriends } from "../hooks/useFriends.js";
import { useAllGroups } from "../hooks/useGroups.js";
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
  const { data: acceptedFriends = [], isLoading: loadingFriends } =
    useFriends(userId);
  const { data: groups = [], isLoading: loadingGroups } = useAllGroups();

  if (isLoading || loadingFriends || loadingGroups) return <Loader />;

  if (isError)
    return (
      <div className="alert alert-danger shadow-sm rounded-3 m-3">
        Failed to sync feed.
      </div>
    );

  // BALANCED BLUE MATRIX: Transitioning beautifully across premium hues of Blue
  const trendingTopics = [
    {
      tag: "#React19",
      posts: "24.5k posts",
      icon: "bi-lightning-charge-fill",
      color: "#00F2FE",
      bg: "rgba(0, 242, 254, 0.08)",
    }, // Electric Cyan
    {
      tag: "#ViteJs",
      posts: "12.3k posts",
      icon: "bi-rocket-takeoff-fill",
      color: "#0EA5E9",
      bg: "rgba(14, 165, 233, 0.08)",
    }, // Sky Blue
    {
      tag: "#Bootstrap5",
      posts: "8.9k posts",
      icon: "bi-palette-fill",
      color: "#2563EB",
      bg: "rgba(37, 99, 235, 0.08)",
    }, // Royal Blue
    {
      tag: "#WebDev",
      posts: "42.1k posts",
      icon: "bi-cpu-fill",
      color: "#4F46E5",
      bg: "rgba(79, 70, 229, 0.08)",
    }, // Deep Indigo Blue
  ];

  // Premium Dashboard UI Structural Layout Design Tokens
  const premiumCardStyle = {
    background: "#ffffff",
    border: "1px solid rgba(14, 165, 233, 0.15)",
    borderRadius: "24px",
    boxShadow:
      "0 10px 30px rgba(14, 165, 233, 0.04), 0 1px 3px rgba(0, 0, 0, 0.01)",
    padding: "24px",
    transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
  };

  const innerBoxStyle = {
    background: "linear-gradient(145deg, #F0F7FF 0%, #E0F2FE 100%)", // Shaded glacier-blue backdrop
    border: "1px solid rgba(14, 165, 233, 0.2)",
    borderRadius: "18px",
    padding: "16px 20px",
  };

  return (
    <div
      className="container-fluid page-container px-2"
      style={{ fontSize: "1.05rem" }}
    >
      {/* Dynamic Keyframe Injector block for Premium Hover Animations */}
      <style>{`
        .premium-layout-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1) !important;
          border-color: rgba(79, 70, 229, 0.3) !important;
        }
        .interactive-element-row {
          transition: all 0.25s ease;
        }
        .interactive-element-row:hover {
          background: #F0F7FF !important;
          border-color: #0EA5E9 !important;
          transform: scale(1.02);
        }
        .glowing-activity-badge {
          box-shadow: 0 0 12px rgba(79, 70, 229, 0.2);
          animation: borderPulse 2.5s infinite ease-in-out;
        }
        @keyframes borderPulse {
          0% { box-shadow: 0 0 4px rgba(79, 70, 229, 0.2); }
          50% { box-shadow: 0 0 16px rgba(14, 165, 233, 0.4); }
          100% { box-shadow: 0 0 4px rgba(79, 70, 229, 0.2); }
        }
      `}</style>

      <div className="row g-4">
        {/* ================= LEFT COLUMN: MINI PROFILE & SHORTCUTS ================= */}
        <div className="col-lg-3 d-none d-lg-block">
          <div
            className="d-flex flex-column gap-4 sticky-top"
            style={{ top: "90px", zIndex: 10 }}
          >
            {/* User Premium Card with Top Brand Blue Gradient Band */}
            <div
              className="card border-0 overflow-hidden premium-layout-card"
              style={premiumCardStyle}
            >
              <div
                style={{
                  height: "64px",
                  background:
                    "linear-gradient(135deg, #0EA5E9 0%, #4F46E5 100%)",
                }}
              ></div>
              <div
                className="text-center px-4 pb-4"
                style={{ marginTop: "-38px" }}
              >
                <div className="d-inline-block p-1 bg-white rounded-circle shadow-sm mb-2">
                  <Avatar
                    src={currentUser?.profile_picture}
                    username={currentUser?.username}
                    size={76}
                  />
                </div>
                <h4
                  className="fw-extrabold mt-1 mb-1 text-dark"
                  style={{ fontSize: "1.3rem", letterSpacing: "-0.3px" }}
                >
                  {currentUser?.username || "Profile"}
                </h4>
                <p
                  className="small text-muted mb-3"
                  style={{ fontSize: "0.85rem" }}
                >
                  {currentUser?.email || ""}
                </p>

                {/* Structural Inner Data Block Container */}
                <div className="row g-0 text-center" style={innerBoxStyle}>
                  <div
                    className="col-6 border-end"
                    style={{ borderColor: "rgba(14, 165, 233, 0.2)" }}
                  >
                    <span className="d-block fw-extrabold text-dark fs-4">
                      {acceptedFriends.length}
                    </span>
                    <small
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}
                    >
                      Friends
                    </small>
                  </div>
                  <div className="col-6">
                    <span className="d-block fw-extrabold text-dark fs-4">
                      {posts.length}
                    </span>
                    <small
                      className="text-muted fw-bold"
                      style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}
                    >
                      Feed Posts
                    </small>
                  </div>
                </div>

                <Link
                  to={`/profile/${userId}`}
                  className="btn text-white w-100 fw-bold py-2.5 mt-3 border-0 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #0EA5E9 0%, #4F46E5 100%)",
                    borderRadius: "14px",
                    fontSize: "0.95rem",
                  }}
                >
                  View Profile
                </Link>
              </div>
            </div>

            {/* Premium Dynamic Blue Shortcuts Panel */}
            <div
              className="card border-0 premium-layout-card"
              style={premiumCardStyle}
            >
              <h4
                className="fw-extrabold text-dark px-1 mb-3 d-flex align-items-center gap-2"
                style={{ fontSize: "1.25rem", letterSpacing: "-0.3px" }}
              >
                <i
                  className="bi bi-grid-1x2-fill"
                  style={{ color: "#0EA5E9" }}
                ></i>{" "}
                Shortcuts
              </h4>
              <div className="d-flex flex-column gap-2">
                <Link
                  to="/friends"
                  className="text-decoration-none text-dark d-flex align-items-center gap-3 p-2 rounded-4 fw-bold interactive-element-row"
                  style={{ fontSize: "1.02rem" }}
                >
                  <span
                    className="p-2.5 rounded-3 d-flex fs-5"
                    style={{
                      backgroundColor: "rgba(14, 165, 233, 0.1)",
                      color: "#0EA5E9",
                    }}
                  >
                    <i className="bi bi-people-fill"></i>
                  </span>{" "}
                  Friends List
                </Link>
                <Link
                  to="/groups"
                  className="text-decoration-none text-dark d-flex align-items-center gap-3 p-2 rounded-4 fw-bold interactive-element-row"
                  style={{ fontSize: "1.02rem" }}
                >
                  <span
                    className="p-2.5 rounded-3 d-flex fs-5"
                    style={{
                      backgroundColor: "rgba(37, 99, 235, 0.1)",
                      color: "#2563EB",
                    }}
                  >
                    <i className="bi bi-collection-fill"></i>
                  </span>{" "}
                  Communities
                </Link>
                <Link
                  to="/notifications"
                  className="text-decoration-none text-dark d-flex align-items-center gap-3 p-2 rounded-4 fw-bold interactive-element-row"
                  style={{ fontSize: "1.02rem" }}
                >
                  <span
                    className="p-2.5 rounded-3 d-flex fs-5"
                    style={{
                      backgroundColor: "rgba(79, 70, 229, 0.1)",
                      color: "#4F46E5",
                    }}
                  >
                    <i className="bi bi-bell-fill"></i>
                  </span>{" "}
                  Notifications
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MIDDLE COLUMN: CENTRAL FEED ENGINE ================= */}
        <div className="col-lg-6 col-md-8 col-12 mx-auto">
          <div
            className="card border-0 mb-4 fade-up premium-layout-card"
            style={premiumCardStyle}
          >
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar
                src={currentUser?.profile_picture}
                username={currentUser?.username}
                size={46}
              />
              <div>
                <h5
                  className="fw-extrabold m-0 text-dark"
                  style={{ fontSize: "1.2rem", letterSpacing: "-0.2px" }}
                >
                  Share Something New
                </h5>
                <small className="text-muted" style={{ fontSize: "0.9rem" }}>
                  What's on your mind today?
                </small>
              </div>
            </div>
            <CreatePostPage />
          </div>

          <div className="d-flex align-items-center justify-content-between mb-3 px-2">
            <h4
              className="fw-extrabold text-dark mb-0"
              style={{ fontSize: "1.25rem", letterSpacing: "-0.3px" }}
            >
              Recent Activity
            </h4>
            <span
              className="badge border px-3 py-2 rounded-pill text-primary fw-bold bg-white glowing-activity-badge"
              style={{
                fontSize: "0.85rem",
                borderColor: "rgba(14, 165, 233, 0.3)",
              }}
            >
              {posts.length} entries
            </span>
          </div>

          <div className="feed-container">
            {posts.length === 0 ? (
              <div
                className="card border-0 text-center p-5 fade-up"
                style={premiumCardStyle}
              >
                <h4 className="fw-extrabold text-dark mb-2">
                  Your feed is looking empty
                </h4>
                <p
                  className="text-muted small mx-auto mb-3"
                  style={{ maxWidth: "340px", fontSize: "0.95rem" }}
                >
                  Connect with friends using the Search panel to start curating
                  your timeline!
                </p>
                <Link
                  to="/search"
                  className="btn text-white px-4 mt-2 border-0 fw-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #0EA5E9 0%, #4F46E5 100%)",
                    borderRadius: "12px",
                  }}
                >
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
            className="d-flex flex-column gap-4 sticky-top"
            style={{ top: "90px", zIndex: 10 }}
          >
            {/* Elegant ENLARGED Active Threads Container */}
            <div
              className="card border-0 p-4 premium-layout-card"
              style={premiumCardStyle}
            >
              <h5
                className="fw-extrabold text-dark px-1 mb-3 d-flex align-items-center gap-2"
                style={{ fontSize: "1.25rem", letterSpacing: "-0.3px" }}
              >
                <i
                  className="bi bi-chat-square-heart-fill"
                  style={{ color: "#0EA5E9" }}
                ></i>{" "}
                Active Threads
              </h5>
              {acceptedFriends.length === 0 ? (
                <p
                  className="text-muted small text-center py-3 mb-0"
                  style={{ fontSize: "0.9rem" }}
                >
                  No active friends found.
                </p>
              ) : (
                <div className="d-flex flex-column gap-2.5 max-height-sidebar overflow-auto pe-1">
                  {acceptedFriends.slice(0, 3).map((friend) => {
                    const targetFriendId =
                      friend.friendId || friend.userId || friend.userID2;
                    const friendUsername =
                      friend.username ||
                      friend.user?.username ||
                      `User #${targetFriendId}`;
                    return (
                      <Link
                        key={friend.friendshipId || friend.id}
                        to={`/messages/${targetFriendId}`}
                        onClick={() =>
                          dispatch(setActiveThread(targetFriendId))
                        }
                        className="d-flex align-items-center gap-3 py-2.5 px-3 rounded-4 text-decoration-none shadow-sm interactive-element-row"
                        style={{
                          background: "#ffffff",
                          border: "1px solid rgba(14, 165, 233, 0.15)",
                        }}
                      >
                        <div className="position-relative flex-shrink-0">
                          <Avatar
                            src={
                              friend.profile_picture ||
                              friend.user?.profile_picture
                            }
                            username={friendUsername}
                            size={42}
                          />
                          <span
                            className="position-absolute bottom-0 end-0 p-1 bg-success border border-2 border-white rounded-circle"
                            style={{ transform: "translate(1px, 1px)" }}
                          ></span>
                        </div>
                        <div className="flex-grow-1 min-w-0 ps-1">
                          <div
                            className="fw-extrabold text-dark text-truncate"
                            style={{
                              fontSize: "1.05rem",
                              letterSpacing: "-0.1px",
                            }}
                          >
                            {friendUsername}
                          </div>
                          {/* Rich Electric Blue Actions */}
                          <div
                            className="fw-bold"
                            style={{ fontSize: "0.88rem", color: "#0EA5E9" }}
                          >
                            Click to chat
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trending News Section — Clean, Segmented Blue Multi-Shade Modules */}
            <div
              className="card border-0 p-4 premium-layout-card"
              style={premiumCardStyle}
            >
              <h5
                className="fw-extrabold text-dark px-1 mb-3"
                style={{ fontSize: "1.15rem", letterSpacing: "-0.2px" }}
              >
                Trending News
              </h5>
              <div className="d-flex flex-column gap-2">
                {trendingTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 d-flex gap-3 align-items-center interactive-element-row"
                    style={{
                      ...innerBoxStyle,
                      cursor: "pointer",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      className="p-2 rounded-3 d-flex"
                      style={{ backgroundColor: topic.bg }}
                    >
                      <i
                        className={`bi ${topic.icon} fs-6`}
                        style={{ color: topic.color }}
                      ></i>
                    </div>
                    <div>
                      <div
                        className="fw-extrabold text-dark"
                        style={{ fontSize: "0.95rem" }}
                      >
                        {topic.tag}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {topic.posts}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explore Groups Widget with Premium Blue Action Fills */}
            <div
              className="card border-0 p-4 premium-layout-card"
              style={premiumCardStyle}
            >
              <h5
                className="fw-bold text-dark px-1 mb-3"
                style={{ fontSize: "1.15rem", letterSpacing: "-0.2px" }}
              >
                Explore Groups
              </h5>
              <div className="d-flex flex-column gap-2">
                {groups.slice(0, 3).map((group, idx) => {
                  return (
                    <div
                      key={idx}
                      className="d-flex align-items-center justify-content-between p-2 rounded-4 border interactive-element-row"
                      style={{
                        background: "#ffffff",
                        borderColor: "rgba(14, 165, 233, 0.15)",
                      }}
                    >
                      <div className="min-w-0 ps-2">
                        <div
                          className="fw-bold text-dark text-truncate"
                          style={{ fontSize: "0.95rem" }}
                        >
                          #{group.groupName}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {group.members?.length || 1} members
                        </div>
                      </div>
                      <Link
                        to={`/groups/${group.id || group.groupID}/chat`}
                        className="btn btn-sm py-1 px-3 small text-decoration-none fw-bold"
                        style={{
                          borderRadius: "10px",
                          color: "#ffffff",
                          background:
                            "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
                        }}
                      >
                        View
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
