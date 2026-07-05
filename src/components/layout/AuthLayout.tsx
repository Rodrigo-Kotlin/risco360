import { Outlet } from 'react-router-dom'
import { APP_NAME } from '@/constants/app'
import { Shield } from 'lucide-react'

export function AuthLayout() {
  return (
    <main className="flex min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md animate-slide-up">
          <Outlet />
        </div>
        <p className="mt-8 text-label-medium text-text-muted text-center">
          &copy; {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
        </p>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-8">
        <div className="max-w-md text-white space-y-5">
          <Shield size={48} className="opacity-80" aria-hidden="true" />
          <h2 className="text-headline-small font-bold">Gestão de Riscos Ocupacionais</h2>
          <p className="text-primary-100 leading-relaxed">
            LPR + AEP e muito mais. Tudo em um só lugar para sua empresa gerenciar
            a segurança e saúde ocupacional com eficiência e conformidade.
          </p>
          <div className="pt-2 flex items-center gap-2 text-primary-100 text-body-medium">
            <div className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
            Sistema pronto para PWA e offline
          </div>
        </div>
      </div>
    </main>
  )
}
