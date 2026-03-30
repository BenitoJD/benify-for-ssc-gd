import { startTransition, useEffect, useRef, useState } from 'react'
import { fetchCurrentUser, logout, signInWithGoogle, type User } from './lib/auth'
import './App.css'
import heroImage from './assets/hero.png'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

function loadGoogleScript() {
  if (window.google) {
    return Promise.resolve(window.google)
  }

  return new Promise<NonNullable<Window['google']>>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]')
    if (existing) {
      existing.addEventListener('load', () => window.google && resolve(window.google), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = () => {
      if (window.google) {
        resolve(window.google)
        return
      }

      reject(new Error('Google Identity Services loaded without a client API'))
    }
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

function App() {
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isBooting, setIsBooting] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    fetchCurrentUser()
      .then((currentUser) => {
        if (!ignore) {
          startTransition(() => {
            setUser(currentUser)
          })
        }
      })
      .catch(() => {
        // A missing or expired session is a normal startup state for logged-out users.
      })
      .finally(() => {
        if (!ignore) {
          setIsBooting(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (!googleClientId || !buttonRef.current || user) {
      return
    }

    let ignore = false

    loadGoogleScript()
      .then((google) => {
        if (ignore || !buttonRef.current) {
          return
        }

        buttonRef.current.replaceChildren()
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            setError('')

            try {
              const signedInUser = await signInWithGoogle(credential)
              startTransition(() => {
                setUser(signedInUser)
              })
            } catch {
              setError('Google sign-in completed, but the API did not accept the credential.')
            }
          },
          cancel_on_tap_outside: true,
        })

        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 320,
        })
      })
      .catch(() => {
        if (!ignore) {
          setError('Google Identity Services could not be loaded in the browser.')
        }
      })

    return () => {
      ignore = true
    }
  }, [user])

  async function handleLogout() {
    setError('')

    try {
      await logout()
      startTransition(() => {
        setUser(null)
      })
    } catch {
      setError('Logout failed. Check that the API is running and CORS is configured correctly.')
    }
  }

  return (
    <div className="split-layout">
      <div className="brand-mark" aria-label="Benify">
        Benify
      </div>

      <div className="visual-panel">
        <img className="hero-illustration" src={heroImage} alt="Illustration of a person reaching for a star above a growth chart." />
      </div>

      <div className="auth-panel">
        <div className="auth-center">
          {isBooting ? <p className="muted">Restoring session...</p> : null}
          {!googleClientId ? (
            <p className="error">Google Client ID is not configured.</p>
          ) : null}
          {error ? <p className="error">{error}</p> : null}

          {user ? (
            <div className="user-profile">
              {user.picture ? <img src={user.picture} alt={user.name || user.email} /> : null}
              <div className="user-details">
                <h3>{user.name || 'Learner'}</h3>
                <p>{user.email}</p>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <div className="login-actions">
              <div className="google-wrapper" ref={buttonRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
