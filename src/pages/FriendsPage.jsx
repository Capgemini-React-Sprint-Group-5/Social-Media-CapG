import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/index.js';
import { useFriends, usePendingRequests, useAddFriend, useRemoveFriend, useSendFriendRequest, useSentRequests, useCancelFriendRequest } from '../hooks/useFriends.js';
import { useUserSearch } from '../hooks/useUsers.js';
import Loader from '../components/common/Loader.jsx';
import Avatar from '../components/common/Avatar.jsx';

export default function FriendsPage() {
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.userId || currentUser?.userID || currentUser?.id; 
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

  const { data: sentRequests = [] } = useSentRequests(userId);
  const addFriendMutation = useAddFriend();
  const cancelFriendMutation = useCancelFriendRequest();
  
  // ── Mutations ────────────────────────────────────────────────────────
  const { mutate: addFriend, isPending: adding } = useAddFriend();
  const { mutate: removeFriend, isPending: removing } = useRemoveFriend();
  const { mutate: sendRequest, isPending: sending } = useSendFriendRequest();

  // ── Track which users are currently being processed ──────────────────
  const [processingUsers, setProcessingUsers] = useState(new Set());

  // ── Search ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

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

  // ── Helper: Get user ID from any user object ──────────────────────────
  const getUserId = (user) => user?.userID ?? user?.userId ?? user?.id;

  // ── Helper: Check friendship status ──────────────────────────────────
  const friendshipStatus = (targetUserId) => {
    if (Number(targetUserId) === Number(userId))
      return "self";
    const isFriend = friends.some(
      (f) => Number(f.friendId) === Number(targetUserId)
    );
    if (isFriend)
      return "friend";
    const sent = sentRequests.some(
      (r) => Number(r.userID2) === Number(targetUserId)
    );
    if (sent)
      return "sent";
    const received = pending.some(
      (r) => Number(r.userID1) === Number(targetUserId)
    );
    if (received)
      return "pending";
    return "none";
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleRemoveFriend = (friendId) => {
    if (window.confirm('Remove this friend?')) {
      removeFriend(
        { userId, friendId },
        { onSuccess: () => refetchFriends() }
      );
    }
  };

  const handleCancelRequest = (friendId) => {
    cancelFriendMutation.mutate({
        userId,
        friendId,
    });
  };

  const handleAcceptRequest = (friendId) => {
    setProcessingUsers(prev => new Set(prev).add(friendId));
    addFriend(
      { userId, friendId },
      {
        onSuccess: () => {
          refetchFriends();
          refetchPending();
          setProcessingUsers(prev => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        },
        onError: () => {
          setProcessingUsers(prev => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        }
      }
    );
  };

  const handleDeclineRequest = (friendId) => {
    setProcessingUsers(prev => new Set(prev).add(friendId));
    removeFriend(
      { userId, friendId },
      {
        onSuccess: () => {
          refetchPending();
          setProcessingUsers(prev => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        },
        onError: () => {
          setProcessingUsers(prev => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        }
      }
    );
  };

  const handleSendRequest = (friendId) => {
    const status = friendshipStatus(friendId);
    if (status !== 'none') return;

    setProcessingUsers(prev => new Set(prev).add(friendId));
    sendRequest(
      { userId, friendId },
      {
        onSuccess: () => {
          refetchPending();
          setProcessingUsers(prev => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        },
        onError: () => {
          setProcessingUsers(prev => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        }
      }
    );
  };

  const isProcessing = (friendId) => processingUsers.has(friendId);

  // ── Render helpers ────────────────────────────────────────────────────
  const renderFriendsTab = () => (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-people-fill text-primary fs-4"></i>
        <h6 className="mb-0 fw-bold">My Friends</h6>
        <span className="badge bg-primary rounded-pill ms-auto">{friends.length}</span>
      </div>

      {loadingFriends ? (
        <Loader size="sm" />
      ) : friends.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
          <p className="text-muted mt-3">You haven't added any friends yet.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {friends.map((f, index) => {
            // Aggressive fallback parsing sequence
            const resolvedName = 
              f.username || 
              f.user?.username || 
              f.friend?.username || 
              f.friendId?.username ||
              f.user2?.username ||
              f.user1?.username ||
              f.receiver?.username ||
              f.sender?.username ||
              (f.friendId ? `User #${f.friendId}` : `User #${index + 1}`);
            
            return (
              <div
                key={f.friendshipId || `${f.friendId}-${index}`}
                className="d-flex align-items-center gap-3 p-3 bg-white border rounded-3 shadow-sm"
              >
                <Avatar username={resolvedName} size={44} />
                <span className="flex-grow-1 fw-semibold text-dark">{resolvedName}</span>
                <button
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                  disabled={removing || isProcessing(f.friendId)}
                  onClick={() => handleRemoveFriend(f.friendId)}
                >
                  {isProcessing(f.friendId) ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-dash"></i>
                      <span>Remove</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderPendingTab = () => (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-clock-history text-warning fs-4"></i>
        <h6 className="mb-0 fw-bold">Pending Requests</h6>
        <span className="badge bg-warning text-dark rounded-pill ms-auto">{pending.length}</span>
      </div>

      {loadingPending ? (
        <Loader size="sm" />
      ) : pending.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
          <p className="text-muted mt-3">All clear – no pending requests.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {pending.map((req, index) => {
            const pendingName = 
              req.username || 
              req.user?.username || 
              req.sender?.username || 
              req.user1?.username || 
              `User #${req.friendId || index}`;
            
            return (
              <div
                key={req.friendshipId || `${req.friendId}-${index}`}
                className="d-flex align-items-center gap-3 p-3 bg-white border rounded-3 shadow-sm"
              >
                <Avatar username={pendingName} size={44} />
                <span className="flex-grow-1 fw-semibold text-dark">{pendingName}</span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm d-flex align-items-center gap-1"
                    disabled={adding || isProcessing(req.friendId)}
                    onClick={() => handleAcceptRequest(req.friendId)}
                  >
                    <i className="bi bi-check-lg"></i> Accept
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    disabled={removing || isProcessing(req.friendId)}
                    onClick={() => handleDeclineRequest(req.friendId)}
                  >
                    <i className="bi bi-x-lg"></i> Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSearchTab = () => (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-search text-primary fs-4"></i>
        <h6 className="mb-0 fw-bold">Find People</h6>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searching && <Loader size="sm" />}
      
      {!searching &&
        searchResults.map((u) => {
          const uid = getUserId(u);
          if (!uid) return null;
          const status = friendshipStatus(uid);
          const processing = isProcessing(uid);
          let actionButton = null;

          if (status === 'self') actionButton = <span className="badge bg-secondary">You</span>;
          else if (status === 'friend') actionButton = <span className="badge bg-success">Friend</span>;
          else if (status === 'sent') {
            actionButton = (
              <button className="btn btn-warning btn-sm" disabled={processing} onClick={() => handleCancelRequest(uid)}>
                Cancel Request
              </button>
            );
          } else if (status === 'pending') {
            actionButton = <span className="badge bg-warning text-dark">Pending</span>;
          } else {
            actionButton = (
              <button className="btn btn-primary btn-sm" disabled={processing} onClick={() => handleSendRequest(uid)}>
                Add Friend
              </button>
            );
          }

          const searchUserName = u.username || `User #${uid}`;
          return (
            <div key={uid} className="d-flex align-items-center gap-3 p-3 bg-white border rounded-3 mb-2">
              <Avatar username={searchUserName} size={44} />
              <span className="flex-grow-1 fw-semibold text-dark">{searchUserName}</span>
              {actionButton}
            </div>
          );
        })}
    </div>
  );

  return (
    <div className="friends-page p-3">
      <ul className="nav nav-pills mb-4 gap-2">
        <button className={`nav-link ${activeTab === 'friends' ? 'active' : 'bg-light'}`} onClick={() => setActiveTab('friends')}>
          Friends ({friends.length})
        </button>
        <button className={`nav-link ${activeTab === 'pending' ? 'active' : 'bg-light'}`} onClick={() => setActiveTab('pending')}>
          Pending ({pending.length})
        </button>
        <button className={`nav-link ${activeTab === 'search' ? 'active' : 'bg-light'}`} onClick={() => setActiveTab('search')}>
          Find People
        </button>
      </ul>
      <div className="tab-content">
        {activeTab === 'friends' && renderFriendsTab()}
        {activeTab === 'pending' && renderPendingTab()}
        {activeTab === 'search' && renderSearchTab()}
      </div>
    </div>
  );
}