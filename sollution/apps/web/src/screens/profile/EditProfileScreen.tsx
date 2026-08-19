import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, Field, FormError, Text } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { errorMessageKey, getErrorMessage, toAppError } from '@/lib/errors'
import { ProfileSubpage } from './ProfileSubpage'

export function EditProfileScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile, updateUserProfile } = useAuth()
  const [name, setName] = useState(profile?.name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const canSave = name.trim().length > 1 && !saving

  const onSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSave) return
    setSaving(true)
    setErrorMessage(null)
    try {
      await updateUserProfile({
        displayName: name.trim(),
        contactPhone: phone.trim() || null,
      })
      navigate('/profile', { replace: true })
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, t(errorMessageKey(toAppError(error).code))),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileSubpage title={t('profile.editTitle')}>
      <form className="flex flex-col gap-4" onSubmit={(e) => void onSave(e)}>
        <Text variant="subtitle" className="text-sub">
          {t('profile.sectionContact')}
        </Text>
        <Field
          label={t('auth.fullName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('auth.namePlaceholder')}
          autoComplete="name"
        />
        <Field
          label={t('profile.contactPhone')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
        <Button
          type="submit"
          label={t('profile.save')}
          disabled={!canSave}
          loading={saving}
          className="mt-2 w-full"
        />
      </form>
    </ProfileSubpage>
  )
}
