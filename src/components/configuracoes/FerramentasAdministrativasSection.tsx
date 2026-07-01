import { Card, CardTitle, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Bell, Monitor, Palette, Image } from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase'

interface ConfigCard {
  title: string
  icon: typeof Bell
  description: string
  status: string
  variant: 'muted' | 'success' | 'warning' | 'danger'
}

export function FerramentasAdministrativasSection({ offlineAvailable }: { offlineAvailable: boolean }) {
  const configCards: ConfigCard[] = [
    { title: 'Notificações', icon: Bell, description: 'Alertas e lembretes do sistema', status: 'Em breve', variant: 'muted' },
    { title: 'Aparência', icon: Palette, description: 'Tema claro e escuro', status: 'Em breve', variant: 'muted' },
    { title: 'PWA', icon: Monitor, description: 'Aplicativo instalável', status: 'Pronto', variant: 'success' },
    { title: 'Evidências', icon: Image, description: 'Captura e upload de imagens', status: offlineAvailable || isSupabaseConfigured ? 'Pronto' : 'Em breve', variant: offlineAvailable || isSupabaseConfigured ? 'success' : 'muted' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {configCards.map((section) => {
        const Icon = section.icon
        return (
          <Card key={section.title}>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-text-secondary">
                  <Icon size={20} />
                </div>
                <Badge variant={section.variant}>{section.status}</Badge>
              </div>
            </CardHeader>
            <CardTitle>{section.title}</CardTitle>
            <p className="text-body-small text-text-secondary mt-1">{section.description}</p>
          </Card>
        )
      })}
    </div>
  )
}
