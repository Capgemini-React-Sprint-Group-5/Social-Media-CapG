import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/index.js';
import {
  useFriends,
  usePendingRequests,
  useAddFriend,
  useRemoveFriend,
  useSendFriendRequest,
} from '../hooks/useFriends.js';
import { useUserSearch } from '../hooks/useUsers.js';
import Loader from '../components/common/Loader.jsx';
import Avatar from '../components/common/Avatar.jsx';

/**
 * FriendsPage  — Owner: C (Authentication & Data Layer)
 *
 * This page now covers the full friend entity workflow:
 *  - View friends and remove them
 *  - View pending incoming requests (accept / decline)
 *  - Search for other users and send friend requests
 */
export default function FriendsPage() {
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.userId;

  // Tab state
  const [activeTab, setActiveTab] = useState('friends');

  // ── Friends list ──────────────────────────────────────────────────────
  const {
    data: friends = [],
    isLoading: loadingFriends,
    refetch: refetchFriends,
  } = useFriends(userId);

  // ── Pending requests ─────────────────────────────────────────────────
  const {
    data: pending = [],
    isLoading: loadingPending,
    refetch: refetchPending,
  } = usePendingRequests(userId);

  // ── Mutations ────────────────────────────────────────────────────────
  const { mutate: addFriend, isPending: adding } = useAddFriend();
  const { mutate: removeFriend, isPending: removing } = useRemoveFriend();
  const { mutate: sendRequest, isPending: sending } = useSendFriendRequest();

  // ── Search ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: searchResults = [],
    isLoading: searching,
    isError: searchError,
  } = useUserSearch(debouncedQuery);

  // ── Helper: check friendship status ──────────────────────────────────
  const friendshipStatus = (targetUserId) => {
    if (Number(targetUserId) === Number(userId)) return 'self';
    const isFriend = friends.some(
      (f) => Number(f.friendId) === Number(targetUserId)
    );
    if (isFriend) return 'friend';
    const isPending = pending.some(
      (p) => Number(p.friendId) === Number(targetUserId)
    );
    if (isPending) return 'pending';
    return 'none';
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleRemoveFriend = (friendId) => {
    if (window.confirm('Remove this friend?')) {
      removeFriend(
        { userId, friendId },
        {
          onSuccess: () => {
            refetchFriends();
          },
        }
      );
    }
  };

  const handleAcceptRequest = (friendId) => {
    addFriend(
      { userId, friendId },
      {
        onSuccess: () => {
          refetchFriends();
          refetchPending();
        },
      }
    );
  };

  const handleDeclineRequest = (friendId) => {
    removeFriend(
      { userId, friendId },
      {
        onSuccess: () => {
          refetchPending();
        },
      }
    );
  };

  const handleSendRequest = (friendId) => {
    sendRequest(
      { userId, friendId },
      {
        onSuccess: () => {
          // Refetch pending to update the "pending" status
          refetchPending();
        },
      }
    );
  };

  // ── Render helpers ────────────────────────────────────────────────────
  const renderFriendsTab = () => (
    <div>
      <h6 className="mb-3">
        My Friends ({friends.length})
      </h6>
      {loadingFriends ? (
        <Loader size="sm" />
      ) : friends.length === 0 ? (
        <p className="text-muted">You have no friends yet.</p>
      ) : (
        friends.map((f) => (
          <div
            key={f.friendId}
            className="d-flex align-items-center gap-2 card card-body mb-2"
          >
            <Avatar username={f.username} size={36} />
            <span className="flex-grow-1 fw-semibold">{f.username}</span>
            <button
              className="btn btn-outline-danger btn-sm"
              disabled={removing}
              onClick={() => handleRemoveFriend(f.friendId)}
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );

  const renderPendingTab = () => (
    <div>
      <h6 className="mb-3">
        Pending Requests ({pending.length})
      </h6>
      {loadingPending ? (
        <Loader size="sm" />
      ) : pending.length === 0 ? (
        <p className="text-muted">No pending requests.</p>
      ) : (
        pending.map((req) => (
          <div
            key={req.friendshipId}
            className="d-flex align-items-center gap-2 card card-body mb-2"
          >
            <Avatar username={req.username} size={36} />
            <span className="flex-grow-1 fw-semibold">{req.username}</span>
            <button
              className="btn btn-success btn-sm"
              disabled={adding}
              onClick={() => handleAcceptRequest(req.friendId)}
            >
              Accept
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={removing}
              onClick={() => handleDeclineRequest(req.friendId)}
            >
              Decline
            </button>
          </div>
        ))
      )}
    </div>
  );

  const renderSearchTab = () => (
    <div>
      <h6 className="mb-3">Find People</h6>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searching && <Loader size="sm" />}
      {searchError && (
        <p className="text-danger">Something went wrong with the search.</p>
      )}

      {!searching && debouncedQuery && searchResults.length === 0 && (
        <p className="text-muted">No users found.</p>
      )}

      {!searching &&
        searchResults.map((u) => {
          const status = friendshipStatus(u.userId);
          let actionButton = null;

          if (status === 'self') {
            actionButton = (
              <span className="badge bg-secondary">You</span>
            );
          } else if (status === 'friend') {
            actionButton = (
              <span className="badge bg-success">Friend</span>
            );
          } else if (status === 'pending') {
            actionButton = (
              <span className="badge bg-warning text-dark">Pending</span>
            );
          } else {
            actionButton = (
              <button
                className="btn btn-primary btn-sm"
                disabled={sending}
                onClick={() => handleSendRequest(u.userId)}
              >
                Add Friend
              </button>
            );
          }

          return (
            <div
              key={u.userId}
              className="d-flex align-items-center gap-2 card card-body mb-2"
            >
              <Avatar username={u.username} size={36} />
              <span className="flex-grow-1 fw-semibold">{u.username}</span>
              {actionButton}
            </div>
          );
        })}
    </div>
  );

  // ── Main render ──────────────────────────────────────────────────────
  return (
    <div>
      <h5 className="mb-3">Friends</h5>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link border-0 ${
              activeTab === 'friends'
                ? 'active fw-bold border-bottom border-primary border-3'
                : 'text-muted'
            }`}
            onClick={() => setActiveTab('friends')}
          >
            Friends ({friends.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link border-0 ${
              activeTab === 'pending'
                ? 'active fw-bold border-bottom border-primary border-3'
                : 'text-muted'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pending.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link border-0 ${
              activeTab === 'search'
                ? 'active fw-bold border-bottom border-primary border-3'
                : 'text-muted'
            }`}
            onClick={() => setActiveTab('search')}
          >
            Find People
          </button>
        </li>
      </ul>

      {/* Tab panels */}
      {activeTab === 'friends' && renderFriendsTab()}
      {activeTab === 'pending' && renderPendingTab()}
      {activeTab === 'search' && renderSearchTab()}
    </div>
  );
}