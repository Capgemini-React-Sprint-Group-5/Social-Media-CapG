import { useParams, useSearchParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { selectCurrentUser } from "../store/index.js";
import { queryKeys } from "../queryKeys.js";
import * as usersApi from "../api/users.api.js";
import * as friendsApi from "../api/friends.api.js";
import Loader from "../components/common/Loader.jsx";
import Avatar from "../components/common/Avatar.jsx";
import PostCard from "../components/common/PostCard.jsx";
import EditProfileModal from "../components/common/EditProfileModal.jsx";

/**
 * ProfilePage  — Owner: A
 * Aggregates: user info, posts, friends, likes received.
 * All four queries fire in parallel via useQueries.
 */
export default function ProfilePage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const highlightPostId = searchParams.get("highlightPost");
  const currentUser = useSelector(selectCurrentUser);
  const isOwnProfile = currentUser?.userId === userId;
  const [activeTab, setActiveTab] = useState("posts");
  const [editOpen, setEditOpen] = useState(false);

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

  useEffect(() => {
    if (!highlightPostId || !postsQuery.data || postsQuery.data.length === 0) return;
    setActiveTab("posts");
    const el = document.getElementById(`post-${highlightPostId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("post-highlight");
    const timer = setTimeout(() => el.classList.remove("post-highlight"), 1800);
    return () => clearTimeout(timer);
  }, [highlightPostId, postsQuery.data]);

  if (userQuery.isLoading) return <Loader />;

  const user = userQuery.data;

  return (
    <div className="container py-3">
      {/* Profile Header */}
      <div className="d-flex align-items-center gap-3 mb-4 bg-white p-3 rounded-3 shadow-sm">
        <Avatar
          src={user?.profile_picture}
          username={user?.username}
          size={64}
        />
        <div>
          <h4 className="mb-0 fw-bold">{user?.username || "User Profile"}</h4>
          <small className="text-muted">{user?.email}</small>
        </div>
        {isOwnProfile && (
          <button
            className="btn btn-outline-secondary btn-sm ms-auto"
            onClick={() => setEditOpen(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {isOwnProfile && (
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          user={user}
        />
      )}

      {/* Tabs Control */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link border-0 ${activeTab === "posts" ? "active fw-bold border-bottom border-primary border-3" : "text-muted"}`}
            onClick={() => setActiveTab("posts")}
          >
            Posts ({postsQuery.data?.length || 0})
          </button>
        </li>
      </ul>

      {/* Tab Panels */}
      {activeTab === "posts" && (
        <div>
          {postsQuery.isLoading ? (
            <Loader />
          ) : !postsQuery.data || postsQuery.data.length === 0 ? (
            <p className="text-muted text-center py-4">No posts yet.</p>
          ) : (
            postsQuery.data.map((post) => (
              <PostCard key={post.postID} post={post} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
