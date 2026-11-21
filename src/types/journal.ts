export interface DailyJournal {
  id: string
  userId: string
  journalDate: string
  title?: string | null
  content?: string | null
  highlight?: string | null
  gratitude?: string | null
  improvement?: string | null
  tomorrowPlan?: string | null
  createdAt?: string
  updatedAt?: string
  moodScore?: number | null
  energyScore?: number | null
  moodNote?: string | null
}

export interface DailyJournalRequest {
  journalDate: string
  title?: string | null
  content?: string | null
  highlight?: string | null
  gratitude?: string | null
  improvement?: string | null
  tomorrowPlan?: string | null
}

export interface JournalCalendarDay {
  date: string
  hasJournal: boolean
  journalId?: string | null
  title?: string | null
  hasContent: boolean
  moodScore?: number | null
  energyScore?: number | null
}
