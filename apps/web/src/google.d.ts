interface GoogleCredentialResponse {
  credential: string
}

interface GoogleAccountsID {
  initialize(config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    cancel_on_tap_outside?: boolean
  }): void
  renderButton(
    parent: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black'
      size?: 'large' | 'medium' | 'small'
      shape?: 'rectangular' | 'pill' | 'circle' | 'square'
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
      logo_alignment?: 'left' | 'center'
      width?: number
    },
  ): void
}

interface Window {
  google?: {
    accounts: {
      id: GoogleAccountsID
    }
  }
}

