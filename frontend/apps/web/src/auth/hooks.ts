import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, type SignupInput } from './authApi'
import { clearSession, loadSession, saveSession, type Session } from './session'

const KEY = ['session']

/** The current session, or null when signed out. It is read from storage, so there is no network call. */
export const useSession = () =>
  useQuery<Session | null>({ queryKey: KEY, queryFn: loadSession, initialData: loadSession, staleTime: Infinity })

/** The signed-in user's avatar URL, or null. Keyed by username, so a new sign-in refetches it. */
export function useAvatar(): string | null {
  const session = useSession().data
  const query = useQuery({ queryKey: ['avatar', session?.username], queryFn: () => authApi.avatar(session as Session), enabled: !!session, staleTime: 5 * 60_000 })
  return session ? (query.data ?? null) : null
}

export const useConfirmEmail = () => useMutation({ mutationFn: (code: string) => authApi.confirmEmail(code) })

/** The signed-in user's email and whether it is confirmed (null while loading or when unknown). */
export function useEmailStatus() {
  const session = useSession().data
  return useQuery({ queryKey: ['email-status', session?.username], queryFn: () => authApi.emailStatus(session as Session), enabled: !!session, staleTime: 60_000 })
}

export function useResendConfirmation() {
  const session = useSession().data
  return useMutation({ mutationFn: () => authApi.resendConfirmation(session as Session) })
}

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

export const useSsoProviders = () => useQuery({ queryKey: ['sso-providers'], queryFn: authApi.ssoProviders, staleTime: 5 * 60_000 })

export const useCompleteSso = () => useStoringSession(({ token, username }: { token: string; username: string }) => authApi.completeSso(token, username))

export const useSignUp = () => useStoringSession((input: SignupInput) => authApi.signup(input))

export function useSignOut() {
  const client = useQueryClient()
  return () => {
    clearSession()
    client.setQueryData(KEY, null)
  }
}
