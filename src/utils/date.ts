import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

dayjs.locale('vi')
dayjs.extend(relativeTime)
dayjs.extend(isToday)
dayjs.extend(isYesterday)

export function formatDate(date: string | Date | null | undefined, format = 'DD/MM/YYYY'): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date | null | undefined, format = 'HH:mm DD/MM/YYYY'): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function formatTime(date: string | Date | null | undefined, format = 'HH:mm'): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = dayjs(date)
  if (d.isToday()) {
    return `Hôm nay, ${d.format('HH:mm')}`
  }
  if (d.isYesterday()) {
    return `Hôm qua, ${d.format('HH:mm')}`
  }
  return d.fromNow()
}

export function getDateRanges() {
  const now = dayjs()
  return {
    today: [now.startOf('day').toISOString(), now.endOf('day').toISOString()],
    thisWeek: [now.startOf('week').toISOString(), now.endOf('week').toISOString()],
    thisMonth: [now.startOf('month').toISOString(), now.endOf('month').toISOString()],
    lastMonth: [
      now.subtract(1, 'month').startOf('month').toISOString(),
      now.subtract(1, 'month').endOf('month').toISOString()
    ],
    thisYear: [now.startOf('year').toISOString(), now.endOf('year').toISOString()]
  }
}

export default dayjs
