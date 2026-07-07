import {
  useParams,
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import { selectCurrentUser } from "../store/index.js";
import { queryKeys } from "../queryKeys.js";
import * as usersApi from "../api/users.api.js";
import * as friendsApi from "../api/friends.api.js";
import { useAllUsers } from "../hooks/useUsers.js";
import {
  useFriends,
  useSentRequests,
  useSendFriendRequest,
} from "../hooks/useFriends.js";
import { useAllGroups, useJoinGroup } from "../hooks/useGroups.js";
import Loader from "../components/common/Loader.jsx";
import Avatar from "../components/common/Avatar.jsx";
import PostCard from "../components/common/PostCard.jsx";
import UserCard from "../components/common/UserCard.jsx";
import EditProfileModal from "../components/common/EditProfileModal.jsx";

// Static "site-wide" trending topics — same idea as the Home feed's trending
// widget. There's no hashtag/analytics backend yet, so this is illustrative
// content rather than data pulled for this specific profile.
const TRENDING_TOPICS = [
  {
    tag: "#PhotoOfTheDay",
    posts: "31.4k posts",
    icon: "bi-camera-fill",
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.08)",
  },
  {
    tag: "#WeekendVibes",
    posts: "18.2k posts",
    icon: "bi-sun-fill",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.08)",
  },
  {
    tag: "#GroupChat",
    posts: "14.6k posts",
    icon: "bi-people-fill",
    color: "#4F46E5",
    bg: "rgba(79, 70, 229, 0.08)",
  },
  {
    tag: "#Throwback",
    posts: "9.7k posts",
    icon: "bi-clock-history",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.08)",
  },
];

const GROUP_VISUALS = [
  { colorClass: "react", iconClass: "bi-box-fill" },
  { colorClass: "js", iconClass: "bi-people-fill" },
  { colorClass: "gaming", iconClass: "bi-controller" },
];

function getGroupId(g) {
  return g?.id ?? g?.groupID;
}

function getGroupMemberCount(g) {
  const members = g?.members || [g?.adminID];
  return Array.isArray(members) ? members.length : 1;
}

export default function ProfilePage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const highlightPostId = searchParams.get("highlightPost");
  const currentUser = useSelector(selectCurrentUser);
  const isOwnProfile = currentUser?.userId === userId;
  const viewerId = currentUser?.userId;
  const [activeTab, setActiveTab] = useState("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [userQuery, postsQuery, friendsQuery, likesQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.users.byId(userId),
        queryFn: () => usersApi.getUserById(userId),
        enabled: !!userId,
      },
      {
        queryKey: queryKeys.posts.byUser(userId),
        queryFn: () => usersApi.getUserPosts(userId),
        enabled: !!userId,
      },
      {
        queryKey: queryKeys.friends.list(userId),
        queryFn: () => friendsApi.getFriends(userId).catch(() => []),
        enabled: !!userId,
      },
      {
        queryKey: queryKeys.likes.receivedByUser(userId),
        queryFn: () => usersApi.getUserPostLikes(userId).catch(() => []),
        enabled: !!userId,
      },
    ],
  });

  // ── Sidebar data sources ──────────────────────────────────────────────
  // "Friend suggestions", "Trending", "Recently active" and "Suggested
  // groups" are framed around the logged-in viewer (like a persistent
  // utility rail), not the profile being looked at — mirrors how the
  // right column works on the Home feed. When you're on your own
  // profile, viewerId === userId, so these simply reuse the queries above.
  const { data: allGroups = [] } = useAllGroups();
  const { data: allUsers = [] } = useAllUsers();
  const { data: viewerFriends = [] } = useFriends(viewerId);
  const { data: viewerSentRequests = [] } = useSentRequests(viewerId);

  const sendFriendRequestMutation = useSendFriendRequest();
  const joinGroupMutation = useJoinGroup();

  const [addingIds, setAddingIds] = useState(new Set());
  const [joiningIds, setJoiningIds] = useState(new Set());

  useEffect(() => {
    if (!highlightPostId || !postsQuery.data || postsQuery.data.length === 0)
      return;
    setActiveTab("posts");
    const el = document.getElementById(`post-${highlightPostId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("post-highlight");
    const timer = setTimeout(() => el.classList.remove("post-highlight"), 1800);
    return () => clearTimeout(timer);
  }, [highlightPostId, postsQuery.data]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${userId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard unavailable — fail silently, no native alert */
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1800);
  };

  // ── Derived sidebar data ───────────────────────────────────────────────
  const friends = friendsQuery.data || [];

  const joinedGroups = useMemo(() => {
    const uid = Number(userId);
    return (allGroups || []).filter((g) =>
      (g.members || [g.adminID]).map(Number).includes(uid),
    );
  }, [allGroups, userId]);

  const photoTiles = useMemo(() => {
    const seen = new Set();
    const tiles = [];
    const add = (src, key) => {
      if (!src || seen.has(src)) return;
      seen.add(src);
      tiles.push({ src, key });
    };
    add(userQuery.data?.profile_picture, "self");
    friends.forEach((f) => add(f.profile_picture, f.friendId));
    return tiles.slice(0, 6);
  }, [userQuery.data, friends]);

  const viewerFriendIds = useMemo(
    () => new Set(viewerFriends.map((f) => Number(f.friendId))),
    [viewerFriends],
  );
  const viewerSentIds = useMemo(
    () => new Set(viewerSentRequests.map((r) => Number(r.userID2))),
    [viewerSentRequests],
  );

  const suggestions = useMemo(() => {
    const viewerIdNum = Number(viewerId);
    return (allUsers || [])
      .filter((u) => {
        const uid = Number(u.userID ?? u.userId ?? u.id);
        if (!uid || uid === viewerIdNum) return false;
        if (viewerFriendIds.has(uid)) return false;
        if (viewerSentIds.has(uid)) return false;
        return true;
      })
      .slice(0, 4);
  }, [allUsers, viewerId, viewerFriendIds, viewerSentIds]);

  const activeFriends = useMemo(() => {
    // No real "last seen" data exists yet, so online status is a stable,
    // id-derived placeholder (same trick GroupCard uses for its own
    // "Active now" / "days ago" filler) — deterministic, not random per render.
    return viewerFriends
      .map((f) => ({ ...f, online: Number(f.friendId) % 3 !== 0 }))
      .sort((a, b) => Number(b.online) - Number(a.online))
      .slice(0, 5);
  }, [viewerFriends]);

  const viewerJoinedGroupIds = useMemo(() => {
    const viewerIdNum = Number(viewerId);
    return new Set(
      (allGroups || [])
        .filter((g) =>
          (g.members || [g.adminID]).map(Number).includes(viewerIdNum),
        )
        .map((g) => getGroupId(g)),
    );
  }, [allGroups, viewerId]);

  const suggestedGroups = useMemo(() => {
    return (allGroups || [])
      .filter((g) => !viewerJoinedGroupIds.has(getGroupId(g)))
      .slice(0, 3);
  }, [allGroups, viewerJoinedGroupIds]);

  const handleAddSuggestion = (friendId) => {
    if (!viewerId || addingIds.has(friendId)) return;
    setAddingIds((prev) => new Set(prev).add(friendId));
    sendFriendRequestMutation.mutate(
      { userId: viewerId, friendId },
      {
        onSettled: () =>
          setAddingIds((prev) => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          }),
      },
    );
  };

  const handleJoinSuggestedGroup = (groupId) => {
    if (!viewerId || joiningIds.has(groupId)) return;
    setJoiningIds((prev) => new Set(prev).add(groupId));
    joinGroupMutation.mutate(
      { groupId, userId: viewerId },
      {
        onSettled: () =>
          setJoiningIds((prev) => {
            const next = new Set(prev);
            next.delete(groupId);
            return next;
          }),
      },
    );
  };

  if (userQuery.isLoading) return <Loader />;

  const user = userQuery.data;
  const postsCount = postsQuery.data?.length || 0;
  const friendsCount = friendsQuery.data?.length || 0;
  const likesCount = likesQuery.data?.length || 0;
  const joinedDate = user?.createdAt || user?.created_at;

  return (
    <div className="container-fluid page-container px-2">
      <div className="row g-4">
        {/* ================= LEFT COLUMN: ABOUT THIS PROFILE ================= */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="sticky-top" style={{ top: "90px", zIndex: 10 }}>
            {/* Overview */}
            <div className="sidebar-section shadow-sm">
              <div className="sidebar-header-row">
                <h6 className="text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-person-lines-fill text-primary"></i>{" "}
                  Overview
                </h6>
              </div>
              <div className="d-flex flex-column gap-2">
                <div className="stat-card" style={{ padding: "10px 14px" }}>
                  <div
                    className="stat-icon-wrapper purple"
                    style={{ width: 36, height: 36, fontSize: "1rem" }}
                  >
                    <i className="bi bi-grid-3x3-gap-fill"></i>
                  </div>
                  <div>
                    <span
                      className="fw-bold text-dark d-block"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {postsCount}
                    </span>
                    <span
                      className="text-muted small"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Posts
                    </span>
                  </div>
                </div>
                <div className="stat-card" style={{ padding: "10px 14px" }}>
                  <div
                    className="stat-icon-wrapper blue"
                    style={{ width: 36, height: 36, fontSize: "1rem" }}
                  >
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <div>
                    <span
                      className="fw-bold text-dark d-block"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {friendsCount}
                    </span>
                    <span
                      className="text-muted small"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Friends
                    </span>
                  </div>
                </div>
                <div className="stat-card" style={{ padding: "10px 14px" }}>
                  <div
                    className="stat-icon-wrapper orange"
                    style={{ width: 36, height: 36, fontSize: "1rem" }}
                  >
                    <i className="bi bi-heart-fill"></i>
                  </div>
                  <div>
                    <span
                      className="fw-bold text-dark d-block"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {likesCount}
                    </span>
                    <span
                      className="text-muted small"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Likes
                    </span>
                  </div>
                </div>
                <div className="stat-card" style={{ padding: "10px 14px" }}>
                  <div
                    className="stat-icon-wrapper green"
                    style={{ width: 36, height: 36, fontSize: "1rem" }}
                  >
                    <i className="bi bi-collection-fill"></i>
                  </div>
                  <div>
                    <span
                      className="fw-bold text-dark d-block"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {joinedGroups.length}
                    </span>
                    <span
                      className="text-muted small"
                      style={{ fontSize: "0.72rem" }}
                    >
                      Groups
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Friends preview */}
            <div className="sidebar-section shadow-sm">
              <div className="sidebar-header-row">
                <h6 className="text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-people-fill text-primary"></i> Friends
                </h6>
                {friends.length > 0 && (
                  <button
                    type="button"
                    className="view-all-link border-0 bg-transparent p-0"
                    onClick={() => setActiveTab("friends")}
                  >
                    See all
                  </button>
                )}
              </div>
              {friends.length === 0 ? (
                <p className="text-muted small mb-0 py-2">No friends yet.</p>
              ) : (
                <div className="row row-cols-3 g-2 text-center">
                  {friends.slice(0, 6).map((f) => (
                    <div className="col" key={f.friendshipId || f.friendId}>
                      <Link
                        to={`/profile/${f.friendId}`}
                        className="text-decoration-none d-block"
                      >
                        <Avatar
                          src={f.profile_picture}
                          username={f.username}
                          size={52}
                        />
                        <div
                          className="text-dark fw-semibold text-truncate mt-1"
                          style={{ fontSize: "0.72rem" }}
                        >
                          {f.username}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Groups joined */}
            <div className="sidebar-section shadow-sm">
              <div className="sidebar-header-row">
                <h6 className="text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-collection-fill text-primary"></i> Groups
                </h6>
                <Link to="/groups" className="view-all-link">
                  See all
                </Link>
              </div>
              {joinedGroups.length === 0 ? (
                <p className="text-muted small mb-0 py-2">
                  Not part of any groups yet.
                </p>
              ) : (
                <div className="recommended-list">
                  {joinedGroups.slice(0, 4).map((g, idx) => {
                    const gid = getGroupId(g);
                    const visual = GROUP_VISUALS[idx % GROUP_VISUALS.length];
                    return (
                      <div key={gid} className="recommended-group-item">
                        <div className="recommended-info-wrapper min-w-0">
                          <div
                            className={`recommended-logo-circle ${visual.colorClass}`}
                          >
                            <i className={`bi ${visual.iconClass}`}></i>
                          </div>
                          <div className="min-w-0">
                            <span
                              className="fw-bold text-dark d-block small text-truncate"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {g.groupName}
                            </span>
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.72rem" }}
                            >
                              {getGroupMemberCount(g)}{" "}
                              {getGroupMemberCount(g) === 1
                                ? "member"
                                : "members"}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/groups/${gid}/chat`}
                          className="btn btn-outline-primary btn-sm px-3 py-1 fw-bold flex-shrink-0"
                          style={{ borderRadius: "12px", fontSize: "0.75rem" }}
                        >
                          Open
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Photos preview */}
            <div className="sidebar-section shadow-sm mb-0">
              <div className="sidebar-header-row">
                <h6 className="text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-images text-primary"></i> Photos
                </h6>
              </div>
              {photoTiles.length === 0 ? (
                <div className="text-center py-3">
                  <i
                    className="bi bi-camera text-muted"
                    style={{ fontSize: "1.8rem" }}
                  ></i>
                  <p className="text-muted small mt-2 mb-0">
                    No photos to show yet.
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {photoTiles.map((p) => (
                    <img
                      key={p.key}
                      src={p.src}
                      alt=""
                      style={{
                        width: "calc(33.333% - 6px)",
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= MIDDLE COLUMN: EXISTING PROFILE CONTENT ================= */}
        <div className="col-lg-6 col-md-8 col-12 mx-auto">
          {/* Condensed sticky bar — only shows once you've scrolled past the header */}
          <div
            className={`sticky-top bg-white border-bottom d-flex align-items-center gap-2 px-3 ${
              isScrolled ? "shadow-sm py-2" : "py-0"
            }`}
            style={{
              top: 0,
              zIndex: 1030,
              maxHeight: isScrolled ? 56 : 0,
              overflow: "hidden",
              transition: "max-height .2s ease, padding .2s ease",
            }}
          >
            <Avatar
              src={user?.profile_picture}
              username={user?.username}
              size={88}
            />
            <div className="min-w-0">
              <div
                className="fw-bold text-dark text-truncate"
                style={{ fontSize: "0.95rem" }}
              >
                {user?.username || "User Profile"}
              </div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                {postsCount} posts
              </div>
            </div>
          </div>

          {/* Profile card */}
          <div className="bg-white border rounded-3 shadow-sm overflow-hidden my-3">
            <div className="px-4 pt-0 pb-3">
              <div className="d-flex justify-content-between align-items-start">
                <div
                  className="rounded-circle bg-white d-inline-flex p-1"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <Avatar
                    src={user?.profile_picture}
                    username={user?.username}
                    size={104}
                  />
                </div>
                <div className="d-flex align-items-center gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    onClick={handleShare}
                  >
                    <i
                      className={`bi ${shareCopied ? "bi-check2" : "bi-share"} me-1`}
                    ></i>
                    {shareCopied ? "Copied" : "Share profile"}
                  </button>
                  {isOwnProfile && (
                    <button
                      type="button"
                      className="btn btn-sm rounded-pill px-3 text-white"
                      style={{
                        background: "var(--primary-gradient)",
                        border: "none",
                      }}
                      onClick={() => setEditOpen(true)}
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Edit profile
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <h3 className="fw-bold mb-1">
                  {user?.username || "User Profile"}
                </h3>
                <div className="text-secondary small">
                  @{user?.username || "unknown"}
                </div>
              </div>

              <div className="small text-secondary mt-2">
                {user?.email && (
                  <div className="mb-1">
                    <i className="bi bi-envelope me-2"></i>
                    {user.email}
                  </div>
                )}
                {joinedDate && (
                  <div className="mb-1">
                    <i className="bi bi-calendar3 me-2"></i>
                    Joined{" "}
                    {new Date(joinedDate).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>

              {/* Stat strip */}
              <div className="d-flex flex-wrap gap-4 mt-3">
                <div>
                  <span className="fw-bold">{postsCount}</span>{" "}
                  <span className="text-muted">Posts</span>
                </div>

                <div>
                  <span className="fw-bold">{friendsCount}</span>{" "}
                  <span className="text-muted">Friends</span>
                </div>

                <div>
                  <span className="fw-bold">{likesCount}</span>{" "}
                  <span className="text-muted">Likes</span>
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <EditProfileModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                user={user}
              />
            )}

            {/* Tabs */}
            <ul
              className="nav nav-tabs px-4 mt-3"
              style={{ borderColor: "var(--border)" }}
            >
              <li className="nav-item">
                <button
                  className={`nav-link border-0 ${activeTab === "posts" ? "active fw-semibold text-dark" : "text-muted"}`}
                  onClick={() => setActiveTab("posts")}
                >
                  <i className="bi bi-grid-3x3-gap-fill me-1"></i>
                  Posts <span className="text-muted">({postsCount})</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "friends" ? "active fw-semibold text-dark" : "text-muted"}`}
                  onClick={() => setActiveTab("friends")}
                >
                  <i className="bi bi-people-fill me-1"></i>
                  Friends <span className="text-muted">({friendsCount})</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Feed */}
          <div>
            {activeTab === "posts" && (
              <div>
                {postsQuery.isLoading ? (
                  <Loader />
                ) : !postsQuery.data || postsQuery.data.length === 0 ? (
                  <p className="text-muted text-center py-4">No posts yet.</p>
                ) : (
                  postsQuery.data.map((post) => (
                    <div key={post.postID} className="mb-3">
                      <PostCard post={post} />
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "friends" && (
              <div>
                {friendsQuery.isLoading ? (
                  <Loader />
                ) : !friendsQuery.data || friendsQuery.data.length === 0 ? (
                  <p className="text-muted text-center py-4">No friends yet.</p>
                ) : (
                  <div className="row row-cols-1 row-cols-md-2 g-3">
                    {friendsQuery.data.map((friend) => (
                      <div
                        className="col-12 col-sm-6"
                        key={friend.friendshipId || friend.friendId}
                      >
                        <UserCard
                          user={{
                            userId: friend.friendId,
                            username: friend.username,
                            profile_picture: friend.profile_picture,
                          }}
                          size={48}
                          subtitle={friend.email}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DISCOVER & CONNECT ================= */}
        <div className="col-lg-3 col-md-4 d-none d-md-block">
          <div className="sticky-top" style={{ top: "90px", zIndex: 10 }}>
            {/* Friend suggestions */}
            <div className="sidebar-section shadow-sm">
              <div className="sidebar-header-row">
                <h6 className="text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-person-plus-fill text-primary"></i> People
                  You May Know
                </h6>
                <Link to="/friends" className="view-all-link">
                  See all
                </Link>
              </div>
              {suggestions.length === 0 ? (
                <p className="text-muted small mb-0 py-2">
                  No suggestions right now.
                </p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {suggestions.map((u) => {
                    const uid = u.userID ?? u.userId ?? u.id;
                    return (
                      <UserCard
                        key={uid}
                        user={u}
                        size={40}
                        action={
                          <button
                            type="button"
                            className="btn btn-primary btn-sm px-3 py-1 fw-bold"
                            style={{
                              borderRadius: "10px",
                              fontSize: "0.75rem",
                            }}
                            disabled={addingIds.has(uid)}
                            onClick={() => handleAddSuggestion(uid)}
                          >
                            {addingIds.has(uid) ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              ></span>
                            ) : (
                              "Add"
                            )}
                          </button>
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trending topics */}
            <div className="sidebar-section shadow-sm">
              <div className="sidebar-header-row">
                <h6 className="text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-hash text-primary"></i> Trending Topics
                </h6>
              </div>
              <div className="d-flex flex-column gap-2">
                {TRENDING_TOPICS.map((t, idx) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center gap-3 p-2 rounded-4"
                    style={{ background: "#f8fafc" }}
                  >
                    <div
                      className="p-2 rounded-3 d-flex"
                      style={{ backgroundColor: t.bg }}
                    >
                      <i
                        className={`bi ${t.icon}`}
                        style={{ color: t.color }}
                      ></i>
                    </div>
                    <div className="min-w-0">
                      <div
                        className="fw-bold text-dark text-truncate"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {t.tag}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.72rem" }}
                      >
                        {t.posts}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently active friends */}
            <div className="sidebar-section shadow-sm">
              <div className="sidebar-header-row">
                <h6 className="text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-broadcast text-primary"></i> Recently
                  Active
                </h6>
              </div>
              {activeFriends.length === 0 ? (
                <p className="text-muted small mb-0 py-2">
                  No friends to show.
                </p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {activeFriends.map((f) => (
                    <UserCard
                      key={f.friendshipId || f.friendId}
                      user={{
                        userId: f.friendId,
                        username: f.username,
                        profile_picture: f.profile_picture,
                      }}
                      size={40}
                      subtitle={
                        <span
                          className="d-inline-flex align-items-center gap-1"
                          style={{
                            color: f.online ? "#10b981" : "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          <span
                            className="rounded-circle d-inline-block"
                            style={{
                              width: 6,
                              height: 6,
                              backgroundColor: f.online ? "#10b981" : "#94a3b8",
                            }}
                          ></span>
                          {f.online ? "Active now" : "Active recently"}
                        </span>
                      }
                      action={
                        <button
                          type="button"
                          className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32 }}
                          title="Message"
                          onClick={() => navigate(`/messages/${f.friendId}`)}
                        >
                          <i className="bi bi-chat-dots"></i>
                        </button>
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Suggested groups */}
            <div className="sidebar-section shadow-sm mb-0">
              <div className="sidebar-header-row">
                <h6 className="text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-stars text-primary"></i> Suggested Groups
                </h6>
                <Link to="/groups" className="view-all-link">
                  Discover
                </Link>
              </div>
              {suggestedGroups.length === 0 ? (
                <p className="text-muted small mb-0 py-2">
                  You've joined every group!
                </p>
              ) : (
                <div className="recommended-list">
                  {suggestedGroups.map((g, idx) => {
                    const gid = getGroupId(g);
                    const visual =
                      GROUP_VISUALS[(idx + 1) % GROUP_VISUALS.length];
                    return (
                      <div key={gid} className="recommended-group-item">
                        <div className="recommended-info-wrapper min-w-0">
                          <div
                            className={`recommended-logo-circle ${visual.colorClass}`}
                          >
                            <i className={`bi ${visual.iconClass}`}></i>
                          </div>
                          <div className="min-w-0">
                            <span
                              className="fw-bold text-dark d-block small text-truncate"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {g.groupName}
                            </span>
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.72rem" }}
                            >
                              {getGroupMemberCount(g)}{" "}
                              {getGroupMemberCount(g) === 1
                                ? "member"
                                : "members"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm px-3 py-1 fw-bold flex-shrink-0"
                          style={{ borderRadius: "12px", fontSize: "0.75rem" }}
                          disabled={joiningIds.has(gid)}
                          onClick={() => handleJoinSuggestedGroup(gid)}
                        >
                          {joiningIds.has(gid) ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            "Join"
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
