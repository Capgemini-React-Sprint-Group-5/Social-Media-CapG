import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { selectCurrentUser } from '../store/index.js'
import { useAllGroups, useJoinGroup, useLeaveGroup, useCreateGroup, useDeleteGroup } from '../hooks/useGroups.js'
import Loader from '../components/common/Loader.jsx'
import Modal from '../components/common/Modal.jsx'
import GroupCard from '../components/common/GroupCard.jsx'

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
  const [groupToDelete, setGroupToDelete] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')

  const { data: groups, isLoading } = useAllGroups()
  const { mutate: join, isPending: joining } = useJoinGroup()
  const { mutate: leave, isPending: leaving } = useLeaveGroup()
  const { mutate: create, isPending: creating } = useCreateGroup()
  const { mutate: deleteGroup, isPending: deleting } = useDeleteGroup()

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
            const targetId = newGroup?.data?.groupID || newGroup?.data?.id || newGroup?.groupID || newGroup?.id
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
      const members = (g.members || [g.adminID]).map(Number)
      const isMember = members.includes(currentUserIdNum)
      if (isMember) {
        myGroups.push(g)
      } else {
        discoverGroups.push(g)
      }
    })
  }

  const filterBySearch = (list) => {
    return list.filter((g) => {
      return g.groupName.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }

  const filteredMyGroups = filterBySearch(myGroups)
  const filteredDiscoverGroups = filterBySearch(discoverGroups)

  const shownGroups = activeTab === 'my-groups' ? filteredMyGroups : filteredDiscoverGroups

  const recommendedGroups = discoverGroups.slice(0, 3).map((g) => {
    const name = g.groupName
    const id = g.id || g.groupID
    const membersList = g.members || [Number(g.adminID)]
    const count = membersList.length

    let iconClass = 'bi-people-fill'
    let colorClass = 'gaming'
    const lowerName = name.toLowerCase()

    if (lowerName.includes('code') || lowerName.includes('dev') || lowerName.includes('programming') || lowerName.includes('tech') || lowerName.includes('wizard')) {
      iconClass = 'bi-box-fill'
      colorClass = 'react'
    } else if (lowerName.includes('cook') || lowerName.includes('food') || lowerName.includes('dessert') || lowerName.includes('club') || lowerName.includes('eat')) {
      iconClass = 'bi-filetype-js'
      colorClass = 'js'
    } else if (lowerName.includes('gaming')) {
      iconClass = 'bi-controller'
      colorClass = 'gaming'
    } else if (lowerName.includes('fit') || lowerName.includes('well') || lowerName.includes('sport')) {
      iconClass = 'bi-heart-pulse-fill'
      colorClass = 'react'
    }

    return {
      id,
      name,
      members: count,
      colorClass,
      iconClass
    }
  })

  return (
    <div className="container-fluid page-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-people-fill text-primary" style={{ color: 'var(--primary)' }}></i>
            Communities
          </h2>
          <p className="text-muted small mb-0">Connect with people who share your interests</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4 py-2"
          onClick={() => setIsModalOpen(true)}
          style={{ borderRadius: '14px' }}
        >
          <i className="bi bi-plus-lg"></i>
          <span>Create Group</span>
        </button>
      </div>

      {/* Stats Metric Cards Row */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3 mb-4">
        {/* Card 1: Groups Joined */}
        <div className="col">
          <div className="stat-card shadow-sm">
            <div className="stat-icon-wrapper purple">
              <i className="bi bi-people-fill"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-dark">{myGroups.length}</h3>
              <span className="text-dark fw-semibold small d-block" style={{ fontSize: '0.82rem' }}>Groups Joined</span>
              <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Communities</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Today */}
        <div className="col">
          <div className="stat-card shadow-sm">
            <div className="stat-icon-wrapper green">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-dark">5</h3>
              <span className="text-dark fw-semibold small d-block" style={{ fontSize: '0.82rem' }}>Active Today</span>
              <span className="text-success small" style={{ fontSize: '0.72rem', fontWeight: 600 }}>New updates</span>
            </div>
          </div>
        </div>

        {/* Card 3: Messages */}
        <div className="col">
          <div className="stat-card shadow-sm">
            <div className="stat-icon-wrapper blue">
              <i className="bi bi-chat-text-fill"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-dark">127</h3>
              <span className="text-dark fw-semibold small d-block" style={{ fontSize: '0.82rem' }}>Messages</span>
              <span className="text-primary small" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Across groups</span>
            </div>
          </div>
        </div>

        {/* Card 4: Streak */}
        <div className="col">
          <div className="stat-card shadow-sm">
            <div className="stat-icon-wrapper orange">
              <i className="bi bi-fire"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-dark">3</h3>
              <span className="text-dark fw-semibold small d-block" style={{ fontSize: '0.82rem' }}>Streak</span>
              <span className="text-warning small" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Days active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Row */}
      <div className="search-filter-wrapper mb-4">
        <div className="search-input-container">
          <i className="bi bi-search text-muted fs-5"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search groups by name, interest, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="form-select category-select-dropdown"
          style={{ width: 'auto' }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>Tech & Coding</option>
          <option>Fitness & Health</option>
          <option>Food & Cooking</option>
          <option>Arts & Travel</option>
        </select>
        <button className="filter-btn-wrapper" title="Filters">
          <i className="bi bi-sliders2"></i>
        </button>
      </div>

      {/* Split Grid Layout */}
      <div className="row g-4">
        {/* LEFT COLUMN: MAIN GROUPS LIST */}
        <div className="col-lg-8">
          {/* Navigation Tabs */}
          <ul className="nav custom-nav-tabs mb-4 border-bottom">
            <li className="nav-item">
              <button
                className={`nav-link border-0 bg-transparent ${activeTab === 'my-groups' ? 'active fw-bold' : ''}`}
                onClick={() => setActiveTab('my-groups')}
              >
                My Groups
                {myGroups.length > 0 && (
                  <span className="badge bg-primary ms-2 rounded-pill font-monospace" style={{ backgroundColor: 'var(--primary)' }}>{myGroups.length}</span>
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

          {/* Groups Grid */}
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
              shownGroups.map((g) => (
                <div key={g.id || g.groupID} className="col-md-6">
                  <GroupCard
                    group={g}
                    currentUserId={userId}
                    activeTab={activeTab}
                    onJoin={(groupId) => join({ groupId, userId })}
                    onLeave={(groupId) => leave({ groupId, userId })}
                    onDelete={(groupId) => {
                      setGroupToDelete(groupId)
                    }}
                    onNavigateToChat={(groupId) => navigate(`/groups/${groupId}/chat`)}
                    isJoining={joining}
                    isLeaving={leaving}
                    isDeleting={deleting}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="col-lg-4">
          {/* Section 1: Recommended Groups */}
          <div className="sidebar-section shadow-sm">
            <div className="sidebar-header-row">
              <h6 className="text-dark d-flex align-items-center gap-2">
                <span>🔥</span> Recommended Groups
              </h6>
              <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); setActiveTab('discover'); }}>View all</a>
            </div>
            <div className="recommended-list">
              {recommendedGroups.length === 0 ? (
                <div className="text-muted small py-2">No recommendations available.</div>
              ) : (
                recommendedGroups.map((item) => (
                  <div key={item.id} className="recommended-group-item">
                    <div className="recommended-info-wrapper">
                      <div className={`recommended-logo-circle ${item.colorClass}`}>
                        <i className={`bi ${item.iconClass}`}></i>
                      </div>
                      <div>
                        <span className="fw-bold text-dark d-block small" style={{ fontSize: '0.85rem' }}>{item.name}</span>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>{item.members} {item.members === 1 ? 'member' : 'members'}</span>
                      </div>
                    </div>
                    <button 
                      className="btn btn-outline-primary btn-sm px-3 py-1 fw-bold"
                      style={{ borderRadius: '12px', fontSize: '0.75rem' }}
                      onClick={() => join({ groupId: item.id, userId })}
                      disabled={joining}
                    >
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Recent Activity */}
          <div className="sidebar-section shadow-sm">
            <div className="sidebar-header-row">
              <h6 className="text-dark d-flex align-items-center gap-2">
                <span>🕒</span> Recent Activity
              </h6>
              <a href="#" className="view-all-link" onClick={(e) => e.preventDefault()}>View all</a>
            </div>
            <div className="activity-list">
              {[
                { text: '<strong>user1</strong> joined React Developers', time: '2 hours ago', bg: '#10B981', textLogo: 'US' },
                { text: '<strong>user2</strong> created AI Enthusiasts', time: '5 hours ago', bg: '#8B5CF6', textLogo: 'US' },
                { text: '<strong>Group 1</strong> has 12 new messages', time: '1 day ago', bg: '#4F46E5', textLogo: '💬' },
              ].map((item, idx) => (
                <div key={idx} className="activity-item-wrapper">
                  <div 
                    className="avatar-stack-item text-white" 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      minWidth: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: item.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      marginLeft: 0
                    }}
                  >
                    {item.textLogo}
                  </div>
                  <div>
                    <span className="activity-item-text text-dark" dangerouslySetInnerHTML={{ __html: item.text }}></span>
                    <div className="activity-item-time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

      {/* Delete Group Confirmation Modal */}
      <Modal isOpen={!!groupToDelete} onClose={() => setGroupToDelete(null)} title="Delete Group">
        <div className="mb-4">
          Are you sure you want to delete the group?
        </div>
        <div className="d-flex justify-content-end gap-2 pt-2 border-top">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setGroupToDelete(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm px-4"
            disabled={deleting}
            onClick={() => {
              deleteGroup(groupToDelete, {
                onSuccess: () => {
                  setGroupToDelete(null)
                },
              })
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
