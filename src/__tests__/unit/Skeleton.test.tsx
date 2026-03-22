import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '@/components/common/Skeleton'

describe('Skeleton', () => {
  it('renders with data-testid="skeleton"', () => {
    render(<Skeleton />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('renders single line by default', () => {
    render(<Skeleton />)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons).toHaveLength(1)
  })

  it('renders multiple lines when lines prop > 1', () => {
    render(<Skeleton lines={3} />)
    // The wrapper div has the testid and contains 3 inner divs
    const wrapper = screen.getByTestId('skeleton')
    expect(wrapper).toBeInTheDocument()
    // It should contain 3 child divs
    expect(wrapper.children).toHaveLength(3)
  })

  it('renders exactly N children when lines is provided', () => {
    render(<Skeleton lines={5} />)
    const wrapper = screen.getByTestId('skeleton')
    expect(wrapper.children).toHaveLength(5)
  })

  it('applies custom className', () => {
    render(<Skeleton className="w-32" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton.className).toContain('w-32')
  })
})
