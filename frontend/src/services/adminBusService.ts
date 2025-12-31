// services/adminBusService.ts
import { request } from '@/api/auth'

const API_BASE = '/trips'

export interface Bus {
  bus_id: string
  license_plate: string
  bus_model_name: string
  operator_name: string
  status: string
  has_seat_layout: boolean
  type: string
}

export interface SeatData {
  code: string
  floor?: number
  price?: number
}

export interface SeatLayout {
  floors: number
  rows: Array<{
    row: number
    seats: (string | null | SeatData)[]
  }>
  type?: string
}

export interface Seat {
  seat_number: string
  row: number
  col: number
  type: 'standard' | 'vip' | 'window' | 'aisle'
  price_multiplier: number
  price?: number
}

interface ValidationError {
  field: string
  message: string
}

class AdminBusService {
  // Validate seat layout to match backend schema
  private validateSeatLayout(layoutData: SeatLayout): ValidationError[] {
    const errors: ValidationError[] = []

    // Validate floors
    if (layoutData.floors === undefined || layoutData.floors === null) {
      errors.push({ field: 'floors', message: 'Floors is required' })
    } else if (
      !Number.isInteger(layoutData.floors) ||
      layoutData.floors < 1 ||
      layoutData.floors > 2
    ) {
      errors.push({
        field: 'floors',
        message: 'Floors must be an integer between 1 and 2',
      })
    }

    // Validate rows array
    if (!Array.isArray(layoutData.rows)) {
      errors.push({
        field: 'rows',
        message: 'Rows must be an array',
      })
    } else if (layoutData.rows.length === 0) {
      errors.push({
        field: 'rows',
        message: 'At least one row is required',
      })
    } else {
      layoutData.rows.forEach((rowData, index) => {
        // Validate row number
        if (!Number.isInteger(rowData.row) || rowData.row < 1) {
          errors.push({
            field: `rows[${index}].row`,
            message: 'Row must be a positive integer',
          })
        }

        // Validate seats array
        if (!Array.isArray(rowData.seats)) {
          errors.push({
            field: `rows[${index}].seats`,
            message: 'Seats must be an array',
          })
        } else {
          rowData.seats.forEach((seatData, seatIndex) => {
            // Handle both old format (string/null) and new format (object/null)
            let seatCode: string | null = null
            let floor: number | undefined = undefined

            if (seatData === null) {
              seatCode = null
            } else if (typeof seatData === 'string') {
              seatCode = seatData
            } else if (
              typeof seatData === 'object' &&
              seatData &&
              'code' in seatData
            ) {
              seatCode = seatData.code
              floor = seatData.floor // Extract floor if present
            } else {
              errors.push({
                field: `rows[${index}].seats[${seatIndex}]`,
                message:
                  'Seat data must be a string, object with code property, or null',
              })
              return
            }

            // Validate seat code format if it exists
            if (seatCode && !/^VIP\d+[A-Z]+|\d+[A-Z]+$/.test(seatCode)) {
              errors.push({
                field: `rows[${index}].seats[${seatIndex}]`,
                message:
                  'Seat code must be number(s) followed by letter(s), optionally prefixed with VIP',
              })
            }

            // Validate floor if present
            if (floor !== undefined) {
              if (!Number.isInteger(floor) || floor < 1 || floor > 2) {
                errors.push({
                  field: `rows[${index}].seats[${seatIndex}].floor`,
                  message: 'Floor must be 1 or 2',
                })
              }
            }

            // Validate price if it's an object
            if (
              typeof seatData === 'object' &&
              seatData &&
              'price' in seatData
            ) {
              const price = seatData.price
              if (typeof price !== 'number' || price < 0) {
                errors.push({
                  field: `rows[${index}].seats[${seatIndex}].price`,
                  message: 'Price must be a non-negative number',
                })
              }
            }
          })
        }
      })
    }

    // Validate type (optional)
    if (layoutData.type !== undefined && typeof layoutData.type !== 'string') {
      errors.push({
        field: 'type',
        message: 'Type must be a string if provided',
      })
    }

    return errors
  }

  async getBuses(): Promise<Bus[]> {
    const response = await request(`${API_BASE}/buses`, {
      method: 'GET',
    })
    return response.data
  }

  async getSeatLayout(busId: string): Promise<SeatLayout> {
    const response = await request(`${API_BASE}/buses/${busId}/seat-layout`, {
      method: 'GET',
    })
    return response.data
  }

  async saveSeatLayout(busId: string, layoutData: SeatLayout): Promise<void> {
    // Validate layout data before sending to backend
    const validationErrors = this.validateSeatLayout(layoutData)
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors
        .map((e) => `${e.field}: ${e.message}`)
        .join('\n')
      throw new Error(`Validation failed:\n${errorMessages}`)
    }

    return request(`${API_BASE}/buses/${busId}/seat-layout`, {
      method: 'POST',
      body: { layout_json: layoutData },
    })
  }

  async deleteSeatLayout(busId: string): Promise<void> {
    return request(`${API_BASE}/buses/${busId}/seat-layout`, {
      method: 'DELETE',
    })
  }
}

export const adminBusService = new AdminBusService()
