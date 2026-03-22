import { create } from 'zustand'
import type { Session, SessionStatus } from '@/types'

interface SessionStore {
  sessions: Session[];
  currentSession: Session | null;
  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (session: Session | null) => void;
  updateSession: (id: string, data: Partial<Session>) => void;
  updateSessionStatus: (id: string, status: SessionStatus) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  currentSession: null,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  updateSession: (id, data) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
      currentSession:
        state.currentSession?.id === id
          ? { ...state.currentSession, ...data }
          : state.currentSession,
    })),
  updateSessionStatus: (id, status) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
      currentSession:
        state.currentSession?.id === id
          ? { ...state.currentSession, status }
          : state.currentSession,
    })),
}))
