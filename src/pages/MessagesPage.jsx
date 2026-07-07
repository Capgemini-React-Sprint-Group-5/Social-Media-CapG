import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, selectActiveThread } from "../store/index.js";
import { setActiveThread } from "../store/slices/uiSlice.js";
import { useFriends } from "../hooks/useFriends.js";
import {
  useConversation,
  useSendMessage,
  useUpdateMessage,
  useDeleteMessage,
} from "../hooks/useMessages.js";
import Loader from "../components/common/Loader.jsx";
import Avatar from "../components/common/Avatar.jsx";
import { useState, useRef, useEffect } from "react";

export default function MessagesPage() {
  const { otherUserId: routeUserId } = useParams();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const activeId = useSelector(selectActiveThread) || routeUserId;
  const userId = currentUser?.userId;
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // Queries & Mutations
  const { data: friends, isLoading: loadingFriends } = useFriends(userId);
  const { data: messages, isLoading: loadingThread } = useConversation(
    userId,
    activeId,
  );
  const { mutate: send, isPending: sending } = useSendMessage();
  const { mutate: updateMessage, isPending: updating } = useUpdateMessage();
  const { mutate: deleteMessage, isPending: deleting } = useDeleteMessage();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handlers
  const handleSend = () => {
    if (!text.trim() || !activeId) return;
    send({
      userId,
      otherUserId: activeId,
      messageData: { message_text: text },
    });
    setText("");
  };

  const handleUpdate = (messageId, newText) => {
    updateMessage({
      messageId,
      userId,
      otherUserId: activeId,
      messageData: { message_text: newText },
    });
  };

  const handleDelete = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMessage({ messageId, userId, otherUserId: activeId });
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp || timestamp === "NOW()") return "Just now";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  // ─── Render Message Bubble ────────────────────────────────────────────
  const MessageBubble = ({ message, isOwn }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.message_text);

    const handleSaveEdit = () => {
      if (!editText.trim() || editText === message.message_text) {
        setIsEditing(false);
        return;
      }
      handleUpdate(message.messageID, editText.trim());
      setIsEditing(false);
    };

    const handleCancelEdit = () => {
      setEditText(message.message_text);
      setIsEditing(false);
    };

    return (
      <div
        className={`d-flex ${isOwn ? "justify-content-end" : "justify-content-start"} mb-2`}
        style={{
          maxWidth: "75%",
          alignSelf: isOwn ? "flex-end" : "flex-start",
        }}
      >
        <div
          className={`position-relative p-2 rounded-3 shadow-sm ${
            isOwn ? "bg-primary text-white" : "bg-light text-dark border"
          }`}
          style={{ wordBreak: "break-word", minWidth: "60px" }}
        >
          {isEditing ? (
            <div className="d-flex flex-column gap-1">
              <textarea
                className="form-control form-control-sm"
                rows={2}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
              />
              <div className="d-flex gap-1 justify-content-end">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleCancelEdit}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleSaveEdit}
                  disabled={updating || !editText.trim()}
                >
                  {updating ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="fw-light" style={{ fontSize: "0.9rem" }}>
                {message.message_text}
              </span>
              <div
                className={`d-flex align-items-center gap-1 mt-1 ${
                  isOwn ? "text-white-50" : "text-muted"
                }`}
                style={{ fontSize: "0.65rem" }}
              >
                <span>{formatTime(message.timestamp)}</span>
                {isOwn && (
                  <>
                    <span className="mx-1">·</span>
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      style={{
                        color: isOwn ? "rgba(255,255,255,0.7)" : "#6c757d",
                      }}
                      onClick={() => setIsEditing(true)}
                      disabled={updating}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      style={{
                        color: isOwn ? "rgba(255,255,255,0.7)" : "#dc3545",
                      }}
                      onClick={() => handleDelete(message.messageID)}
                      disabled={deleting}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────

  return (
    <div className="d-flex gap-3" style={{ height: "75vh" }}>
      {/* Left panel — friend list */}
      <div
        className="border rounded-3 p-2 bg-white shadow-sm"
        style={{ width: 260, overflowY: "auto" }}
      >
        <h6 className="mb-3 fw-bold d-flex align-items-center gap-2">
          <i className="bi bi-chat-dots-fill text-primary"></i>
          Conversations
        </h6>
        {loadingFriends ? (
          <Loader size="sm" />
        ) : friends?.length === 0 ? (
          <p className="text-muted small">No friends to chat with.</p>
        ) : (
          friends?.map((f) => (
            <div
              key={f.friendId}
              className={`d-flex align-items-center gap-2 p-2 rounded-3 mb-1 cursor-pointer transition ${
                Number(activeId) === Number(f.friendId)
                  ? "bg-primary text-white"
                  : "hover-bg-light"
              }`}
              style={{ cursor: "pointer", transition: "background 0.15s" }}
              onClick={() => dispatch(setActiveThread(f.friendId))}
            >
              <Avatar
                src={f?.profile_picture}
                username={f.username}
                size={32}
              />
              <span className="text-truncate fw-semibold">{f.username}</span>
            </div>
          ))
        )}
      </div>

      {/* Right panel — message thread */}
      <div className="flex-grow-1 border rounded-3 bg-white shadow-sm d-flex flex-column">
        {/* Thread header */}
        {activeId && (
          <div className="p-3 border-bottom bg-light rounded-top-3">
            <div className="d-flex align-items-center gap-2">
              <Avatar
                username={
                  friends?.find((f) => Number(f.friendId) === Number(activeId))
                    ?.username
                }
                size={32}
              />
              <span className="fw-bold">
                {friends?.find((f) => Number(f.friendId) === Number(activeId))
                  ?.username || "User"}
              </span>
            </div>
          </div>
        )}

        {/* Messages list */}
        <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column">
          {!activeId && (
            <div className="text-center text-muted mt-5">
              <i className="bi bi-chat-dots" style={{ fontSize: "3rem" }}></i>
              <p className="mt-3">Select a conversation to start messaging.</p>
            </div>
          )}
          {loadingThread && activeId && <Loader size="sm" />}
          {messages?.length === 0 && activeId && (
            <div className="text-center text-muted mt-5">
              <i className="bi bi-chat" style={{ fontSize: "2rem" }}></i>
              <p className="mt-2">No messages yet. Say hello!</p>
            </div>
          )}
          {messages?.map((m) => (
            <MessageBubble
              key={m.messageID}
              message={m}
              isOwn={Number(m.senderID) === Number(userId)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        {activeId && (
          <div className="p-3 border-top bg-light rounded-bottom-3">
            <div className="d-flex gap-2">
              <input
                className="form-control rounded-pill border-0 shadow-sm"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                disabled={sending}
              />
              <button
                className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-1"
                onClick={handleSend}
                disabled={sending || !text.trim()}
              >
                {sending ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  <>
                    <i className="bi bi-send-fill"></i>
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
