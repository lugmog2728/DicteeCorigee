import '@testing-library/jest-dom/vitest'

// Tell React 19 that we are in a test environment that supports act()
// This suppresses the "not configured to support act(...)" warning.
// @ts-expect-error — global IS_REACT_ACT_ENVIRONMENT is not typed
globalThis.IS_REACT_ACT_ENVIRONMENT = true
