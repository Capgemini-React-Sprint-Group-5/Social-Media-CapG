import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import ProtectedRoute from './components/routes/ProtectedRoute.jsx'
import Loader from './components/common/Loader.jsx'

import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import HomeFeedPage from './pages/HomeFeedPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CreatePostPage from './pages/CreatePostPage.jsx'
import FriendsPage from './pages/FriendsPage.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import SearchPage from './pages/SearchPage.jsx'

// Lazy load group module pages
const GroupsPage = lazy(() => import('./pages/GroupsPage.jsx'))
const GroupChatPage = lazy(() => import('./pages/GroupChatPage.jsx'))

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — all wrapped in Layout (Navbar + outlet) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/home" element={<HomeFeedPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/post/create" element={<CreatePostPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:otherUserId" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:groupId/chat" element={<GroupChatPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
