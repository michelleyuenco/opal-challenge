import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import type { Result } from '@core/Result'
import { ok, err } from '@core/Result'
import { AppError } from '@core/AppError'
import type { Unsubscribe } from '@core/types'
import type { User } from '@domain/entities/User'
import type { IAuthService } from '@domain/services/IAuthService'
import type { IUserRepository } from '@domain/repositories/IUserRepository'

export class FirebaseAuthService implements IAuthService {
  readonly #auth: Auth
  readonly #userRepository: IUserRepository
  readonly #googleProvider: GoogleAuthProvider

  constructor(auth: Auth, userRepository: IUserRepository) {
    this.#auth = auth
    this.#userRepository = userRepository
    this.#googleProvider = new GoogleAuthProvider()
  }

  async signIn(email: string, password: string): Promise<Result<User, AppError>> {
    try {
      const credential = await signInWithEmailAndPassword(this.#auth, email, password)
      return this.#resolveOrCreateUser(
        credential.user.uid,
        credential.user.email ?? email,
        credential.user.displayName ?? null,
      )
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to sign in'
      return err(AppError.unauthorized(msg))
    }
  }

  async signInWithGoogle(): Promise<Result<User, AppError>> {
    try {
      const credential = await signInWithPopup(this.#auth, this.#googleProvider)
      const firebaseUser = credential.user

      // If the Google account email already has a password-based account,
      // Firebase automatically merges them when "One account per email" is
      // enabled in the Firebase console (the default). The user document is
      // resolved/created below regardless of provider.
      return this.#resolveOrCreateUser(
        firebaseUser.uid,
        firebaseUser.email ?? '',
        firebaseUser.displayName ?? null,
      )
    } catch (error: unknown) {
      // Handle account-exists-with-different-credential: the user already
      // signed up with email/password for the same email. Guide them to
      // sign in with password first, then link Google.
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'auth/account-exists-with-different-credential'
      ) {
        return err(
          AppError.conflict(
            'An account already exists with this email. Please sign in with your password first, then link your Google account from your profile.',
          ),
        )
      }
      const msg = error instanceof Error ? error.message : 'Google sign-in failed'
      return err(AppError.unauthorized(msg))
    }
  }

  async sendPasswordReset(email: string): Promise<Result<void, AppError>> {
    try {
      await sendPasswordResetEmail(this.#auth, email)
      return ok(undefined)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to send reset email'
      return err(AppError.unknown(msg, error))
    }
  }

  async signOut(): Promise<Result<void, AppError>> {
    try {
      await firebaseSignOut(this.#auth)
      return ok(undefined)
    } catch (error) {
      return err(AppError.unknown('Failed to sign out', error))
    }
  }

  async getCurrentUser(): Promise<Result<User | null, AppError>> {
    try {
      const currentUser = this.#auth.currentUser
      if (!currentUser) return ok(null)

      const userResult = await this.#userRepository.findById(currentUser.uid)
      if (!userResult.ok) return ok(null)
      return ok(userResult.value)
    } catch (error) {
      return err(AppError.unknown('Failed to get current user', error))
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(this.#auth, (firebaseUser) => {
      if (!firebaseUser) {
        callback(null)
        return
      }

      this.#resolveOrCreateUser(
        firebaseUser.uid,
        firebaseUser.email ?? '',
        firebaseUser.displayName ?? null,
      ).then((result) => {
        callback(result.ok ? result.value : null)
      })
    })
  }

  async #resolveOrCreateUser(
    uid: string,
    email: string,
    displayName: string | null,
  ): Promise<Result<User, AppError>> {
    const existing = await this.#userRepository.findById(uid)
    if (existing.ok) return existing

    const newUser: User = {
      id: uid,
      email,
      role: 'user',
      displayName,
      createdAt: Date.now(),
    }

    const saveResult = await this.#userRepository.save(newUser)
    if (!saveResult.ok) {
      // Race condition: onAuthStateChanged may have created the document
      // concurrently. Re-check before reporting failure.
      const retryFind = await this.#userRepository.findById(uid)
      if (retryFind.ok) return retryFind
      return err(saveResult.error)
    }
    return ok(newUser)
  }
}
