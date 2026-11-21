export interface MoodEntry {
  id: string
  userId: string
  recordedDate: string
  moodScore: number
  energyScore?: number | null
  note?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface MoodEntryRequest {
  recordedDate: string
  moodScore: number
  energyScore?: number | null
  note?: string | null
}

export interface MoodCalendarDay {
  date: string
  hasEntry: boolean
  id?: string | null
  moodScore?: number | null
  energyScore?: number | null
  note?: string | null
  hasJournal: boolean
}

export interface MoodStatistics {
  from: string
  to: string
  totalRecordedDays: number
  averageMood?: number | null
  averageEnergy?: number | null
  moodDistribution: Record<number, number>
  energyDistribution: Record<number, number>
  predominantMood: string
}

export const MOOD_CONFIG: Record<number, { label: string; emoji: string; color: string; desc: string }> = {
  1: { label: 'Rất tệ', emoji: '😭', color: '#ef4444', desc: 'Căng thẳng, kiệt sức, buồn bã' },
  2: { label: 'Không tốt', emoji: '🙁', color: '#f97316', desc: 'Có chút chán nản, uể oải' },
  3: { label: 'Bình thường', emoji: '😐', color: '#eab308', desc: 'Ổn định, bình yên trôi qua' },
  4: { label: 'Tốt', emoji: '🙂', color: '#10b981', desc: 'Tích cực, vui vẻ, hoàn thành tốt' },
  5: { label: 'Rất tốt', emoji: '😄', color: '#06b6d4', desc: 'Tràn đầy năng lượng, phấn khởi' }
}

export const ENERGY_CONFIG: Record<number, { label: string; icon: string; desc: string }> = {
  1: { label: 'Rất ít', icon: '🔋', desc: 'Cần nghỉ ngơi' },
  2: { label: 'Thấp', icon: '🪫', desc: 'Mệt mỏi nhẹ' },
  3: { label: 'Bình thường', icon: '⚡', desc: 'Vừa đủ làm việc' },
  4: { label: 'Nhiều', icon: '⚡⚡', desc: 'Hăng hái' },
  5: { label: 'Rất nhiều', icon: '🔥', desc: 'Bùng nổ năng suất' }
}
