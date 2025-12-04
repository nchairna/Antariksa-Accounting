import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BrandLogo from '../components/BrandLogo'

describe('BrandLogo', () => {
  it('renders logo component', () => {
    render(<BrandLogo />)
    // This is a placeholder test - update when logo is added
    expect(screen.getByText('Antariksa Accounting')).toBeInTheDocument()
  })
})

