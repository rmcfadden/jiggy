import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import Designer from './designer/Designer'
import Account from './views/Account'
import Explorer from './views/Explorer'
import Player from './views/Player'
import SignIn from './views/SignIn'
import SignUp from './views/SignUp'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/puzzles" replace />} />
        <Route path="puzzles" element={<Explorer />} />
        <Route path="puzzle" element={<Player />} />
        <Route path="designer" element={<Designer />} />
        <Route path="account" element={<Account />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
      </Route>
    </Routes>
  )
}
