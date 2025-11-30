import React, { useState, useEffect } from 'react'
import type { RouteAdminData } from '@/types/trip.types'
import { Loader, Plus, Trash2 } from 'lucide-react'

const emptyForm: Omit<RouteAdminData, 'routeId' | 'createdAt'> = {
  operatorId: 'default-operator',
  origin: '',
  destination: '',
  distanceKm: 0,
  estimatedMinutes: 0,
  pickupPoints: [{ pointId: '', name: '', address: '', time: '' }],
  dropoffPoints: [{ pointId: '', name: '', address: '', time: '' }],
}

interface RouteFormDrawerProps {
  open: boolean
  onClose: () => void
  initialRoute: RouteAdminData | null
  onSave: (values: Omit<RouteAdminData, 'routeId' | 'createdAt'>) => void
}

export const RouteFormDrawer: React.FC<RouteFormDrawerProps> = ({
  open,
  onClose,
  initialRoute,
  onSave,
}) => {
  const [form, setForm] =
    useState<Omit<RouteAdminData, 'routeId' | 'createdAt'>>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialRoute) {
      setForm({
        operatorId: initialRoute.operatorId,
        origin: initialRoute.origin,
        destination: initialRoute.destination,
        distanceKm: initialRoute.distanceKm,
        estimatedMinutes: initialRoute.estimatedMinutes,
        pickupPoints: initialRoute.pickupPoints,
        dropoffPoints: initialRoute.dropoffPoints,
      })
    } else {
      setForm(emptyForm)
    }
  }, [initialRoute, open])

  const handleChange = (field: keyof typeof form, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const addPoint = (type: 'pickup' | 'dropoff') => {
    setForm((prev) => ({
      ...prev,
      [type === 'pickup' ? 'pickupPoints' : 'dropoffPoints']: [
        ...prev[type === 'pickup' ? 'pickupPoints' : 'dropoffPoints'],
        { pointId: '', name: '', address: '', time: '' },
      ],
    }))
  }

  const updatePointField = (
    type: 'pickup' | 'dropoff',
    index: number,
    field: 'name' | 'address' | 'time',
    value: string
  ) => {
    setForm((prev) => {
      const key = type === 'pickup' ? 'pickupPoints' : 'dropoffPoints'
      const points = [...prev[key]] as typeof prev.pickupPoints
      points[index] = { ...points[index], [field]: value }
      return { ...prev, [key]: points }
    })
  }

  const removePoint = (type: 'pickup' | 'dropoff', index: number) => {
    setForm((prev) => {
      const key = type === 'pickup' ? 'pickupPoints' : 'dropoffPoints'
      const points = [...prev[key]]
      points.splice(index, 1)
      return { ...prev, [key]: points }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(form)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="flex-1"
        style={{
          backgroundColor: 'var(--background)',
          opacity: 0.8,
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="flex h-full w-full max-w-md flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {initialRoute ? 'Edit Route' : 'Add Route'}
            </h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Configure route with pickup and dropoff points.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition"
            style={{
              color: 'var(--muted-foreground)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)'
              e.currentTarget.style.color = 'var(--foreground)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--muted-foreground)'
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form
          className="flex-1 space-y-4 overflow-auto px-5 py-4"
          onSubmit={handleSubmit}
        >
          {/* Route Info */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  From *
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                  value={form.origin}
                  onChange={(e) => handleChange('origin', e.target.value)}
                  placeholder="Origin city"
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  To *
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                  value={form.destination}
                  onChange={(e) => handleChange('destination', e.target.value)}
                  placeholder="Destination city"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  Distance (km) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                  value={form.distanceKm}
                  onChange={(e) =>
                    handleChange('distanceKm', Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  Duration (min) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                  value={form.estimatedMinutes}
                  onChange={(e) =>
                    handleChange('estimatedMinutes', Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>

          {/* Pickup Points */}
          <div className="space-y-2">
            <h3
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Pickup Points
            </h3>
            {form.pickupPoints.map((point, idx) => (
              <div
                key={idx}
                className="space-y-2 p-2 border rounded-lg"
                style={{ borderColor: 'var(--border)' }}
              >
                <input
                  type="text"
                  value={point.name}
                  onChange={(e) =>
                    updatePointField('pickup', idx, 'name', e.target.value)
                  }
                  placeholder="Location name"
                  className="w-full rounded px-2 py-1 text-xs"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                />
                <input
                  type="text"
                  value={point.address}
                  onChange={(e) =>
                    updatePointField('pickup', idx, 'address', e.target.value)
                  }
                  placeholder="Address"
                  className="w-full rounded px-2 py-1 text-xs"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                />
                <input
                  type="time"
                  value={point.time}
                  onChange={(e) =>
                    updatePointField('pickup', idx, 'time', e.target.value)
                  }
                  className="w-full rounded px-2 py-1 text-xs"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                />
                {form.pickupPoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePoint('pickup', idx)}
                    className="w-full px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded transition"
                  >
                    <Trash2 className="h-3 w-3 inline mr-1" />
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addPoint('pickup')}
              className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add pickup point
            </button>
          </div>

          {/* Dropoff Points */}
          <div className="space-y-2">
            <h3
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Dropoff Points
            </h3>
            {form.dropoffPoints.map((point, idx) => (
              <div
                key={idx}
                className="space-y-2 p-2 border rounded-lg"
                style={{ borderColor: 'var(--border)' }}
              >
                <input
                  type="text"
                  value={point.name}
                  onChange={(e) =>
                    updatePointField('dropoff', idx, 'name', e.target.value)
                  }
                  placeholder="Location name"
                  className="w-full rounded px-2 py-1 text-xs"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                />
                <input
                  type="text"
                  value={point.address}
                  onChange={(e) =>
                    updatePointField('dropoff', idx, 'address', e.target.value)
                  }
                  placeholder="Address"
                  className="w-full rounded px-2 py-1 text-xs"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                />
                <input
                  type="time"
                  value={point.time}
                  onChange={(e) =>
                    updatePointField('dropoff', idx, 'time', e.target.value)
                  }
                  className="w-full rounded px-2 py-1 text-xs"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                />
                {form.dropoffPoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePoint('dropoff', idx)}
                    className="w-full px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded transition"
                  >
                    <Trash2 className="h-3 w-3 inline mr-1" />
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addPoint('dropoff')}
              className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add dropoff point
            </button>
          </div>
        </form>

        <div
          className="flex items-center justify-end gap-2 px-5 py-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium transition"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--foreground)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card)'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium transition inline-flex items-center gap-2"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'color-mix(in srgb, var(--primary) 90%, black)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)'
            }}
          >
            {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
            {initialRoute ? 'Save Changes' : 'Add Route'}
          </button>
        </div>
      </div>
    </div>
  )
}
