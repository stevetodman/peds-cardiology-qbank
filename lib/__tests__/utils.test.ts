import { cn } from '../utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500')
    expect(result).toContain('text-red-500')
    expect(result).toContain('bg-blue-500')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('base-class')
    expect(result).toContain('active-class')
  })

  it('should handle false conditions', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('base-class')
    expect(result).not.toContain('active-class')
  })

  it('should merge conflicting Tailwind classes correctly', () => {
    // twMerge should keep the last conflicting class
    const result = cn('p-4', 'p-6')
    expect(result).toBe('p-6')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['text-red-500', 'bg-blue-500'])
    expect(result).toContain('text-red-500')
    expect(result).toContain('bg-blue-500')
  })
})
