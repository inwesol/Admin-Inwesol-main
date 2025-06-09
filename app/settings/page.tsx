"use client"
import { useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Shield } from 'lucide-react'

// Memoized PasswordInput component to prevent unnecessary re-renders
const PasswordInput = ({ 
  label, 
  value, 
  onChange, 
  show, 
  onToggle, 
  placeholder 
}: {
  label: string
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggle: () => void
  placeholder: string
}) => (
  <div className="space-y-3">
    <label className="block text-sm font-semibold text-gray-800">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-4 pr-14 border border-gray-300 rounded-xl focus:border-[#00B24B] focus:ring-2 focus:ring-[#00B24B] focus:ring-opacity-20 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white shadow-sm"
        placeholder={placeholder}
        autoComplete="new-password"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00B24B] transition-colors duration-200 p-1"
      >
        {show ? <EyeOff size={22} /> : <Eye size={22} />}
      </button>
    </div>
  </div>
)

export default function SettingsPage() {
  const { user } = useUser()
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Use useCallback to prevent function recreation on every render
  const handleInputChange = useCallback((field: string, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear message when user starts typing
    if (message) setMessage(null)
  }, [message])

  const togglePasswordVisibility = useCallback((field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }, [])

  const validatePasswords = useCallback(() => {
    if (!passwords.currentPassword || passwords.currentPassword.length < 3) {
      setMessage({ type: 'error', text: 'Please enter your complete current password' })
      return false
    }
    if (!passwords.newPassword) {
      setMessage({ type: 'error', text: 'New password is required' })
      return false
    }
    if (passwords.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' })
      return false
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return false
    }
    if (passwords.currentPassword === passwords.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' })
      return false
    }
    return true
  }, [passwords])

  const handleSubmit = useCallback(async () => {
    if (!validatePasswords()) return
    
    setIsLoading(true)
    setMessage(null)
    
    try {
      if (!user) {
        throw new Error('User not found')
      }
      
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
    } catch (error: any) {
      console.error('Password update error:', error)
      
      if (error?.errors?.[0]?.code === 'form_password_incorrect') {
        setMessage({ type: 'error', text: 'Current password is incorrect' })
      } else if (error?.errors?.[0]?.code === 'form_password_pwned') {
        setMessage({ type: 'error', text: 'This password has been found in a data breach. Please choose a different password.' })
      } else if (error?.errors?.[0]?.code === 'form_password_too_common') {
        setMessage({ type: 'error', text: 'This password is too common. Please choose a stronger password.' })
      } else {
        setMessage({ 
          type: 'error', 
          text: error?.errors?.[0]?.message || 'Failed to update password. Please check your current password and try again.' 
        })
      }
    }
    
    setIsLoading(false)
  }, [validatePasswords, user, passwords])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-h-[95vh]">
        <div className="p-12 flex flex-col justify-center min-h-full">
          <div className="max-w-2xl mx-auto w-full">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00B24B] bg-opacity-10 rounded-xl mb-6">
                  <Lock className="w-8 h-8 text-[#00B24B]" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Change Password</h1>
                <p className="text-gray-600 text-lg">Update your credentials to maintain account security</p>
              </div>

              {/* Form */}
              <div className="space-y-8">
                <PasswordInput
                  label="Current Password"
                  value={passwords.currentPassword}
                  onChange={(value) => handleInputChange('currentPassword', value)}
                  show={showPasswords.current}
                  onToggle={() => togglePasswordVisibility('current')}
                  placeholder="Enter your current password"
                />
                
                <PasswordInput
                  label="New Password"
                  value={passwords.newPassword}
                  onChange={(value) => handleInputChange('newPassword', value)}
                  show={showPasswords.new}
                  onToggle={() => togglePasswordVisibility('new')}
                  placeholder="Enter your new password"
                />
                
                <PasswordInput
                  label="Confirm New Password"
                  value={passwords.confirmPassword}
                  onChange={(value) => handleInputChange('confirmPassword', value)}
                  show={showPasswords.confirm}
                  onToggle={() => togglePasswordVisibility('confirm')}
                  placeholder="Confirm your new password"
                />

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Password Requirements
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      At least 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      Different from your current password
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      Both new password fields must match
                    </li>
                  </ul>
                </div>

                {/* Message Display */}
                {message && (
                  <div className={`flex items-start gap-4 p-5 rounded-xl border ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-800 border-green-200' 
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="font-medium">{message.text}</div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-[#00B24B] hover:bg-[#009640] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
                >
                  <Lock className="w-5 h-5" />
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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