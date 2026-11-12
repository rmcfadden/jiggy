import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth'
import Layout from './Layout'
import Designer from './designer/Designer'
import ProfilePage from './views/ProfilePage'
import Explorer from './views/Explorer'
import Player from './views/Player'
import ReviewsPage from './views/ReviewsPage'
import SignIn from './views/SignIn'
import SignUp from './views/SignUp'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/puzzles" replace />} />
        <Route path="puzzles" element={<Explorer />} />
        <Route path="puzzle" element={<Player />} />
        <Route element={<RequireAuth />}>
          <Route path="designer" element={<Designer />} />
        </Route>
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
      </Route>
    </Routes>
  )
}
