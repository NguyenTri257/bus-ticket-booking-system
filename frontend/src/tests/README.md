# Frontend Tests

This directory contains Vitest + React Testing Library tests for the Bus Ticket Booking System frontend.

## Test Files

### Login.test.jsx
Comprehensive tests for the Login component including:
- UI rendering (inputs, buttons, Google login)
- Form validation (empty fields)
- Successful login flow with API mocking
- Error handling for failed login attempts
- Google Sign-In integration with credential callback verification
- Navigation behavior

### Register.test.jsx
Comprehensive tests for the Register component including:
- UI rendering (all form inputs, buttons)
- Form validation (empty fields, invalid email, password mismatch, password length)
- Successful registration flow with API mocking
- Error handling for failed registration attempts
- Google Sign-In integration with credential callback verification
- Navigation behavior

## Setup

### Install Dependencies
```bash
npm install
```

The following packages are required:
- `vitest` - Test framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom jest matchers
- `jsdom` - DOM implementation for Node.js

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests with UI
```bash
npm run test:ui
```

## Test Structure

Each test file follows this structure:

1. **Rendering Tests**: Verify all UI elements are rendered correctly
2. **Validation Tests**: Test form validation for various error cases
3. **Success Flow Tests**: Test successful form submission with API mocking
4. **Error Flow Tests**: Test error handling when API calls fail
5. **Google Sign-In Tests**: Test Google OAuth integration
6. **Navigation Tests**: Verify routing behavior

## Mocking Strategy

### API Layer (`auth.js`)
All API functions are mocked to prevent real network requests:
- `login()` - Login with email/password
- `registerAccount()` - Create new account
- `loginWithGoogle()` - OAuth with Google
- `storeTokens()` - Store authentication tokens

### Google Library (`google.ts`)
The `startGoogleSignIn()` function is mocked to simulate the Google OAuth flow without requiring the actual Google SDK.

### React Router
`useNavigate` is mocked to verify navigation behavior without actual route changes.

## Key Features

✅ **No Backend Dependency**: All API calls are mocked  
✅ **No Google SDK Dependency**: Google OAuth flow is fully mocked  
✅ **Isolated Tests**: Each test runs independently with clean mocks  
✅ **Async Testing**: Proper handling of async operations with `waitFor`  
✅ **User Event Simulation**: Tests simulate real user interactions  
✅ **Coverage**: Comprehensive coverage of happy paths and error cases  

## Example Test Pattern

```javascript
it('should call login API and navigate on success', async () => {
  // Setup mock
  vi.mocked(authApi.login).mockResolvedValue({
    accessToken: 'token',
    refreshToken: 'refresh'
  })

  // Render component
  renderLogin()

  // Simulate user interaction
  fireEvent.change(screen.getByLabelText(/email/i), { 
    target: { value: 'test@example.com' } 
  })
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

  // Assert API was called
  await waitFor(() => {
    expect(authApi.login).toHaveBeenCalledWith({
      identifier: 'test@example.com',
      password: 'password123'
    })
  })

  // Assert navigation occurred
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
})
```

## Troubleshooting

### Tests not finding elements
- Use `screen.debug()` to see the rendered output
- Check if the element is rendered asynchronously (use `waitFor`)
- Verify the query matches the actual text/role in the component

### Mock not working
- Ensure `vi.clearAllMocks()` is called in `beforeEach`
- Verify the mock path matches the import path exactly
- Check if the mock is being called with expected arguments

### Async tests timing out
- Increase timeout in `waitFor` options: `{ timeout: 1000 }`
- Ensure the expected condition is actually triggered
- Check for console errors that might indicate component issues
