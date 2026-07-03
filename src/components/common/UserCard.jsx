import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";

/*
 * Props:
 *   user      — { userID | userId | id, username, profile_picture }
 *   size      — avatar size in px (default 40)
 *   subtitle  — small text under the username (e.g. a formatted timestamp)
 *   action    — right-aligned slot for buttons (Add Friend / Accept /
 *               Decline / Remove — whatever the caller needs)
 *   onClick   — optional override; defaults to navigating to /profile/:id
 *               via the wrapping Link. Pass this if you need a click
 *               side-effect (e.g. closing a modal) alongside navigation.
 *   linkTo    — set false to render a plain (non-navigating) row, e.g.
 *               inside SearchPage where the whole row is already the
 *               question of "is this me?"
 */

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
      <div className="ms-2 flex-grow-1 min-w-0">
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
    <div className={`d-flex align-items-center ${className}`}>
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
