import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { emailPattern } from '@/lib/validation'
import { resendVerificationEmail, verifyEmailToken } from '@/api/auth'

const initialStatus = { type: 'idle', message: '' }

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState(() =>
    token
      ? { type: 'pending', message: 'Verifying your email address…' }
      : {
          type: 'error',
          message: 'Missing verification token. Submit your email below to receive a new link.',
        }
  )
  const [isVerifying, setIsVerifying] = useState(Boolean(token))
  const [resendEmail, setResendEmail] = useState('')
  const [resendStatus, setResendStatus] = useState(initialStatus)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!token) return

    let isMounted = true
    setIsVerifying(true)
    setStatus({ type: 'pending', message: 'Verifying your email address…' })

    verifyEmailToken({ token })
      .then((response) => {
        if (!isMounted) return
        setStatus({
          type: 'success',
          message: response?.message || 'Email verified successfully. You can sign in now.',
        })
      })
      .catch((error) => {
        if (!isMounted) return
        setStatus({
          type: 'error',
          message: error.message || 'Verification failed. Request a new link below.',
        })
      })
      .finally(() => {
        if (isMounted) setIsVerifying(false)
      })

    return () => {
      isMounted = false
    }
  }, [token])

  const handleResend = async (event) => {
    event.preventDefault()
    if (!emailPattern.test(resendEmail)) {
      setResendStatus({ type: 'error', message: 'Enter a valid email address.' })
      return
    }

    setIsResending(true)
    setResendStatus({ type: 'pending', message: 'Requesting a new verification link…' })

    try {
      const response = await resendVerificationEmail({ email: resendEmail })
      setResendStatus({
        type: 'success',
        message: response?.message || 'If the email exists we just sent a new link.',
      })
      setResendEmail('')
    } catch (error) {
      setResendStatus({
        type: 'error',
        message: error.message || 'Unable to send a verification email right now.',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-amber-50 px-4 py-12">
      <Card className="w-full max-w-2xl border-none shadow-2xl shadow-amber-100">
        <CardHeader className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Bus Ticket Booking System
          </p>
          <CardTitle className="text-3xl font-semibold">Verify your email</CardTitle>
          <CardDescription>
            {token
              ? 'Hang tight while we confirm the verification token.'
              : 'Paste the link from your email or request a new one below.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : status.type === 'error'
                  ? 'border-destructive/40 bg-destructive/10 text-destructive'
                  : 'border-primary/20 bg-primary/5 text-primary'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
            ) : status.type === 'error' ? (
              <AlertCircle className="mt-0.5 h-5 w-5" />
            ) : (
              <Loader2 className="mt-0.5 h-5 w-5 animate-spin" />
            )}
            <p>{status.message}</p>
          </div>

          {status.type === 'success' && (
            <div className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-white/60 p-4 text-center">
              <p className="text-sm text-muted-foreground">You can continue to the login page.</p>
              <Button asChild className="w-full sm:w-auto">
                <Link to="/login">Go to login</Link>
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-base font-semibold">Need a new verification email?</p>
              <p className="text-sm text-muted-foreground">
                Enter the email you used to register and we will resend the verification link.
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleResend}>
              <div className="space-y-2">
                <Label htmlFor="verify-email">Email</Label>
                <Input
                  id="verify-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(event) => {
                    setResendEmail(event.target.value)
                    if (resendStatus.type !== 'idle') setResendStatus(initialStatus)
                  }}
                />
              </div>

              {resendStatus.message && (
                <div
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    resendStatus.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : resendStatus.type === 'error'
                        ? 'border-destructive/40 bg-destructive/10 text-destructive'
                        : 'border-primary/20 bg-primary/5 text-primary'
                  }`}
                >
                  {resendStatus.message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isResending}>
                {isResending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Resend verification link
                  </span>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already verified?{' '}
            <Link to="/login" className="font-semibold text-primary">
              Return to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
