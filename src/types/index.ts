export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  maxSessions: number;
  maxApiKeysPerSession: number;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  name: string;
  description?: string;
  phoneNumber?: string;
  whatsappId?: string;
  status: SessionStatus;
  connectionMethod: 'QR_CODE' | 'PAIRING_CODE';
  isActive: boolean;
  webhookUrl?: string;
  webhookEnabled: boolean;
  mediaDownloadEnabled: boolean;
  mediaDownloadTypes: string[];
  mediaTtlSeconds: number;
  lastConnectedAt?: string;
  createdAt: string;
}

export type SessionStatus =
  | 'INITIALIZING'
  | 'QR_PENDING'
  | 'PAIRING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING'
  | 'ERROR'
  | 'BANNED';

export interface ApiKey {
  id: string;
  sessionId: string;
  name: string;
  keyPrefix: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  canSendMessages: boolean;
  canReadMessages: boolean;
  usageCount: number;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface EventConfig {
  id: string;
  sessionId: string;
  eventType: string;
  enabled: boolean;
  forwardToWebhook: boolean;
  forwardToSocket: boolean;
  filterOwn: boolean;
}

export interface HealthScore {
  score: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  deliveryRate: number;
  responseRate: number;
  reportRate: number;
  recommendation?: string;
  calculatedAt: string;
}

export interface WarmupStatus {
  phase: 'PASSIVE' | 'WARMING' | 'GROWING' | 'ESTABLISHED' | 'FULL';
  ageInDays: number;
  dailyLimit: number;
  todayCount: number;
  nextPhaseIn?: number;
}

export interface MessageTemplate {
  id: string;
  sessionId: string;
  name: string;
  content: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
}

export interface MediaConfig {
  mediaDownloadEnabled: boolean;
  mediaDownloadTypes: string[];
  mediaDownloadFromMe: boolean;
  mediaTtlSeconds: number;
}

export interface Group {
  id: string;
  subject: string;
  description?: string;
  owner?: string;
  participantCount: number;
  participants?: GroupParticipant[];
  creation?: number;
}

export interface GroupParticipant {
  jid: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface ContactCheck {
  phone: string;
  jid: string;
  exists: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type MessageType =
  | 'text' | 'image' | 'video' | 'audio' | 'document'
  | 'location' | 'sticker' | 'contact' | 'buttons'
  | 'list' | 'template' | 'poll' | 'reaction' | 'reply' | 'forward';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
