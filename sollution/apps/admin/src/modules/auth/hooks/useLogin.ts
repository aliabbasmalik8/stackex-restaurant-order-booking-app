import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthError, authErrorMessageKey, toAuthError } from '../errors'
import { signInAdmin } from '../api'

type UseLoginResult = {
  email: string
  password: string
  setEmail: (value: string) => void
  setPassword: (value: string) => void
  loading: boolean
  error: string | null
  clearError: () => void
  submit: () => Promise<boolean>
}

export function useLogin(): UseLoginResult {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const submit = useCallback(async () => {
    setError(null)

    const trimmed = email.trim()
    if (!trimmed || !password) {
      setError(t('auth.errors.missing_fields'))
      return false
    }

    setLoading(true)
    try {
      await signInAdmin(trimmed, password)
      return true
    } catch (err) {
      const authErr = toAuthError(err)
      const key =
        authErr instanceof AuthError
          ? authErrorMessageKey(authErr.code)
          : 'auth.errors.unknown'
      setError(t(key))
      return false
    } finally {
      setLoading(false)
    }
  }, [email, password, t])

  return {
    email,
    password,
    setEmail,
    setPassword,
    loading,
    error,
    clearError,
    submit,
  }
}
