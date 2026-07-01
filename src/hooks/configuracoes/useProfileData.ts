import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { getCurrentProfile, updateCurrentProfile } from '@/services/profile.service'

export function useProfileData() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cargo, setCargo] = useState('')
  const [empresa, setEmpresa] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isAuthenticated) { setProfileLoading(false); return }
    setProfileLoading(true)
    let mounted = true
    getCurrentProfile().then((result) => {
      if (!mounted) return
      setProfileLoading(false)
      if (result.error || !result.data) return
      setNome(result.data.nome)
      setTelefone(result.data.telefone ?? '')
      setCargo(result.data.cargo ?? '')
      setEmpresa(result.data.empresa ?? '')
    })
    return () => { mounted = false }
  }, [isAuthenticated])

  const handleSaveProfile = async () => {
    setSaving(true)
    const result = await updateCurrentProfile({
      nome: nome.trim(),
      telefone: telefone.trim() || undefined,
      cargo: cargo.trim() || undefined,
      empresa: empresa.trim() || undefined,
    })
    setSaving(false)
    if (result.error) { toast(result.error, 'error'); return }
    toast('Perfil atualizado com sucesso', 'success')
  }

  return {
    user,
    nome, setNome,
    telefone, setTelefone,
    cargo, setCargo,
    empresa, setEmpresa,
    profileLoading,
    saving,
    handleSaveProfile,
  }
}
