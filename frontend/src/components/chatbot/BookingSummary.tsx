import React from 'react'
import {
  CheckCircle,
  Bus,
  Clock,
  MapPin,
  Armchair,
  Users,
  DollarSign,
} from 'lucide-react'

interface BookingSummaryData {
  trip: {
    route: string
    departure_time: string
    arrival_time: string
    operator: string
  }
  seats: string
  pickup_point: string
  dropoff_point: string
  passengers: Array<{
    name: string
    seat: string
    phone: string
    email: string
    id_number: string
  }>
  pricing: {
    base_fare: number
    quantity: number
    total: number
    currency: string
  }
}

export type { BookingSummaryData }

interface BookingSummaryProps {
  data: BookingSummaryData
  lang?: string
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  data,
  lang = 'vi',
}) => {
  const translations = {
    vi: {
      title: 'Tóm tắt đặt vé',
      route: 'Tuyến',
      departure: 'Khởi hành',
      pickup: 'Điểm đón',
      dropoff: 'Điểm trả',
      seats: 'Ghế',
      passengers: 'Hành khách',
      total: 'Tổng tiền',
    },
    en: {
      title: 'Booking Summary',
      route: 'Route',
      departure: 'Departure',
      pickup: 'Pickup',
      dropoff: 'Drop-off',
      seats: 'Seats',
      passengers: 'Passengers',
      total: 'Total',
    },
  }

  const t = translations[lang as 'vi' | 'en']

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4 max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {t.title}
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Bus className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {t.route}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {data.trip.route}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {t.departure}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {new Date(data.trip.departure_time).toLocaleString(
                lang === 'vi' ? 'vi-VN' : 'en-US'
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {t.pickup}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {data.pickup_point}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {t.dropoff}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {data.dropoff_point}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Armchair className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {t.seats}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {data.seats}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {t.passengers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {data.passengers.length}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DollarSign className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {t.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {data.pricing.total.toLocaleString(
                lang === 'vi' ? 'vi-VN' : 'en-US'
              )}{' '}
              {data.pricing.currency}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { BookingSummary }
