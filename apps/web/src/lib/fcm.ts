'use client'

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getMessaging, Messaging, getToken, onMessage, MessagePayload } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FCM_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FCM_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FCM_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FCM_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FCM_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FCM_APP_ID,
}

function hasFirebaseConfig(): boolean {
  return Object.values(firebaseConfig).every((value) => Boolean(value))
}

// Initialize Firebase app (singleton)
let app: FirebaseApp | null = null
let messaging: Messaging | null = null

export function initializeFirebase(): { app: FirebaseApp; messaging: Messaging } | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!hasFirebaseConfig()) {
    return null
  }

  try {
    if (!app) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig as Required<typeof firebaseConfig>) : getApps()[0]
    }
    
    if (!messaging) {
      messaging = getMessaging(app)
    }

    return { app, messaging }
  } catch (error) {
    console.error('Firebase initialization error:', error)
    return null
  }
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface FCMServiceState {
  isSupported: boolean
  permission: NotificationPermission | 'unsupported' | 'default' | 'granted' | 'denied'
  subscription: PushSubscriptionData | null
  fcmToken: string | null
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  return (
    hasFirebaseConfig() &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

// Get current notification permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

// Request notification permission from user
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  
  const permission = await Notification.requestPermission()
  return permission
}

// Get FCM VAPID key from environment
function getVapidKey(): string {
  return process.env.NEXT_PUBLIC_FCM_VAPID_KEY || ''
}

// Subscribe to FCM push notifications
export async function subscribeToPush(): Promise<string | null> {
  const firebase = initializeFirebase()
  if (!firebase) {
    console.warn('Firebase messaging is not configured')
    return null
  }

  const { messaging } = firebase

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/firebase-cloud-messaging-push-scope',
    })

    // Get FCM token
    const fcmToken = await getToken(messaging, {
      vapidKey: getVapidKey(),
      serviceWorkerRegistration: registration,
    })

    if (fcmToken) {
      console.log('FCM Token obtained:', fcmToken.substring(0, 20) + '...')
      return fcmToken
    } else {
      console.warn('No FCM token received - user may have declined permission')
      return null
    }
  } catch (error) {
    console.error('Error subscribing to push:', error)
    return null
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      return true
    }
    return false
  } catch (error) {
    console.error('Error unsubscribing from push:', error)
    return false
  }
}

// Get current push subscription
export async function getCurrentSubscription(): Promise<PushSubscriptionData | null> {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      const json = subscription.toJSON() as PushSubscriptionData
      return json
    }
    return null
  } catch (error) {
    console.error('Error getting current subscription:', error)
    return null
  }
}

// Set up foreground message handler
export function onForegroundMessage(callback: (payload: MessagePayload) => void): (() => void) | null {
  const firebase = initializeFirebase()
  if (!firebase) {
    return null
  }

  const { messaging } = firebase

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)
      callback(payload)
    })
    return unsubscribe
  } catch (error) {
    console.error('Error setting up foreground message handler:', error)
    return null
  }
}

// Handle notification click when app is in background
export function onNotificationClick(callback: (data: Record<string, string>) => void): void {
  if (typeof window === 'undefined') {
    return
  }

  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
      callback(event.data.data || {})
    }
  })
}

// Notification types supported by the app
export type NotificationType = 
  | 'streak_reminder'
  | 'study_reminder'
  | 'exam_alert'
  | 'document_deadline'
  | 'badge_earned'
  | 'reply_received'
  | 'answer_accepted'
  | 'upvote_milestone'
  | 'announcement'

export interface NotificationData {
  type: NotificationType
  title: string
  body: string
  url?: string
  icon?: string
  tag?: string
}

// Show local notification (for foreground messages)
export function showLocalNotification(data: NotificationData): void {
  if (typeof window === 'undefined') {
    return
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      tag: data.tag || data.type,
      data: data,
    })

    notification.onclick = () => {
      window.focus()
      if (data.url) {
        window.location.href = data.url
      }
      notification.close()
    }
  }
}

// Get initial FCM state
export async function getFCMState(): Promise<FCMServiceState> {
  const isSupported = isPushSupported()
  const permission = getNotificationPermission()
  
  let subscription: PushSubscriptionData | null = null
  let fcmToken: string | null = null

  if (isSupported && permission === 'granted') {
    subscription = await getCurrentSubscription()
    const firebase = initializeFirebase()
    if (firebase) {
      try {
        fcmToken = await getToken(firebase.messaging, {
          vapidKey: getVapidKey(),
        })
      } catch {
        // Token retrieval failed
      }
    }
  }

  return {
    isSupported,
    permission,
    subscription,
    fcmToken,
  }
}

// Store FCM token in backend
export async function storeFCMToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('/api/v1/users/me/push-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fcm_token: token }),
    })
    return response.ok
  } catch (error) {
    console.error('Error storing FCM token:', error)
    return false
  }
}

// Remove FCM token from backend
export async function removeFCMToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/v1/users/me/push-token', {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error removing FCM token:', error)
    return false
  }
}

export default {
  initializeFirebase,
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  onForegroundMessage,
  onNotificationClick,
  showLocalNotification,
  getFCMState,
  storeFCMToken,
  removeFCMToken,
}
