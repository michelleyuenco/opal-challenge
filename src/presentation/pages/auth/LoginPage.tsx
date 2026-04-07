import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@presentation/hooks/useAuth'
import { Input } from '@presentation/components/ui/Input'
import { Button } from '@presentation/components/ui/Button'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/'

  const { user, signIn, signInWithGoogle, sendPasswordReset } = useAuth()

  const [resetEmail, setResetEmail] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const emailValue = watch('email')

  useEffect(() => {
    if (user) {
      navigate(returnTo, { replace: true })
    }
  }, [user, navigate, returnTo])

  const onSubmit = (values: LoginFormValues) => {
    signIn.mutate(values, {
      onSuccess: () => navigate(returnTo, { replace: true }),
    })
  }

  const handleGoogleSignIn = () => {
    signInWithGoogle.mutate(undefined, {
      onSuccess: () => navigate(returnTo, { replace: true }),
    })
  }

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault()
    const email = resetEmail || emailValue || ''
    if (!email) return
    sendPasswordReset.mutate({ email })
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Sign In
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to participate in challenges and submit your guesses.
        </p>

        {/* Google Sign-In */}
        <div className="mt-8">
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
            loading={signInWithGoogle.isPending}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or sign in with email</span>
          </div>
        </div>

        {/* Email/Password Sign-In */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {signIn.error && (
            <p className="text-sm text-red-600">
              {(signIn.error as Error).message}
            </p>
          )}

          {signInWithGoogle.error && (
            <p className="text-sm text-red-600">
              {(signInWithGoogle.error as Error).message}
            </p>
          )}

          <Button type="submit" loading={signIn.isPending} className="w-full">
            Sign In
          </Button>
        </form>

        {/* Forgot Password */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowResetForm(!showResetForm)}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Forgot your password?
          </button>
        </div>

        {showResetForm && (
          <form onSubmit={handlePasswordReset} className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Enter your email and we'll send you a reset link.
            </p>
            <Input
              type="email"
              placeholder="Email address"
              value={resetEmail || emailValue || ''}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            {sendPasswordReset.isSuccess && (
              <p className="text-sm text-green-600">
                Reset link sent! Check your inbox.
              </p>
            )}
            {sendPasswordReset.error && (
              <p className="text-sm text-red-600">
                {(sendPasswordReset.error as Error).message}
              </p>
            )}
            <Button
              type="submit"
              variant="secondary"
              loading={sendPasswordReset.isPending}
              className="w-full"
            >
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
