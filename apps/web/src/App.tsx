import { greet } from '@jiggy/shared'

function App() {
  const { message } = greet('web')

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900">
      <h1 className="text-4xl font-bold text-white">{message}</h1>
    </main>
  )
}

export default App
