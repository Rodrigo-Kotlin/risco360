import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DropdownMenu } from '../DropdownMenu'

const items = [
  { label: 'Editar', onClick: vi.fn() },
  { label: 'Excluir', onClick: vi.fn(), variant: 'danger' as const },
  { label: 'Desabilitado', onClick: vi.fn(), disabled: true },
]

function getTrigger(): HTMLElement {
  return screen.getByRole('button', { name: 'Menu' })
}

describe('DropdownMenu keyboard navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setup() {
    const user = userEvent.setup()
    render(
      <DropdownMenu trigger={<span>Menu</span>} items={items} />
    )
    return { user }
  }

  it('opens menu on trigger click', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Editar')).toBeInTheDocument()
  })

  it('opens menu on ArrowDown when trigger is focused', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    await user.keyboard('[Escape]')
    getTrigger().focus()
    await user.keyboard('[ArrowDown]')
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('navigates down with ArrowDown', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    await user.keyboard('[ArrowDown]')
    await waitFor(() => {
      expect(screen.getByText('Excluir')).toHaveFocus()
    })
    await user.keyboard('[ArrowDown]')
    await waitFor(() => {
      expect(screen.getByText('Editar')).toHaveFocus()
    })
  })

  it('skips disabled items with ArrowDown', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[ArrowDown]')
    await waitFor(() => {
      expect(screen.getByText('Excluir')).toHaveFocus()
    })
  })

  it('navigates up with ArrowUp', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[ArrowDown]')
    await waitFor(() => {
      expect(screen.getByText('Editar')).toHaveFocus()
    })
    await user.keyboard('[ArrowUp]')
    await waitFor(() => {
      expect(screen.getByText('Excluir')).toHaveFocus()
    })
  })

  it('goes to first item with Home', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[Home]')
    await waitFor(() => {
      expect(screen.getByText('Editar')).toHaveFocus()
    })
  })

  it('goes to last enabled item with End', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    await user.keyboard('[End]')
    await waitFor(() => {
      expect(screen.getByText('Excluir')).toHaveFocus()
    })
  })

  it('activates item with Enter', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    await user.keyboard('[Enter]')
    await waitFor(() => {
      expect(items[0].onClick).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('activates item with Space', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    await user.keyboard('[Space]')
    await waitFor(() => {
      expect(items[0].onClick).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('closes menu with Escape', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await user.keyboard('[Escape]')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('sets aria-expanded and aria-haspopup', () => {
    setup()
    const trigger = getTrigger()
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders disabled items correctly', async () => {
    const { user } = setup()
    await user.click(getTrigger())
    const disabledBtn = screen.getByText('Desabilitado')
    expect(disabledBtn).toBeDisabled()
  })
})
