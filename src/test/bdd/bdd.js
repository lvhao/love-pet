import { describe, it } from 'vitest'

class StepRegistry {
  constructor() {
    this.givens = new Map()
    this.whens = new Map()
    this.thens = new Map()
  }

  _match(registry, text) {
    for (const [pattern, fn] of registry) {
      if (typeof pattern === 'string' && pattern === text) return { fn, args: [] }
      if (pattern instanceof RegExp) {
        const match = text.match(pattern)
        if (match) return { fn, args: match.slice(1) }
      }
    }
    return null
  }

  given(text, fn) { this.givens.set(text, fn) }
  when(text, fn) { this.whens.set(text, fn) }
  then(text, fn) { this.thens.set(text, fn) }

  runGiven(text) {
    const step = this._match(this.givens, text)
    if (!step) throw new Error(`No Given step matching: "${text}"`)
    return step.fn(...step.args)
  }

  runWhen(text) {
    const step = this._match(this.whens, text)
    if (!step) throw new Error(`No When step matching: "${text}"`)
    return step.fn(...step.args)
  }

  runThen(text) {
    const step = this._match(this.thens, text)
    if (!step) throw new Error(`No Then step matching: "${text}"`)
    return step.fn(...step.args)
  }
}

const globalRegistry = new StepRegistry()

export function given(text, fn) { globalRegistry.given(text, fn) }
export function when(text, fn) { globalRegistry.when(text, fn) }
export function bddThen(text, fn) { globalRegistry.then(text, fn) }

function normalizeStep(line, lastType) {
  if (line.startsWith('And ')) {
    return { type: lastType, text: line.slice(4) }
  }
  const type = line.startsWith('Given ') ? 'given' : line.startsWith('When ') ? 'when' : 'then'
  return { type, text: line.slice(line.indexOf(' ') + 1) }
}

export function parseFeature(featureText) {
  const lines = featureText.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  const feature = { name: '', background: [], scenarios: [] }
  let current = null
  let inBackground = false
  let lastType = 'given'

  for (const line of lines) {
    if (line.startsWith('Feature:')) {
      feature.name = line.replace('Feature:', '').trim()
    } else if (line === 'Background:') {
      inBackground = true
    } else if (line.startsWith('Scenario:')) {
      inBackground = false
      lastType = 'given'
      current = { name: line.replace('Scenario:', '').trim(), steps: [] }
      feature.scenarios.push(current)
    } else if (inBackground && (line.startsWith('Given ') || line.startsWith('When ') || line.startsWith('Then ') || line.startsWith('And '))) {
      const step = normalizeStep(line, lastType)
      lastType = step.type
      feature.background.push(step)
    } else if (current && (line.startsWith('Given ') || line.startsWith('When ') || line.startsWith('Then ') || line.startsWith('And '))) {
      const step = normalizeStep(line, lastType)
      lastType = step.type
      current.steps.push(step)
    }
  }

  return feature
}

export function runFeature(featureText) {
  const feature = parseFeature(featureText)

  describe(`Feature: ${feature.name}`, () => {
    for (const scenario of feature.scenarios) {
      it(scenario.name, async () => {
        const allSteps = [...feature.background, ...scenario.steps]
        for (const step of allSteps) {
          if (step.type === 'given') {
            await globalRegistry.runGiven(step.text)
          } else if (step.type === 'when') {
            await globalRegistry.runWhen(step.text)
          } else if (step.type === 'then') {
            await globalRegistry.runThen(step.text)
          }
        }
      })
    }
  })
}

export { StepRegistry }
