import { LanguageProvider } from '@/i18n/LanguageContext'
import { WelcomeScreen } from '@/screens/WelcomeScreen'

export default function App() {
  return (
    <LanguageProvider>
      <WelcomeScreen />
    </LanguageProvider>
  )
}
