// Seeded random number generator using a simple LCG algorithm
// This ensures deterministic results for the same seed

class SeededRNG {
  private seed: number
  private current: number

  constructor(seed: string | number) {
    this.seed = this.hashSeed(seed)
    this.current = this.seed
  }

  private hashSeed(seed: string | number): number {
    if (typeof seed === 'number') {
      return Math.abs(seed) % 2147483647
    }
    
    // Simple hash function for strings
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash) % 2147483647
  }

  // Linear Congruential Generator
  next(): number {
    this.current = (this.current * 1664525 + 1013904223) % 2147483647
    return this.current / 2147483647
  }

  // Get a random number between min and max
  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  // Get a random integer between min and max (inclusive)
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1))
  }

  // Get a random boolean
  boolean(): boolean {
    return this.next() < 0.5
  }

  // Get a random element from an array
  choice<T>(array: T[]): T {
    return array[this.int(0, array.length - 1)]
  }

  // Reset to original seed
  reset(): void {
    this.current = this.seed
  }

  // Get current seed
  getSeed(): number {
    return this.seed
  }
}

// Global RNG instance
let globalRNG: SeededRNG | null = null

export const createRNG = (seed: string | number): SeededRNG => {
  return new SeededRNG(seed)
}

export const setGlobalSeed = (seed: string | number): void => {
  globalRNG = new SeededRNG(seed)
}

export const getGlobalRNG = (): SeededRNG => {
  if (!globalRNG) {
    globalRNG = new SeededRNG(Date.now())
  }
  return globalRNG
}

export const generateRandomSeed = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export { SeededRNG }

