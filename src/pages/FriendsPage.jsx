import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/index.js";
import {
  useFriends,
  usePendingRequests,
  useAddFriend,
  useRemoveFriend,
  useSendFriendRequest,
  useSentRequests,
  useCancelFriendRequest,
} from "../hooks/useFriends.js";
import { useUserSearch } from "../hooks/useUsers.js";
import Loader from "../components/common/Loader.jsx";
import Avatar from "../components/common/Avatar.jsx";

export default function FriendsPage() {
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.userId;
  const [activeTab, setActiveTab] = useState("friends");

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

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
    if (Number(targetUserId) === Number(userId)) return "self";
    const isFriend = friends.some(
      (f) => Number(f.friendId) === Number(targetUserId),
    );
    if (isFriend) return "friend";
    const sent = sentRequests.some(
      (r) => Number(r.userID2) === Number(targetUserId),
    );
    if (sent) return "sent";
    const received = pending.some(
      (r) => Number(r.userID1) === Number(targetUserId),
    );
    if (received) return "pending";
    return "none";
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleRemoveFriend = (friendId) => {
    if (window.confirm("Remove this friend?")) {
      removeFriend({ userId, friendId }, { onSuccess: () => refetchFriends() });
    }
  };

  const handleCancelRequest = (friendId) => {
    cancelFriendMutation.mutate({
      userId,
      friendId,
    });
  };

  const handleAcceptRequest = (friendId) => {
    setProcessingUsers((prev) => new Set(prev).add(friendId));
    addFriend(
      { userId, friendId },
      {
        onSuccess: () => {
          refetchFriends();
          refetchPending();
          setProcessingUsers((prev) => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        },
        onError: () => {
          setProcessingUsers((prev) => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        },
      },
    );
  };

  const handleDeclineRequest = (friendId) => {
    setProcessingUsers((prev) => new Set(prev).add(friendId));
    removeFriend(
      { userId, friendId },
      {
        onSuccess: () => {
          refetchPending();
          setProcessingUsers((prev) => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        },
        onError: () => {
          setProcessingUsers((prev) => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        },
      },
    );
  };

  const handleSendRequest = (friendId) => {
    const status = friendshipStatus(friendId);
    if (status !== "none") return;

    setProcessingUsers((prev) => new Set(prev).add(friendId));
    sendRequest(
      { userId, friendId },
      {
        onSuccess: () => {
          refetchPending();
          setProcessingUsers((prev) => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        },
        onError: () => {
          setProcessingUsers((prev) => {
            const next = new Set(prev);
            next.delete(friendId);
            return next;
          });
        },
      },
    );
  };

  const isProcessing = (friendId) => processingUsers.has(friendId);

  // ── Stats for the top bar ─────────────────────────────────────────────
  const totalFriends = friends.length;
  const totalPending = pending.length;
  const totalSent = sentRequests.length;
  const activeToday =
    friends.filter((f) => f?.active).length || Math.min(totalFriends, 5);

  // ── Render helpers ────────────────────────────────────────────────────
  const renderFriendsTab = () => (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-people-fill text-primary fs-4"></i>
        <h6 className="mb-0 fw-bold">My Friends</h6>
        <span className="badge bg-primary rounded-pill ms-auto">
          {friends.length}
        </span>
      </div>

      {loadingFriends ? (
        <Loader size="sm" />
      ) : friends.length === 0 ? (
        <div className="text-center py-5">
          <i
            className="bi bi-people text-muted"
            style={{ fontSize: "3rem" }}
          ></i>
          <p className="text-muted mt-3">You haven't added any friends yet.</p>
          <p className="text-muted small">
            Use the "Find People" tab to connect with others.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {friends.map((f) => (
            <div
              key={f.friendshipId || f.friendId}
              className="col-md-6 col-lg-4"
            >
              <div className="card border-0 shadow-sm h-100 hover-scale transition stats-card">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <Avatar
                      src={f?.profile_picture}
                      username={f.username}
                      size={48}
                    />
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{f.username}</h6>
                      <span className="text-muted small d-block">
                        {f.email || "No email"}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between text-muted small mb-3">
                    <span>
                      <i className="bi bi-calendar3 me-1"></i>
                      Friend
                    </span>
                    <span>
                      <i className="bi bi-chat-dots me-1"></i>
                      Online
                    </span>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                    disabled={removing || isProcessing(f.friendId)}
                    onClick={() => handleRemoveFriend(f.friendId)}
                  >
                    {isProcessing(f.friendId) ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span>Removing...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-dash"></i>
                        <span>Remove Friend</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPendingTab = () => (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-clock-history text-warning fs-4"></i>
        <h6 className="mb-0 fw-bold">Pending Requests</h6>
        <span className="badge bg-warning text-dark rounded-pill ms-auto">
          {pending.length}
        </span>
      </div>

      {loadingPending ? (
        <Loader size="sm" />
      ) : pending.length === 0 ? (
        <div className="text-center py-5">
          <i
            className="bi bi-check-circle text-success"
            style={{ fontSize: "3rem" }}
          ></i>
          <p className="text-muted mt-3">All clear – no pending requests.</p>
        </div>
      ) : (
        <div className="row g-3">
          {pending.map((req) => (
            <div
              key={req.friendshipId || req.friendId}
              className="col-md-6 col-lg-4"
            >
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <Avatar
                      src={req?.profile_picture}
                      username={req.username}
                      size={48}
                    />
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{req.username}</h6>
                      <span className="text-muted small d-block">
                        Pending request
                      </span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                      disabled={adding || isProcessing(req.friendId)}
                      onClick={() => handleAcceptRequest(req.friendId)}
                    >
                      {isProcessing(req.friendId) ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          <span>Accepting...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg"></i>
                          <span>Accept</span>
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                      disabled={removing || isProcessing(req.friendId)}
                      onClick={() => handleDeclineRequest(req.friendId)}
                    >
                      {isProcessing(req.friendId) ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          <span>Declining...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-x-lg"></i>
                          <span>Decline</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="btn btn-outline-secondary border-start-0"
              onClick={() => setSearchQuery("")}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      {searching && <Loader size="sm" />}
      {searchError && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>Something went wrong with the search.</span>
        </div>
      )}

      {!searching && debouncedQuery && searchResults.length === 0 && (
        <div className="text-center py-5">
          <i
            className="bi bi-person-x text-muted"
            style={{ fontSize: "3rem" }}
          ></i>
          <p className="text-muted mt-3">
            No users found for "{debouncedQuery}".
          </p>
        </div>
      )}

      {!searching &&
        searchResults.map((u) => {
          const uid = getUserId(u);
          if (!uid) return null;
          const status = friendshipStatus(uid);
          const processing = isProcessing(uid);
          let actionButton = null;

          if (status === "self") {
            actionButton = (
              <span className="badge bg-secondary d-flex align-items-center gap-1">
                <i className="bi bi-person"></i> You
              </span>
            );
          } else if (status === "friend") {
            actionButton = (
              <span className="badge bg-success d-flex align-items-center gap-1">
                <i className="bi bi-check-circle"></i> Friend
              </span>
            );
          } else if (status === "sent") {
            actionButton = (
              <button
                className="btn btn-warning btn-sm"
                disabled={
                  processing ||
                  addFriendMutation.isPending ||
                  cancelFriendMutation.isPending
                }
                onClick={() => handleCancelRequest(uid)}
              >
                Cancel Request
              </button>
            );
          } else if (status === "pending") {
            actionButton = (
              <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                {processing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-clock"></i> Pending
                  </>
                )}
              </span>
            );
          } else {
            actionButton = (
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                disabled={
                  processing ||
                  addFriendMutation.isPending ||
                  cancelFriendMutation.isPending
                }
                onClick={() => handleSendRequest(uid)}
              >
                {processing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus"></i>
                    <span>Add Friend</span>
                  </>
                )}
              </button>
            );
          }

          return (
            <div
              key={uid}
              className="d-flex align-items-center gap-3 p-3 bg-white border rounded-3 shadow-sm mb-2 hover-shadow transition"
              style={{ transition: "all 0.2s ease" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0.5rem 1rem rgba(0,0,0,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 .125rem .25rem rgba(0,0,0,0.075)")
              }
            >
              <Avatar
                src={u?.profile_picture}
                username={u.username}
                size={44}
              />
              <span className="flex-grow-1 fw-semibold text-dark">
                {u.username}
              </span>
              {actionButton}
            </div>
          );
        })}
    </div>
  );

  // ── Main render ──────────────────────────────────────────────────────
  return (
    <div className="friends-page px-2 py-2">
      {/* ── Header ── */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <i className="bi bi-people-fill text-primary fs-2"></i>
        <h4 className="mb-0 fw-bold">Friends</h4>
      </div>

      {/* ── Stats Bar ── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stats-card card border-0 shadow-sm p-3 h-100 transition">
            <div className="d-flex align-items-center gap-3">
              <div
                className="bg-primary-subtle rounded-circle p-2 d-flex align-items-center justify-content-center"
                style={{ width: 42, height: 42 }}
              >
                <i className="bi bi-people-fill text-primary fs-5"></i>
              </div>
              <div>
                <div className="fw-bold fs-3">{totalFriends}</div>
                <div className="text-muted small fw-semibold">Friends</div>
                <div
                  className="text-muted small"
                  style={{ fontSize: "0.7rem" }}
                >
                  Friends count
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stats-card card border-0 shadow-sm p-3 h-100 transition">
            <div className="d-flex align-items-center gap-3">
              <div
                className="bg-warning-subtle rounded-circle p-2 d-flex align-items-center justify-content-center"
                style={{ width: 42, height: 42 }}
              >
                <i className="bi bi-clock-history text-warning fs-5"></i>
              </div>
              <div>
                <div className="fw-bold fs-3">{totalPending}</div>
                <div className="text-muted small fw-semibold">Pending</div>
                <div
                  className="text-muted small"
                  style={{ fontSize: "0.7rem" }}
                >
                  Requests
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stats-card card border-0 shadow-sm p-3 h-100 transition">
            <div className="d-flex align-items-center gap-3">
              <div
                className="bg-info-subtle rounded-circle p-2 d-flex align-items-center justify-content-center"
                style={{ width: 42, height: 42 }}
              >
                <i className="bi bi-send text-info fs-5"></i>
              </div>
              <div>
                <div className="fw-bold fs-3">{totalSent}</div>
                <div className="text-muted small fw-semibold">Sent</div>
                <div
                  className="text-muted small"
                  style={{ fontSize: "0.7rem" }}
                >
                  Requests
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stats-card card border-0 shadow-sm p-3 h-100 transition">
            <div className="d-flex align-items-center gap-3">
              <div
                className="bg-success-subtle rounded-circle p-2 d-flex align-items-center justify-content-center"
                style={{ width: 42, height: 42 }}
              >
                <i className="bi bi-chat-dots-fill text-success fs-5"></i>
              </div>
              <div>
                <div className="fw-bold fs-3">{activeToday}</div>
                <div className="text-muted small fw-semibold">Active</div>
                <div
                  className="text-muted small"
                  style={{ fontSize: "0.7rem" }}
                >
                  Today
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 rounded-pill px-4 ${
              activeTab === "friends"
                ? "active bg-primary text-white"
                : "text-muted bg-light"
            }`}
            onClick={() => setActiveTab("friends")}
          >
            <i className="bi bi-people"></i>
            Friends
            <span className="badge bg-white text-primary rounded-pill ms-1">
              {friends.length}
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 rounded-pill px-4 ${
              activeTab === "pending"
                ? "active bg-warning text-dark"
                : "text-muted bg-light"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            <i className="bi bi-clock-history"></i>
            Pending
            <span className="badge bg-dark text-white rounded-pill ms-1">
              {pending.length}
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link d-flex align-items-center gap-2 rounded-pill px-4 ${
              activeTab === "search"
                ? "active bg-primary text-white"
                : "text-muted bg-light"
            }`}
            onClick={() => setActiveTab("search")}
          >
            <i className="bi bi-search"></i>
            Find People
          </button>
        </li>
      </ul>

      {/* ── Tab panels ── */}
      <div className="tab-content">
        {activeTab === "friends" && renderFriendsTab()}
        {activeTab === "pending" && renderPendingTab()}
        {activeTab === "search" && renderSearchTab()}
      </div>
    </div>
  );
}
