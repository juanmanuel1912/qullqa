import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { I18nProvider, useI18n } from '@/i18n'
import { QullqaProvider } from '@/context/QullqaContext'
import { ErrorBoundary, Spinner } from '@/components/common'
import { BottomNav, Header } from '@/components/layout'
import { HomeScreen } from '@/components/screens/HomeScreen'

const MyFarmScreen = lazy(() => import('@/components/screens/MyFarmScreen'))
const CalendarScreen = lazy(() => import('@/components/screens/CalendarScreen'))
const MyCropScreen = lazy(() => import('@/components/screens/MyCropScreen'))
const PotatoScreen = lazy(() => import('@/components/screens/PotatoScreen'))
const MarsScreen = lazy(() => import('@/components/screens/MarsScreen'))
const SkyScreen = lazy(() => import('@/components/screens/SkyScreen'))
const WeatherScreen = lazy(() => import('@/components/screens/WeatherScreen'))
const LandsScreen = lazy(() => import('@/components/screens/LandsScreen'))
const ProfileScreen = lazy(() => import('@/components/screens/ProfileScreen'))
const CropsScreen = lazy(() => import('@/components/screens/CropsScreen'))
const ElNinoScreen = lazy(() => import('@/components/screens/ElNinoScreen'))

function ScrollToTop() {
  const { pathname } = useLocation()
  // Con llaves: en Chrome reciente scrollTo() devuelve una Promise, y React la tomaría como "cleanup".
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Shell() {
  const { t } = useI18n()
  return (
    // En computadora, la app se ve como un teléfono sobre el cielo nocturno (ideal para el video).
    <div className="flex min-h-screen justify-center bg-noche-900">
      <div className="relative flex min-h-screen w-full max-w-md flex-col bg-tierra-50 md:shadow-2xl md:shadow-black/50">
        <Header />
        <main className="flex-1 px-4 pb-28 pt-4">
          <Suspense fallback={<Spinner label={t('loading')} />}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/chacra" element={<MyFarmScreen />} />
              <Route path="/calendario" element={<CalendarScreen />} />
              <Route path="/cultivo" element={<MyCropScreen />} />
              <Route path="/papas" element={<PotatoScreen />} />
              <Route path="/marte" element={<MarsScreen />} />
              <Route path="/cielo" element={<SkyScreen />} />
              <Route path="/clima" element={<WeatherScreen />} />
              <Route path="/tierras" element={<LandsScreen />} />
              <Route path="/perfil" element={<ProfileScreen />} />
              <Route path="/cultivos" element={<CropsScreen />} />
              <Route path="/nino" element={<ElNinoScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <QullqaProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Shell />
          </BrowserRouter>
        </QullqaProvider>
      </ErrorBoundary>
    </I18nProvider>
  )
}
