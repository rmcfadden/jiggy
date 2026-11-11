/** A single sign-on provider shown as a button on the sign-in and sign-up pages. */
export type SsoProvider = { id: string; label: string; start: () => void }

/** Empty until the backend supports single sign-on; add an entry here and the pages render its button. */
export const SSO_PROVIDERS: SsoProvider[] = []
