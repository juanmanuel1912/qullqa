/**
 * Pantalla de Inicio
 * - Foto APOD del día
 * - Bienvenida motivadora
 * - Botón para comenzar
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQullqa } from '@/context/QullqaContext'
import { Button, Card, Loading, Attribution } from '@/components/common'

export function HomeScreen() {
  const navigate = useNavigate()
  const { apod, loading } = useQullqa()

  // Auto-scroll a top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="space-y-6 pb-8 max-w-2xl mx-auto px-4">
      {/* Hero Image */}
      {apod && (
        <Card variant="elevated" className="overflow-hidden">
          <div className="relative aspect-video bg-noche overflow-hidden">
            <img
              src={apod.imageUrl}
              alt={apod.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/apod-fallback.jpg'
              }}
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="p-5 space-y-3">
            <h2 className="text-xl font-bold text-noche">{apod.title}</h2>
            <p className="text-sm text-tierra-700 line-clamp-3">{apod.explanation}</p>
            {apod.copyright && (
              <p className="text-xs text-tierra-600">© {apod.copyright}</p>
            )}
          </div>
        </Card>
      )}

      {loading && !apod && <Loading message="Cargando..." />}

      {/* Bienvenida */}
      <Card variant="default" className="space-y-4">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-tierra">
            Qullqa
          </h1>
          <p className="text-lg text-tierra-700 font-medium">
            Andean AgroSpace Intelligence
          </p>
        </div>

        <p className="text-base text-tierra-700 leading-relaxed">
          <span className="text-inti font-semibold">¿Cuándo sembrar papa?</span>
        </p>

        <p className="text-sm text-tierra-600 leading-relaxed">
          Los incas miraban las Pléyades (Qullqa, "el depósito") al amanecer de junio. 
          Si brillaban claras, sabían que vendría buenas lluvias. 
          Hoy, los satélites de la NASA nos leen el cielo, el suelo y el agua.
        </p>

        <p className="text-sm text-tierra-600 leading-relaxed">
          Con tu ubicación y la variedad de papa que siembras, 
          te mostraremos el mejor mes para sembrar, 
          cuándo llegará la cosecha, y cómo va creciendo tu cultivo 
          usando datos reales de NASA.
        </p>
      </Card>

      {/* Qullqa en Marte teaser */}
      <Card 
        variant="outlined" 
        className="bg-gradient-to-br from-noche/5 to-inti/5 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate('/mars')}
      >
        <h3 className="text-lg font-semibold text-noche flex items-center gap-2">
          🔴 Qullqa en Marte
        </h3>
        <p className="text-sm text-tierra-700">
          ¿Qué pasaría si sembráramos papa en Marte? 
          Ajusta la temperatura, la luz y el agua para descubrirlo.
        </p>
        <div className="text-xs text-tierra-600">
          → Toca para explorar
        </div>
      </Card>

      {/* CTA Principal */}
      <Button
        onClick={() => navigate('/my-farm')}
        variant="primary"
        size="lg"
        className="w-full"
      >
        ¡Comenzar! 🌾
      </Button>

      {/* Sabiduría ancestral */}
      <Card variant="outlined" className="bg-inti-50 border-inti-200 space-y-3">
        <h4 className="text-sm font-semibold text-inti-700">Sabiduría ancestral</h4>
        <p className="text-xs text-tierra-700 italic">
          "Pachasami" — el clima. Los inkas no tenían instrumentos, 
          pero observaban el cielo, las plantas, los animales. 
          Hoy hacemos lo mismo: leemos los datos que NASA envía desde sus satélites.
        </p>
      </Card>

      <Attribution />
    </div>
  )
}
