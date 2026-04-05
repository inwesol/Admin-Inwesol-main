'use client'

import { SignIn } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'

const LoginPage: FC = () => {
  const { isLoaded } = useUser()
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(true)

  useEffect(() => {
    if (isLoaded) {
      setShowPlaceholder(false)
    }
  }, [isLoaded])

  return (
    <div className='relative flex min-h-screen'>
      <div className='absolute right-4 top-4 z-50'>
        <ThemeToggle />
      </div>
      {/* Left side - Illustration */}
      <div className='relative flex w-1/2 flex-col items-center justify-center overflow-hidden bg-muted p-12'>
        <div className='absolute inset-0 bg-muted' />

        {/* Storyset Illustration */}
        <div className='relative z-10 mb-8 w-full max-w-md'>
          <img
            src='/signin.svg'
            alt='Login illustration'
            className='h-auto w-full'
          />
        </div>

        {/* Decorative elements */}
        <div className='absolute left-10 top-10 h-24 w-24 rounded-full bg-white/10 blur-xl' />
        <div className='absolute bottom-10 right-10 h-32 w-32 rounded-full bg-white/10 blur-xl' />
        <div className='absolute right-8 top-1/3 h-16 w-16 rounded-full bg-white/5 blur-lg' />
      </div>

      {/* Right side - Login Form */}
      <div className='flex w-1/2 items-center justify-center bg-background p-12'>
        <div className='w-full max-w-sm'>
          <div className='mb-8 text-center'>
            <h2 className='mb-3 text-3xl font-bold text-foreground'>
              Admin Login
            </h2>
            <p className='text-lg text-muted-foreground'>
              Enter your provided credentials
            </p>
          </div>

          {/* Show placeholder while Clerk is loading */}
          {showPlaceholder && (
            <div className='animate-pulse space-y-4'>
              <div className='space-y-2'>
                <div className='h-4 w-24 rounded bg-muted' />
                <div className='h-10 rounded bg-muted' />
              </div>
              <div className='space-y-2'>
                <div className='h-4 w-20 rounded bg-muted' />
                <div className='h-10 rounded bg-muted' />
              </div>
              <div className='h-10 rounded bg-[#00B24B]' />
            </div>
          )}

          {/* Clerk SignIn component */}
          <div
            className={showPlaceholder ? 'absolute opacity-0' : 'opacity-100'}
          >
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: {
                    backgroundColor: '#00B24B',
                    ':hover': {
                      backgroundColor: '#009140',
                      boxShadow:
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    },
                    fontSize: '14px',
                    textTransform: 'none',
                    transition: 'all 0.2s',
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  },
                  card: 'shadow-none border-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  formFieldInput:
                    'border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200',
                  footerActionLink: 'text-blue-600 hover:text-blue-700',
                  // Hide sign up options completely
                  footerActionText: 'hidden',
                  footerAction: 'hidden',
                  // Hide social login buttons if any
                  socialButtonsBlockButton: 'hidden',
                  socialButtonsBlockButtonText: 'hidden',
                  dividerRow: 'hidden',
                  dividerText: 'hidden'
                }
              }}
              signUpUrl=''
              forceRedirectUrl='/clients'
              fallbackRedirectUrl='/clients'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
