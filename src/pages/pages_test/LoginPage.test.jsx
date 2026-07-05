import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../LoginPage'
import { renderWithProviders } from '../../test/utils'
import * as useUsers from '../../hooks/useUsers'

vi.mock('../../hooks/useUsers.js', () => ({
  useLoginUser: vi.fn(),
}))

describe('LoginPage', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useUsers.useLoginUser.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
  })

  it('renders the login page with all elements', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByText('SocialSphere')).toBeInTheDocument()
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument()
  })

  it('shows validation errors when fields are empty and form is submitted', async () => {
    renderWithProviders(<LoginPage />)
    const loginButton = screen.getByRole('button', { name: /Login/i })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('submits the form with username and password when valid', async () => {
    renderWithProviders(<LoginPage />)
    const usernameInput = screen.getByPlaceholderText('Enter username')
    const passwordInput = screen.getByPlaceholderText('Enter password')
    const loginButton = screen.getByRole('button', { name: /Login/i })

    await userEvent.type(usernameInput, 'testuser')
    await userEvent.type(passwordInput, 'password123')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { username: 'testuser', password: 'password123' },
        expect.any(Object)
      )
    })
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument()
    expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
  })

  it('has a link to register page', () => {
    renderWithProviders(<LoginPage />)
    const registerLink = screen.getByRole('link', { name: /Register/i })
    expect(registerLink).toHaveAttribute('href', '/register')
  })
})