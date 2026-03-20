// App.jsx
import { lazy, Suspense } from 'react'
import Loader from './components/Loader'

const Scene = lazy(() => import('./three/Scene'))

export default function App() {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Scene />
      </Suspense>
      {/* All sections below */}
    </>
  )
}