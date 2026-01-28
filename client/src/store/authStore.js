import { create } from 'zustand'

const ROLE_KEY = 'eq_role'
const NAME_KEY = 'eq_name'
const EMAIL_KEY = 'eq_email'
const USER_ID_KEY = 'eq_user_id'
const CANDIDATE_ID_KEY = 'eq_candidate_id'

const getStored = (key) => (typeof window === 'undefined' ? '' : localStorage.getItem(key) || '')

const useAuthStore = create((set) => ({
  role: getStored(ROLE_KEY),
  name: getStored(NAME_KEY),
  email: getStored(EMAIL_KEY),
  userId: getStored(USER_ID_KEY),
  candidateId: getStored(CANDIDATE_ID_KEY),
  login: ({ role, name, email, userId }) => {
    localStorage.setItem(ROLE_KEY, role)
    localStorage.setItem(NAME_KEY, name || '')
    localStorage.setItem(EMAIL_KEY, email || '')
    localStorage.setItem(USER_ID_KEY, userId || '')
    set({ role, name: name || '', email: email || '', userId: userId || '' })
  },
  setCandidateId: (candidateId) => {
    localStorage.setItem(CANDIDATE_ID_KEY, candidateId || '')
    set({ candidateId: candidateId || '' })
  },
  logout: () => {
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(NAME_KEY)
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(USER_ID_KEY)
    localStorage.removeItem(CANDIDATE_ID_KEY)
    set({ role: '', name: '', email: '', userId: '', candidateId: '' })
  },
}))

export default useAuthStore
