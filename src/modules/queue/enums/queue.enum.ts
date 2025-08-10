export enum QueuePriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

export enum QueueTopic {
  USER_REGISTRATION = 'user.registration',
  USER_LOGIN = 'user.login',
  USER_REFRESH = 'user.refresh',
  USER_LOGOUT = 'user.logout',
  USER_DELETE = 'user.delete',
  USER_CLEANUP = 'user.cleanup',
  NOTIFICATION_SEND = 'notification.send',
  DEAD_LETTER = 'dead-letter',
}
