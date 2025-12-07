import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Download,
  ArrowRight,
} from 'lucide-react'
import './ETicket.styles.css'

export interface ETicketData {
  bookingReference: string
  status: 'confirmed' | 'pending' | 'cancelled'
  paymentStatus: 'paid' | 'pending' | 'failed'
  bookingDate: string
  passengers: Array<{
    name: string
    seatNumber: string
    passengerType: string
  }>
  trip: {
    route: {
      originCity: string
      destinationCity: string
      distance?: number
    }
    operator: {
      name: string
      logo?: string
    }
    schedule: {
      departureTime: string
      arrivalTime: string
      duration?: number
    }
    bus: {
      busNumber: string
      type: string
    }
  }
  pricing: {
    subtotal: number
    serviceFee: number
    total: number
  }
  contact: {
    email?: string
    phone?: string
  }
  qrCode?: string
  ticketUrl?: string
}

interface ETicketProps {
  data: ETicketData
  className?: string
  showActions?: boolean
  onDownload?: () => void
  isDownloading?: boolean
}

export const ETicket = React.forwardRef<HTMLDivElement, ETicketProps>(
  (
    {
      data,
      className = '',
      showActions = true,
      onDownload,
      isDownloading = false,
    },
    ref
  ) => {
    const formatDate = (dateString: string) => {
      return new Intl.DateTimeFormat('vi-VN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateString))
    }

    const formatTime = (dateString: string) => {
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateString))
    }

    const formatDuration = (minutes?: number) => {
      if (!minutes) return ''
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}m`
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount)
    }

    const getStatusBadge = () => {
      const statusConfig = {
        confirmed: { label: 'Đã xác nhận', variant: 'default' as const },
        pending: { label: 'Chờ xử lý', variant: 'secondary' as const },
        cancelled: { label: 'Đã hủy', variant: 'destructive' as const },
      }
      const config = statusConfig[data.status]
      return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const getPaymentBadge = () => {
      const paymentConfig = {
        paid: { label: 'Đã thanh toán', variant: 'default' as const },
        pending: { label: 'Chờ thanh toán', variant: 'secondary' as const },
        failed: {
          label: 'Thanh toán thất bại',
          variant: 'destructive' as const,
        },
      }
      const config = paymentConfig[data.paymentStatus]
      return <Badge variant={config.variant}>{config.label}</Badge>
    }

    return (
      <div ref={ref} className={`e-ticket-container ${className}`}>
        <Card className="max-w-4xl mx-auto border-2 border-black">
          {/* Header */}
          <CardHeader className="bg-black text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg border-2 border-white p-2 flex items-center justify-center">
                  {data.trip.operator.logo ? (
                    <img
                      src={data.trip.operator.logo}
                      alt={data.trip.operator.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Bus className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">VÉ XE ĐIỆN TỬ</h1>
                  <p className="text-sm font-medium mt-1">
                    {data.trip.operator.name}
                  </p>
                </div>
              </div>
              {showActions && onDownload && (
                <div className="flex gap-2 print:hidden">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading ? 'Đang tải...' : 'Tải xuống'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Booking Reference */}
            <div className="border-2 border-black p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2">
                    MÃ ĐẶT CHỖ
                  </p>
                  <p className="text-3xl font-bold tracking-wider">
                    {data.bookingReference}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  {getStatusBadge()}
                  {getPaymentBadge()}
                </div>
              </div>
            </div>

            {/* Trip Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                <MapPin className="h-5 w-5" />
                <h2 className="text-lg font-bold uppercase">
                  Thông Tin Chuyến Đi
                </h2>
              </div>

              {/* Route */}
              <div className="border-2 border-black p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase mb-2">Điểm Đi</p>
                    <p className="text-xl font-bold">
                      {data.trip.route.originCity}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowRight className="h-6 w-6" />
                    {data.trip.route.distance && (
                      <span className="text-xs font-bold">
                        {data.trip.route.distance}km
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-bold uppercase mb-2">Điểm Đến</p>
                    <p className="text-xl font-bold">
                      {data.trip.route.destinationCity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Ngày đi</span>
                  </div>
                  <p className="font-medium">
                    {formatDate(data.trip.schedule.departureTime)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Giờ khởi hành</span>
                  </div>
                  <p className="font-medium">
                    {formatTime(data.trip.schedule.departureTime)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Giờ đến dự kiến</span>
                  </div>
                  <p className="font-medium">
                    {formatTime(data.trip.schedule.arrivalTime)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bus className="h-4 w-4" />
                    <span className="text-sm">Loại xe</span>
                  </div>
                  <p className="font-medium">{data.trip.bus.type}</p>
                </div>
              </div>

              {data.trip.schedule.duration && (
                <p className="text-sm text-muted-foreground">
                  Thời gian di chuyển:{' '}
                  {formatDuration(data.trip.schedule.duration)}
                  {data.trip.route.distance &&
                    `  Khoảng cách: ${data.trip.route.distance}km`}
                </p>
              )}
            </div>

            {/* Passengers */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                <User className="h-5 w-5" />
                <h2 className="text-lg font-bold uppercase">Hành Khách</h2>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {data.passengers.map((passenger, index) => (
                  <div key={index} className="border-2 border-black p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border-2 border-black flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold">{passenger.name}</p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {passenger.passengerType}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-black">
                        Ghế {passenger.seatNumber}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            {(data.contact.email || data.contact.phone) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                  <Phone className="h-5 w-5" />
                  <h2 className="text-lg font-bold uppercase">
                    Thông Tin Liên Hệ
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {data.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{data.contact.email}</span>
                    </div>
                  )}
                  {data.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{data.contact.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-black">
                <CreditCard className="h-5 w-5" />
                <h2 className="text-lg font-bold uppercase">Chi Tiết Giá</h2>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giá vé</span>
                  <span>{formatCurrency(data.pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí dịch vụ</span>
                  <span>{formatCurrency(data.pricing.serviceFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatCurrency(data.pricing.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {data.qrCode && (
              <div className="border-2 border-dashed border-black p-6 text-center space-y-4 page-break-avoid">
                <div className="flex justify-center">
                  <img
                    src={data.qrCode}
                    alt="QR Code"
                    className="w-48 h-48 border-2 border-black"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold uppercase">Mã QR Lên Xe</p>
                  <p className="text-xs text-muted-foreground">
                    Vui lòng xuất trình mã này khi lên xe
                  </p>
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>
                Vé điện tử được phát hành vào {formatDate(data.bookingDate)}
              </p>
              <p className="mt-1">
                Vui lòng có mặt trước 15 phút so với giờ khởi hành
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
)

ETicket.displayName = 'ETicket'
