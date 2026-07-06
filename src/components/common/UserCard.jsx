import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";

export default function UserCard({
  user,
  size = 40,
  subtitle = null,
  action = null,
  onClick = null,
  linkTo = true,
  className = "",
}) {
  const userId = user?.userID ?? user?.userId ?? user?.id;
  const username = user?.username || "Loading...";

  const content = (
    <>
      <Avatar
        src={user?.profile_picture}
        username={user?.username}
        size={size}
      />
      <div className="ms-3 flex-grow-1 min-w-0">
        <div
          className="fw-bold text-dark text-truncate"
          style={{ lineHeight: 1.2 }}
        >
          {username}
        </div>
        {subtitle && (
          <div className="text-muted small" style={{ fontSize: "0.75rem" }}>
            {subtitle}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div
      className={`d-flex align-items-center bg-white p-3 shadow-sm hover-scale ${className}`}
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        transition: "box-shadow .2s ease, border-color .2s ease",
      }}
    >
      {linkTo ? (
        <Link
          to={`/profile/${userId}`}
          onClick={onClick}
          className="d-flex align-items-center flex-grow-1 text-decoration-none min-w-0"
        >
          {content}
        </Link>
      ) : (
        <div className="d-flex align-items-center flex-grow-1 min-w-0">
          {content}
        </div>
      )}
      {action && <div className="ms-2 flex-shrink-0">{action}</div>}
    </div>
  );
}
