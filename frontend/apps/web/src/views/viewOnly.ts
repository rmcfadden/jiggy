import { createContext, useContext } from 'react'

/** True while a signed-out visitor is looking at a puzzle: zoom and preview work, moves are ignored. */
export const ViewOnlyContext = createContext(false)
export const useViewOnly = () => useContext(ViewOnlyContext)
