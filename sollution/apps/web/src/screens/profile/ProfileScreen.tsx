import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, Field, FormError, Text } from '@/components/ui'
import { AppHeader } from '@/components/layout/AppHeader'
import { useAuth } from '@/context/AuthContext'
import { errorMessageKey, getErrorMessage, toAppError } from '@/lib/errors'

export function ProfileScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile, updateUserProfile } = useAuth()
  const [name, setName] = useState(profile?.name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const canSave = name.trim().length > 1 && !saving

  const onSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSave) return
    setSaving(true)
    setSaved(false)
    setErrorMessage(null)
    try {
      await updateUserProfile({
        displayName: name.trim(),
        contactPhone: phone.trim() || null,
      })
      setSaved(true)
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, t(errorMessageKey(toAppError(error).code))),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-6 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 size-[38px] rounded-full bg-surface text-lg text-sub"
          aria-label={t('common.back')}
        >
          ‹
        </button>
        <Text as="h1" variant="display">
          {t('profile.editTitle')}
        </Text>
        <Text variant="subtitle" className="mt-1.5 text-sub">
          {t('profile.sectionContact')}
        </Text>

        <form className="mt-7 flex flex-col gap-4" onSubmit={(e) => void onSave(e)}>
          <Field
            label={t('auth.fullName')}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSaved(false)
            }}
            placeholder={t('auth.namePlaceholder')}
            autoComplete="name"
          />
          <Field
            label={t('profile.contactPhone')}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setSaved(false)
            }}
            placeholder={t('auth.phonePlaceholder')}
            type="tel"
            autoComplete="tel"
          />
          {profile?.email ? (
            <div className="rounded-[16px] bg-card px-[18px] py-3.5 shadow-card">
              <Text as="span" variant="label">
                {t('profile.emailReadOnly')}
              </Text>
              <p className="mt-1 text-[15px] font-bold">{profile.email}</p>
              <p className="mt-1 text-[12px] font-semibold text-muted">
                {t('profile.emailFromAuth')}
              </p>
            </div>
          ) : null}

          <FormError message={errorMessage} />
          {saved ? (
            <p className="text-[13px] font-bold text-sub">{t('profile.saved')}</p>
          ) : null}

          <Button
            type="submit"
            label={t('profile.save')}
            disabled={!canSave}
            loading={saving}
            className="mt-2 w-full"
          />
        </form>
      </div>
    </div>
  )
}
