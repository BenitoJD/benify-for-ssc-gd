import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const locales = ['en', 'hi'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('locale')?.value as Locale) || defaultLocale

  return {
    locale,
    messages: {
      en: {
        // Common
        'common.appName': 'Benify',
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.submit': 'Submit',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.view': 'View',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',

        // Navigation
        'nav.home': 'Home',
        'nav.features': 'Features',
        'nav.pricing': 'Pricing',
        'nav.faq': 'FAQ',
        'nav.login': 'Login',
        'nav.signup': 'Sign Up',
        'nav.logout': 'Logout',
        'nav.dashboard': 'Dashboard',
        'nav.study': 'Study',
        'nav.tests': 'Tests',
        'nav.analytics': 'Analytics',
        'nav.community': 'Community',
        'nav.profile': 'Profile',

        // Auth
        'auth.loginTitle': 'Welcome Back',
        'auth.signupTitle': 'Create Account',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Confirm Password',
        'auth.forgotPassword': 'Forgot Password?',
        'auth.noAccount': "Don't have an account?",
        'auth.hasAccount': 'Already have an account?',
        'auth.continueWithGoogle': 'Continue with Google',
        'auth.or': 'or',

        // Dashboard
        'dashboard.welcome': 'Welcome back, {name}!',
        'dashboard.examCountdown': 'Exam Countdown',
        'dashboard.daysLeft': 'days left',
        'dashboard.todayTasks': "Today's Tasks",
        'dashboard.progress': 'Your Progress',
        'dashboard.weakAreas': 'Areas to Improve',
        'dashboard.streak': 'Current Streak',
        'dashboard.days': 'days',
      },
      hi: {
        // Common
        'common.appName': 'बेनिफाई',
        'common.loading': 'लोड हो रहा है...',
        'common.error': 'एक त्रुटि हुई',
        'common.save': 'सहेजें',
        'common.cancel': 'रद्द करें',
        'common.submit': 'जमा करें',
        'common.delete': 'हटाएं',
        'common.edit': 'संपादित करें',
        'common.view': 'देखें',
        'common.back': 'वापस',
        'common.next': 'अगला',
        'common.previous': 'पिछला',

        // Navigation
        'nav.home': 'होम',
        'nav.features': 'विशेषताएं',
        'nav.pricing': 'मूल्य',
        'nav.faq': 'सामान्य प्रश्न',
        'nav.login': 'लॉगिन',
        'nav.signup': 'साइन अप',
        'nav.logout': 'लॉग आउट',
        'nav.dashboard': 'डैशबोर्ड',
        'nav.study': 'अध्ययन',
        'nav.tests': 'परीक्षण',
        'nav.analytics': 'विश्लेषण',
        'nav.community': 'समुदाय',
        'nav.profile': 'प्रोफाइल',

        // Auth
        'auth.loginTitle': 'वापसी पर स्वागत है',
        'auth.signupTitle': 'खाता बनाएं',
        'auth.email': 'ईमेल',
        'auth.password': 'पासवर्ड',
        'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
        'auth.forgotPassword': 'पासवर्ड भूल गए?',
        'auth.noAccount': 'खाता नहीं है?',
        'auth.hasAccount': 'पहले से खाता है?',
        'auth.continueWithGoogle': 'Google से जारी रखें',
        'auth.or': 'या',

        // Dashboard
        'dashboard.welcome': 'वापसी पर स्वागत है, {name}!',
        'dashboard.examCountdown': 'परीक्षा काउंटडाउन',
        'dashboard.daysLeft': 'दिन बाकी',
        'dashboard.todayTasks': 'आज के कार्य',
        'dashboard.progress': 'आपकी प्रगति',
        'dashboard.weakAreas': 'सुधार के क्षेत्र',
        'dashboard.streak': 'वर्तमान स्ट्रीक',
        'dashboard.days': 'दिन',
      },
    },
  }
})
