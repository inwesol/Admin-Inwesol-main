'use client'
import { useState, useCallback } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Shield } from 'lucide-react'

// Define proper TypeScript interfaces
interface PasswordInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggle: () => void
  placeholder: string
}

interface MessageState {
  type: 'success' | 'error'
  text: string
}

interface PasswordsState {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ShowPasswordsState {
  current: boolean
  new: boolean
  confirm: boolean
}

// Define error interface for Clerk API errors
interface ClerkError {
  errors?: Array<{
    code?: string
    longMessage?: string
    message?: string
  }>
  message?: string
}

// Memoized PasswordInput component to prevent unnecessary re-renders
const PasswordInput = ({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder
}: PasswordInputProps) => (
  <div className='space-y-3'>
    <label className='block text-sm font-semibold text-gray-800'>{label}</label>
    <div className='relative'>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className='w-full rounded-xl border border-gray-300 bg-white px-5 py-4 pr-14 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-[#00B24B] focus:outline-none focus:ring-2 focus:ring-[#00B24B] focus:ring-opacity-20'
        placeholder={placeholder}
        autoComplete='new-password'
        spellCheck={false}
      />
      <button
        type='button'
        onClick={onToggle}
        className='absolute right-4 top-1/2 -translate-y-1/2 transform p-1 text-gray-500 transition-colors duration-200 hover:text-[#00B24B]'
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={22} /> : <Eye size={22} />}
      </button>
    </div>
  </div>
)

export default function SettingsPage() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [passwords, setPasswords] = useState<PasswordsState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState<ShowPasswordsState>({
    current: false,
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<MessageState | null>(null)

  // Use useCallback to prevent function recreation on every render
  const handleInputChange = useCallback(
    (field: keyof PasswordsState, value: string) => {
      setPasswords(prev => ({
        ...prev,
        [field]: value
      }))
      // Clear message when user starts typing
      if (message) setMessage(null)
    },
    [message]
  )

  const togglePasswordVisibility = useCallback(
    (field: keyof ShowPasswordsState) => {
      setShowPasswords(prev => ({
        ...prev,
        [field]: !prev[field]
      }))
    },
    []
  )

  const validatePasswords = useCallback((): boolean => {
    if (!passwords.currentPassword || passwords.currentPassword.length < 3) {
      setMessage({
        type: 'error',
        text: 'Please enter your complete current password'
      })
      return false
    }
    if (!passwords.newPassword) {
      setMessage({ type: 'error', text: 'New password is required' })
      return false
    }
    if (passwords.newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'New password must be at least 8 characters long'
      })
      return false
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return false
    }
    if (passwords.currentPassword === passwords.newPassword) {
      setMessage({
        type: 'error',
        text: 'New password must be different from current password'
      })
      return false
    }
    return true
  }, [passwords])

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!validatePasswords()) return

    setIsLoading(true)
    setMessage(null)

    try {
      if (!user) {
        throw new Error('User not found')
      }

      // Check if email is verified before attempting password update
      const primaryEmail = user.primaryEmailAddress
      const emailVerified =
        primaryEmail?.verification?.status === 'verified' ||
        (primaryEmail as any)?.verificationStatus === 'verified' ||
        user.emailAddresses?.some(
          email =>
            email.id === primaryEmail?.id &&
            (email.verification?.status === 'verified' ||
              (email as any)?.verificationStatus === 'verified')
        )

      if (!emailVerified) {
        setMessage({
          type: 'error',
          text: 'Please verify your email address before changing your password. Check your inbox for a verification email.'
        })
        setIsLoading(false)
        return
      }

      // Ensure session is active by getting a fresh token
      // This helps Clerk recognize the session is valid
      await getToken()

      // Attempt to update the password
      // Clerk will handle re-verification automatically if required
      await user.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })

      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Password update error:', error)

      const clerkError = error as ClerkError
      const errorMessage =
        typeof clerkError === 'string'
          ? clerkError
          : clerkError?.message ||
            clerkError?.errors?.[0]?.message ||
            clerkError?.errors?.[0]?.longMessage ||
            'Failed to update password. Please check your current password and try again.'

      // Check if it's a verification error
      if (
        errorMessage.includes('additional verification') ||
        errorMessage.includes('verification required') ||
        errorMessage.toLowerCase().includes('verification')
      ) {
        setMessage({
          type: 'error',
          text: 'Additional verification is required. Please sign out and sign back in, then try again. If your email is not verified, please verify it first.'
        })
      } else if (clerkError?.errors?.[0]?.code === 'form_password_incorrect') {
        setMessage({ type: 'error', text: 'Current password is incorrect' })
      } else if (clerkError?.errors?.[0]?.code === 'form_password_pwned') {
        setMessage({
          type: 'error',
          text: 'This password has been found in a data breach. Please choose a different password.'
        })
      } else if (clerkError?.errors?.[0]?.code === 'form_password_too_common') {
        setMessage({
          type: 'error',
          text: 'This password is too common. Please choose a stronger password.'
        })
      } else {
        setMessage({
          type: 'error',
          text: errorMessage
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [validatePasswords, user, passwords, getToken])

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6'>
      <div className='min-h-[95vh] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl'>
        <div className='flex min-h-full flex-col justify-center p-12'>
          <div className='mx-auto w-full max-w-2xl'>
            {/* Header */}
            <div className='mb-10 text-center'>
              <div className='mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-[#00B24B] bg-opacity-10'>
                <Lock className='h-8 w-8 text-[#00B24B]' />
              </div>
              <h1 className='mb-3 text-3xl font-bold text-gray-900'>
                Change Password
              </h1>
              <p className='text-lg text-gray-600'>
                Update your credentials to maintain account security
              </p>
            </div>

            {/* Form */}
            <div className='space-y-8'>
              <PasswordInput
                label='Current Password'
                value={passwords.currentPassword}
                onChange={value => handleInputChange('currentPassword', value)}
                show={showPasswords.current}
                onToggle={() => togglePasswordVisibility('current')}
                placeholder='Enter your current password'
              />

              <PasswordInput
                label='New Password'
                value={passwords.newPassword}
                onChange={value => handleInputChange('newPassword', value)}
                show={showPasswords.new}
                onToggle={() => togglePasswordVisibility('new')}
                placeholder='Enter your new password'
              />

              <PasswordInput
                label='Confirm New Password'
                value={passwords.confirmPassword}
                onChange={value => handleInputChange('confirmPassword', value)}
                show={showPasswords.confirm}
                onToggle={() => togglePasswordVisibility('confirm')}
                placeholder='Confirm your new password'
              />

              {/* Password Requirements */}
              <div className='rounded-xl border border-blue-200 bg-blue-50 p-6'>
                <h4 className='mb-3 flex items-center gap-2 font-semibold text-blue-900'>
                  <Shield className='h-5 w-5' />
                  Password Requirements
                </h4>
                <ul className='space-y-2 text-sm text-blue-800'>
                  <li className='flex items-center gap-2'>
                    <div className='h-1.5 w-1.5 rounded-full bg-blue-600'></div>
                    At least 8 characters long
                  </li>
                  <li className='flex items-center gap-2'>
                    <div className='h-1.5 w-1.5 rounded-full bg-blue-600'></div>
                    Different from your current password
                  </li>
                  <li className='flex items-center gap-2'>
                    <div className='h-1.5 w-1.5 rounded-full bg-blue-600'></div>
                    Both new password fields must match
                  </li>
                </ul>
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`flex items-start gap-4 rounded-xl border p-5 ${
                    message.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  <div className='mt-0.5 flex-shrink-0'>
                    {message.type === 'success' ? (
                      <CheckCircle className='h-5 w-5 text-green-600' />
                    ) : (
                      <XCircle className='h-5 w-5 text-red-600' />
                    )}
                  </div>
                  <div className='font-medium'>{message.text}</div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className='flex w-full transform items-center justify-center gap-3 rounded-xl bg-[#00B24B] px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#009640] hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-lg'
              >
                <Lock className='h-5 w-5' />
                {isLoading ? (
                  <>
                    <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
