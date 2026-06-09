import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from './firebase'

export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password)
  }

  export const logoutUser = async () => {
    return await signOut(auth)
    }