import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DesignerView from './Designer'

/** The designer inside the query client its parent-game list needs. */
export const Designer = () => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <DesignerView />
  </QueryClientProvider>
)
