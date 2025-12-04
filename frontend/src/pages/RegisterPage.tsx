import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../stores/authStore'
import api from '../lib/api'
import BrandLogo from '../components/BrandLogo'
import ThemeToggle from '../components/ThemeToggle'

// Signup schema matching backend validation (tenant + user)
const signupSchema = z.object({
  // Tenant fields
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be at most 200 characters'),

  // User fields
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be at most 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be at most 100 characters'),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const password = watch('password')

  const onSubmit = async (data: SignupForm) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(false)

      // Auto-generate username from first and last name
      const rawUsername = `${data.firstName}${data.lastName}`.trim()
      let autoUsername = rawUsername
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')

      // Ensure username meets backend requirements (min 3 chars, allowed chars only)
      if (!autoUsername) {
        autoUsername = 'user'
      } else if (autoUsername.length < 3) {
        autoUsername = autoUsername.padEnd(3, '0')
      }

      // Call signup endpoint (creates tenant + user, company code auto-generated)
      const response = await api.post('/auth/signup', {
        companyName: data.companyName,
        email: data.email,
        username: autoUsername,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      })
      
      const { user, token, tenant } = response.data
      setAuth(user, token)
      
      // Store tenant info in auth store if needed
      console.log('Tenant created:', tenant)
      
      navigate('/dashboard')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-stretch">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-12xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-4 md:px-12 py-12 md:py-20">
        {/* Left column: form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
              {step === 1 ? 'Create your Countin account' : 'Set up your company'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {step === 1
                ? 'First, tell us about you. Next, we will ask for your company details.'
                : 'Now tell us the name of the company this workspace is for.'}
            </p>
          </div>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {step === 1 && (
              <>
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <input
                      {...register('firstName')}
                      type="text"
                      autoComplete="given-name"
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200 dark:border-gray-800 placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white bg-white dark:bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm transition-colors"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <input
                      {...register('lastName')}
                      type="text"
                      autoComplete="family-name"
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200 dark:border-gray-800 placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white bg-white dark:bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm transition-colors"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200 dark:border-gray-800 placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white bg-white dark:bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm transition-colors"
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone <span className="text-gray-500 dark:text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    autoComplete="tel"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200 dark:border-gray-800 placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white bg-white dark:bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm transition-colors"
                    placeholder="+1234567890"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    autoComplete="new-password"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200 dark:border-gray-800 placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white bg-white dark:bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm transition-colors"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                  )}
                  {password && !errors.password && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200 dark:border-gray-800 placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white bg-white dark:bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm transition-colors"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Next Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white dark:text-black bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={async () => {
                      const valid = await trigger([
                        'firstName',
                        'lastName',
                        'email',
                        'phone',
                        'password',
                        'confirmPassword',
                      ])
                      if (valid) {
                        setStep(2)
                      }
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('companyName')}
                    type="text"
                    autoComplete="organization"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200 dark:border-gray-800 placeholder-gray-400 dark:placeholder-gray-600 text-black dark:text-white bg-white dark:bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm transition-colors"
                    placeholder="Acme Corporation"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || success}
                    className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white dark:text-black bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Creating account...' : success ? 'Account created!' : 'Create account'}
                  </button>
                </div>
              </>
            )}

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-black dark:text-white hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
          </div>
        </div>

        {/* Right column: logo / branding */}
        <div className="hidden md:flex items-center justify-center">
          <div className="flex items-center justify-center w-full">
            <BrandLogo showText={false} size="xl" variant="auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

