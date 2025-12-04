# Antariksa Accounting - Testing Guide

## Overview

This project uses **Vitest** and **React Testing Library** for testing, following industry best practices:
- **Unit Tests**: Test individual components and utilities in isolation
- **Integration Tests**: Test component interactions and API integration
- **E2E Tests**: Test complete user workflows (to be added in Phase 10)

## Testing Framework

- **Vitest**: Fast unit test runner (Vite-native)
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM
- **@testing-library/user-event**: User interaction simulation

## Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once
npm test -- --run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Testing Strategy

### Between Phases Testing

We test **after each phase completion** to ensure quality:

1. **After Phase 9.1** (Frontend Foundation)
   - ✅ Theme system works correctly
   - ✅ Logo renders properly
   - ✅ Responsive breakpoints function
   - ✅ Core components render without errors

2. **After Phase 9.2** (Navigation & Auth)
   - Test navigation routing
   - Test authentication guards
   - Test protected routes
   - Test logout functionality

3. **After Phase 9.3** (Core Pages)
   - Test each page component
   - Test form validation
   - Test API integration
   - Test data display

4. **After Phase 9.4** (Mobile Optimization)
   - Test responsive layouts
   - Test mobile navigation
   - Test touch interactions
   - Test mobile forms

5. **After Phase 9.5** (Polish)
   - Test error boundaries
   - Test loading states
   - Test accessibility features
   - Test performance

## Writing Tests

### Component Tests

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    await user.click(button)
    
    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

### API Integration Tests

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import MyComponent from './MyComponent'

// Mock API
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('MyComponent API Integration', () => {
  it('fetches and displays data', async () => {
    const mockData = { id: 1, name: 'Test' }
    api.get.mockResolvedValue({ data: mockData })

    render(<MyComponent />)

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })
})
```

### Form Tests

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import LoginForm from './LoginForm'

describe('LoginForm', () => {
  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    await user.click(submitButton)

    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    
    render(<LoginForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })
})
```

## Test Coverage Goals

- **Minimum Coverage**: 70% for critical paths
- **Target Coverage**: 80% overall
- **Critical Components**: 90%+ (auth, forms, API clients)

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users see and do
   - Avoid testing internal state/details

2. **Use Accessible Queries**
   - Prefer `getByRole`, `getByLabelText`
   - Avoid `getByTestId` unless necessary

3. **Keep Tests Simple**
   - One assertion per test when possible
   - Clear test descriptions

4. **Mock External Dependencies**
   - Mock API calls
   - Mock browser APIs (localStorage, etc.)

5. **Test Error Cases**
   - Test validation errors
   - Test API error handling
   - Test edge cases

## Continuous Integration

Tests should run automatically:
- On every commit (pre-commit hook)
- On every pull request
- Before deployment

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

