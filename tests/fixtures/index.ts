import { mergeTests } from '@playwright/test'
import { test as appStateTest } from './app-state.fixture.js'
import { test as pagesTest }    from './pages.fixture.js'
import { test as a11yTest }     from './a11y.fixture.js'

/**
 * The single `test` every spec imports:
 *
 *   import { test, expect } from '../../fixtures/index.js'
 *
 *   test('…', async ({ dashboardPage, a11y }) => { … })
 */
export const test = mergeTests(appStateTest, pagesTest, a11yTest)

export { expect } from '@playwright/test'
