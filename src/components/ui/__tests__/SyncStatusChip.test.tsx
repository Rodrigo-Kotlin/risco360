import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SyncStatusChip } from '../SyncStatusChip'

describe('SyncStatusChip', () => {
  it('renderiza nada quando sync_status é undefined', () => {
    const { container } = render(<SyncStatusChip />)
    expect(container.innerHTML).toBe('')
  })

  it('renderiza nada quando sync_status é null', () => {
    const { container } = render(<SyncStatusChip sync_status={null} />)
    expect(container.innerHTML).toBe('')
  })

  it('renderiza "Sincronizado" para synced', () => {
    render(<SyncStatusChip sync_status="synced" />)
    expect(screen.getByText('Sincronizado')).toBeTruthy()
  })

  it('renderiza "Pendente" para pending', () => {
    render(<SyncStatusChip sync_status="pending" />)
    expect(screen.getByText('Pendente')).toBeTruthy()
  })

  it('renderiza "Sincronizando…" para syncing', () => {
    render(<SyncStatusChip sync_status="syncing" />)
    expect(screen.getByText('Sincronizando…')).toBeTruthy()
  })

  it('renderiza "Erro" para error', () => {
    render(<SyncStatusChip sync_status="error" />)
    expect(screen.getByText('Erro')).toBeTruthy()
  })
})
