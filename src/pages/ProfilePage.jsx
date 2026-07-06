import { useParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useState } from "react";
import { selectCurrentUser } from "../store/index.js";
import { queryKeys } from "../queryKeys.js";
import * as usersApi from "../api/users.api.js";
import * as friendsApi from "../api/friends.api.js";
import Loader from "../components/common/Loader.jsx";
import Avatar from "../components/common/Avatar.jsx";
import PostCard from "../components/common/PostCard.jsx";
import UserCard from "../components/common/UserCard.jsx";
import EditProfileModal from "../components/common/EditProfileModal.jsx";

/**
 * ProfilePage  — Owner: A
 * Aggregates: user info, posts, friends, likes received.
 * All four queries fire in parallel via useQueries.
 */
export default function ProfilePage() {
  const { userId } = useParams();
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

  if (userQuery.isLoading) return <Loader />;

  const user = userQuery.data;

  return (
    <div className="container-fluid page-container ">
      {/* Profile Header */}
      <div className="d-flex align-items-center gap-3 my-4 bg-white p-4 rounded-4 shadow-sm">
        <Avatar
          src={user?.profile_picture}
          username={user?.username}
          size={72}
        />
        <div className="flex-grow-1 min-w-0">
          <h4 className="mb-1 fw-bold text-truncate">
            {user?.username || "User Profile"}
          </h4>
          <small className="text-muted">{user?.email}</small>
          <div className="d-flex gap-3 mt-2 small">
            <span className="text-muted">
              <span className="fw-semibold text-dark">
                {postsQuery.data?.length || 0}
              </span>{" "}
              posts
            </span>
            <span className="text-muted">
              <span className="fw-semibold text-dark">
                {friendsQuery.data?.length || 0}
              </span>{" "}
              friends
            </span>
            <span className="text-muted">
              <span className="fw-semibold text-dark">
                {likesQuery.data?.length || 0}
              </span>{" "}
              likes
            </span>
          </div>
        </div>
        {isOwnProfile && (
          <button
            className="btn btn-outline-secondary btn-sm flex-shrink-0"
            onClick={() => setEditOpen(true)}
          >
            <i className="bi bi-pencil-square me-1"></i>
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

      {/* Tabs Control — plain underline nav, no heavy color accents */}
      <ul className="nav nav-underline mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "posts" ? "active fw-semibold text-dark" : "text-muted"}`}
            onClick={() => setActiveTab("posts")}
          >
            <i className="bi bi-grid-3x3-gap-fill me-1"></i>
            Posts{" "}
            <span className="text-muted">({postsQuery.data?.length || 0})</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "friends" ? "active fw-semibold text-dark" : "text-muted"}`}
            onClick={() => setActiveTab("friends")}
          >
            <i className="bi bi-people-fill me-1"></i>
            Friends{" "}
            <span className="text-muted">
              ({friendsQuery.data?.length || 0})
            </span>
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
              <div key={post.postID} className="mb-4">
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
            <div className="row g-3">
              {friendsQuery.data.map((friend) => (
                <div
                  className="col-12 col-sm-6 col-lg-4"
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
  );
}
