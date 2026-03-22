import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GroupCard } from '@/components/groups/GroupCard'
import type { Group } from '@/types'

const mockGroup: Group = {
  id: 'group-1',
  subject: 'Test Group',
  description: 'A test group description',
  owner: '33612345678@s.whatsapp.net',
  participantCount: 5,
}

describe('GroupCard', () => {
  it('renders group subject', () => {
    render(<GroupCard group={mockGroup} />)
    expect(screen.getByTestId('group-subject')).toHaveTextContent('Test Group')
  })

  it('renders participant count', () => {
    render(<GroupCard group={mockGroup} />)
    expect(screen.getByTestId('group-participant-count')).toHaveTextContent('5')
  })

  it('renders description when provided', () => {
    render(<GroupCard group={mockGroup} />)
    expect(screen.getByText('A test group description')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<GroupCard group={mockGroup} onClick={handleClick} />)
    await user.click(screen.getByTestId('group-card'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders without onClick without crashing', () => {
    render(<GroupCard group={mockGroup} />)
    expect(screen.getByTestId('group-card')).toBeInTheDocument()
  })

  it('shows owner when provided', () => {
    render(<GroupCard group={mockGroup} />)
    expect(screen.getByText(/33612345678@s.whatsapp.net/)).toBeInTheDocument()
  })
})
