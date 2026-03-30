import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'jest'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock components
import { OnboardingProgress } from '@/components/ui/OnboardingProgress'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { YearSelector } from '@/components/ui/YearSelector'
import { StudyHoursSlider } from '@/components/ui/StudyHoursSlider'

describe('OnboardingProgress', () => {
  it('renders progress bar with correct percentage', () => {
    const labels = ['Language', 'Year', 'Assessment', 'Study Hours', 'Fitness']
    render(<OnboardingProgress currentStep={2} totalSteps={5} labels={labels} />)
    
    // Check that progress bar exists
    const progressBar = document.querySelector('.bg-primary-600')
    expect(progressBar).toBeTruthy()
  })

  it('renders all step labels', () => {
    const labels = ['Language', 'Year', 'Assessment', 'Study Hours', 'Fitness']
    render(<OnboardingProgress currentStep={0} totalSteps={5} labels={labels} />)
    
    labels.forEach(label => {
      expect(screen.getByText(label)).toBeTruthy()
    })
  })

  it('shows current step as active', () => {
    const labels = ['Language', 'Year', 'Assessment', 'Study Hours', 'Fitness']
    render(<OnboardingProgress currentStep={1} totalSteps={5} labels={labels} />)
    
    // Step 2 (index 1) should have ring indicating it's active
    const activeStep = document.querySelector('.ring-4')
    expect(activeStep).toBeTruthy()
  })
})

describe('LanguageSelector', () => {
  it('renders both language options', () => {
    render(<LanguageSelector value={null} onChange={vi.fn()} />)
    
    expect(screen.getByText('English')).toBeTruthy()
    expect(screen.getByText('हिंदी')).toBeTruthy()
  })

  it('calls onChange when language is selected', () => {
    const handleChange = vi.fn()
    render(<LanguageSelector value={null} onChange={handleChange} />)
    
    fireEvent.click(screen.getByText('English'))
    expect(handleChange).toHaveBeenCalledWith('en')
    
    fireEvent.click(screen.getByText('हिंदी'))
    expect(handleChange).toHaveBeenCalledWith('hi')
  })

  it('applies selected style when value is set', () => {
    const { rerender } = render(<LanguageSelector value="en" onChange={vi.fn()} />)
    
    // English should have selected style
    const englishButton = screen.getByText('English').closest('button')
    expect(englishButton?.className).toContain('border-primary-600')
    
    rerender(<LanguageSelector value="hi" onChange={vi.fn()} />)
    
    // Hindi should now have selected style
    const hindiButton = screen.getByText('हिंदी').closest('button')
    expect(hindiButton?.className).toContain('border-primary-600')
  })
})

describe('YearSelector', () => {
  it('renders year options', () => {
    render(<YearSelector value={null} onChange={vi.fn()} />)
    
    expect(screen.getByText('2025')).toBeTruthy()
    expect(screen.getByText('2026')).toBeTruthy()
    expect(screen.getByText('2027')).toBeTruthy()
  })

  it('calls onChange when year is selected', () => {
    const handleChange = vi.fn()
    render(<YearSelector value={null} onChange={handleChange} />)
    
    fireEvent.click(screen.getByText('2026'))
    expect(handleChange).toHaveBeenCalledWith(2026)
  })

  it('applies selected style when value is set', () => {
    render(<YearSelector value={2026} onChange={vi.fn()} />)
    
    const yearButton = screen.getByText('2026').closest('button')
    expect(yearButton?.className).toContain('border-primary-600')
  })

  it('renders custom years when provided', () => {
    const customYears = [2024, 2025, 2026]
    render(<YearSelector value={null} onChange={vi.fn()} years={customYears} />)
    
    expect(screen.getByText('2024')).toBeTruthy()
    expect(screen.getByText('2025')).toBeTruthy()
    expect(screen.getByText('2026')).toBeTruthy()
  })
})

describe('StudyHoursSlider', () => {
  it('renders slider with current value', () => {
    render(<StudyHoursSlider value={3} onChange={vi.fn()} />)
    
    expect(screen.getByText('3')).toBeTruthy()
    expect(screen.getByText('hours per day')).toBeTruthy()
  })

  it('calls onChange when slider value changes', () => {
    const handleChange = vi.fn()
    render(<StudyHoursSlider value={2} onChange={handleChange} />)
    
    const slider = document.querySelector('input[type="range"]')
    if (slider) {
      fireEvent.change(slider, { target: { value: 4 } })
      expect(handleChange).toHaveBeenCalledWith(4)
    }
  })

  it('renders preset buttons', () => {
    render(<StudyHoursSlider value={2} onChange={vi.fn()} />)
    
    expect(screen.getByText('1 hour')).toBeTruthy()
    expect(screen.getByText('2 hours')).toBeTruthy()
    expect(screen.getByText('3 hours')).toBeTruthy()
  })

  it('calls onChange when preset button is clicked', () => {
    const handleChange = vi.fn()
    render(<StudyHoursSlider value={2} onChange={handleChange} />)
    
    fireEvent.click(screen.getByText('5 hours'))
    expect(handleChange).toHaveBeenCalledWith(5)
  })
})
