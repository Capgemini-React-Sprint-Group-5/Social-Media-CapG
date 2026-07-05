import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GroupCard from '../GroupCard'

describe('GroupCard', () => {
  const mockGroup = {
    groupID: '123',
    groupName: 'Test Group',
    adminID: '1',
    members: ['1', '2', '3'],
  }

  const mockOnJoin = vi.fn()
  const mockOnLeave = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnNavigateToChat = vi.fn()

  const defaultProps = {
    group: mockGroup,
    currentUserId: '1',
    activeTab: 'my-groups',
    onJoin: mockOnJoin,
    onLeave: mockOnLeave,
    onDelete: mockOnDelete,
    onNavigateToChat: mockOnNavigateToChat,
    isJoining: false,
    isLeaving: false,
    isDeleting: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders group name and member count', () => {
    render(<GroupCard {...defaultProps} />)
    expect(screen.getByText('Test Group')).toBeInTheDocument()
    expect(screen.getByText('3 members')).toBeInTheDocument()
  })

  it('shows admin badge when current user is the owner', () => {
    render(<GroupCard {...defaultProps} currentUserId="1" />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('does not show admin badge when current user is not the owner', () => {
    render(<GroupCard {...defaultProps} currentUserId="2" />)
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('shows Chat and Leave buttons in my-groups tab for non-owner', () => {
    render(<GroupCard {...defaultProps} currentUserId="2" />)
    expect(screen.getByRole('button', { name: /Chat/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Leave Group/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Delete Group/i })).not.toBeInTheDocument()
  })

  it('shows Chat and Delete buttons in my-groups tab for owner', () => {
    render(<GroupCard {...defaultProps} currentUserId="1" />)
    expect(screen.getByRole('button', { name: /Chat/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Delete Group/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Leave Group/i })).not.toBeInTheDocument()
  })

  it('shows Join button in discover tab', () => {
    render(<GroupCard {...defaultProps} activeTab="discover" />)
    expect(screen.getByRole('button', { name: /Join Group/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Chat/i })).not.toBeInTheDocument()
  })

  it('calls onNavigateToChat when Chat button is clicked', async () => {
    render(<GroupCard {...defaultProps} currentUserId="2" />)
    const chatButton = screen.getByRole('button', { name: /Chat/i })
    fireEvent.click(chatButton)
    expect(mockOnNavigateToChat).toHaveBeenCalledWith('123')
  })

  it('calls onLeave when Leave button is clicked', async () => {
    render(<GroupCard {...defaultProps} currentUserId="2" />)
    const leaveButton = screen.getByRole('button', { name: /Leave Group/i })
    fireEvent.click(leaveButton)
    expect(mockOnLeave).toHaveBeenCalledWith('123')
  })
})