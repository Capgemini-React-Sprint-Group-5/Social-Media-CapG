import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { selectCurrentUser } from '../store/index.js'
import { useAllGroups, useJoinGroup, useLeaveGroup, useCreateGroup } from '../hooks/useGroups.js'
import Loader from '../components/common/Loader.jsx'
import Modal from '../components/common/Modal.jsx'

/**
 * GroupsPage
 * Renders a list of groups split into "My Groups" and "Discover Groups" tabs.
 * Includes a creation modal validated with Formik and Yup.
 */
export default function GroupsPage() {
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const userId = currentUser?.userId

  const [activeTab, setActiveTab] = useState('my-groups') // 'my-groups' | 'discover'
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: groups, isLoading } = useAllGroups()
  const { mutate: join, isPending: joining } = useJoinGroup()
  const { mutate: leave, isPending: leaving } = useLeaveGroup()
  const { mutate: create, isPending: creating } = useCreateGroup()

  // Setup Formik for creating a group
  const formik = useFormik({
    initialValues: {
      groupName: '',
    },
    validationSchema: Yup.object({
      groupName: Yup.string()
        .trim()
        .min(3, 'Group name must be at least 3 characters')
        .max(30, 'Group name cannot exceed 30 characters')
        .required('Group name is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      create(
        {
          groupName: values.groupName.trim(),
          adminID: Number(userId),
        },
        {
          onSuccess: (newGroup) => {
            setIsModalOpen(false)
            resetForm()
            // Navigate directly to the new group chat room
            const targetId = newGroup.id || newGroup.groupID
            if (targetId) {
              navigate(`/groups/${targetId}/chat`)
            }
          },
        }
      )
    },
  })

  if (isLoading) return <Loader />

  // Filter groups into joined and not joined categories
  const currentUserIdNum = Number(userId)
  const myGroups = []
  const discoverGroups = []

  if (Array.isArray(groups)) {
    groups.forEach((g) => {
      const members = g.members || [Number(g.adminID)]
      const isMember = members.includes(currentUserIdNum)
      if (isMember) {
        myGroups.push(g)
      } else {
        discoverGroups.push(g)
      }
    })
  }

  const shownGroups = activeTab === 'my-groups' ? myGroups : discoverGroups

  return (
    <div className="container-fluid page-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <i className="bi bi-people-fill me-2 text-primary"></i>Communities
          </h4>
          <p className="text-muted small mb-0">Join groups, chat with peers, and share your interests.</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-1 shadow-sm px-3"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Create Group</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav custom-nav-tabs mb-4 border-bottom">
        <li className="nav-item">
          <button
            className={`nav-link border-0 bg-transparent ${activeTab === 'my-groups' ? 'active fw-bold' : ''}`}
            onClick={() => setActiveTab('my-groups')}
          >
            My Groups
            {myGroups.length > 0 && (
              <span className="badge bg-primary ms-2 rounded-pill font-monospace">{myGroups.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link border-0 bg-transparent ${activeTab === 'discover' ? 'active fw-bold' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            Discover Groups
            {discoverGroups.length > 0 && (
              <span className="badge bg-secondary ms-2 rounded-pill font-monospace">{discoverGroups.length}</span>
            )}
          </button>
        </li>
      </ul>

      {/* Groups List */}
      <div className="row g-3">
        {shownGroups.length === 0 ? (
          <div className="col-12 py-5 text-center bg-white rounded shadow-sm border">
            <i className="bi bi-collection text-muted fs-1 mb-2 d-block"></i>
            <h6 className="text-secondary fw-semibold">No Groups Found</h6>
            <p className="text-muted small mb-0">
              {activeTab === 'my-groups'
                ? "You haven't joined any groups yet. Browse the Discover tab!"
                : 'All available groups have been joined! Create a new one.'}
            </p>
          </div>
        ) : (
          shownGroups.map((g) => {
            const membersList = g.members || [Number(g.adminID)]
            const memberCount = membersList.length
            const isOwner = Number(g.adminID) === currentUserIdNum

            return (
              <div key={g.id || g.groupID} className="col-md-6 col-lg-4">
                <div className="card glass-card h-100 border-0 shadow-sm">
                  <div className="card-body d-flex flex-column p-4">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '48px', height: '48px', minWidth: '48px' }}
                        >
                          <i className="bi bi-chat-left-text-fill fs-4"></i>
                        </div>
                        <div>
                          <h6
                            className="card-title fw-bold text-dark mb-1 text-truncate"
                            style={{ maxWidth: '180px', cursor: 'pointer' }}
                            onClick={() => navigate(`/groups/${g.id || g.groupID}/chat`)}
                            title={g.groupName}
                          >
                            {g.groupName}
                          </h6>
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small font-monospace">
                              <i className="bi bi-people me-1"></i>
                              {memberCount} {memberCount === 1 ? 'member' : 'members'}
                            </span>
                            {isOwner && <span className="admin-badge">Admin</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto d-flex gap-2 pt-2 border-top">
                      {activeTab === 'my-groups' ? (
                        <>
                          <button
                            className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                            onClick={() => navigate(`/groups/${g.id || g.groupID}/chat`)}
                          >
                            <i className="bi bi-chat-dots-fill"></i>
                            <span>Chat</span>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm px-3"
                            disabled={leaving}
                            onClick={() => leave({ groupId: g.id || g.groupID, userId })}
                            title="Leave Group"
                          >
                            <i className="bi bi-box-arrow-right"></i>
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                          disabled={joining}
                          onClick={() => join({ groupId: g.id || g.groupID, userId })}
                        >
                          <i className="bi bi-person-plus-fill"></i>
                          <span>Join Group</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create Group Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Community">
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="groupName" className="form-label fw-semibold text-secondary">
              Group Name
            </label>
            <input
              id="groupName"
              name="groupName"
              type="text"
              className={`form-control ${formik.touched.groupName && formik.errors.groupName ? 'is-invalid' : ''}`}
              placeholder="e.g. Hiking Lovers, React Developers"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.groupName}
            />
            {formik.touched.groupName && formik.errors.groupName ? (
              <div className="invalid-feedback">{formik.errors.groupName}</div>
            ) : (
              <div className="form-text text-muted small">Choose an inviting name for your community.</div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={creating}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm px-4" disabled={creating}>
              {creating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
