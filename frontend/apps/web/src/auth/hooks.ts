import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, type SignupInput } from './authApi'
import { clearSession, loadSession, saveSession, type Session } from './session'

const KEY = ['session']

/** The current session, or null when signed out. It is read from storage, so there is no network call. */
export const useSession = () =>
  useQuery<Session | null>({ queryKey: KEY, queryFn: loadSession, initialData: loadSession, staleTime: Infinity })

function useStoringSession<V>(fn: (v: V) => Promise<Session>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (session) => {
      saveSession(session)
      client.setQueryData(KEY, session)
    },
  })
}

export const useSignIn = () => useStoringSession(({ username, password }: { username: string; password: string }) => authApi.signin(username, password))

export const useSignUp = () => useStoringSession((input: SignupInput) => authApi.signup(input))

export function useSignOut() {
  const client = useQueryClient()
  return () => {
    clearSession()
    client.setQueryData(KEY, null)
  }
}
