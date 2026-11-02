import { test as base, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { KnownBug } from '../utils/known-bugs.js'

const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

export interface A11yCheckOptions {
  /** CSS selector to scope the scan to, e.g. an open modal. Default: the whole page. */
  include?: string
  /**
   * Violations already reported as bugs, keyed by axe rule id. They are recorded as
   * annotations instead of failing the test, so the check still catches every *new* violation.
   */
  knownIssues?: Record<string, KnownBug>
}

export interface A11yFixtures {
  a11y: {
    /** Fails on any critical/serious WCAG 2.1 AA violation not listed in `knownIssues`. */
    expectNoViolations(options?: A11yCheckOptions): Promise<void>
  }
}

export const test = base.extend<A11yFixtures>({
  a11y: async ({ page }, use, testInfo) => {
    await use({
      async expectNoViolations({ include, knownIssues = {} } = {}) {
        const builder = new AxeBuilder({ page }).withTags(WCAG_21_AA)
        if (include) builder.include(include)
        const { violations } = await builder.analyze()

        await testInfo.attach('axe-violations.json', {
          body:        JSON.stringify(violations, null, 2),
          contentType: 'application/json',
        })

        const blocking = violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
        for (const v of blocking.filter(v => knownIssues[v.id])) {
          testInfo.annotations.push({ type: 'known a11y issue', description: `${knownIssues[v.id].id}: ${v.id} (${v.nodes.length} nodes)` })
        }

        const unexpected = blocking
          .filter(v => !knownIssues[v.id])
          .map(v => `[${v.impact}] ${v.id}: ${v.help} — ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)
        expect(unexpected, 'unexpected critical/serious accessibility violations').toEqual([])
      },
    })
  },
})
