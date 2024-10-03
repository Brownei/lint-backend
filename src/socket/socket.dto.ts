export interface INotification {
  conversationId: string; // in sockets.io terms rooms
  message: string;
}

export interface SingleNotification {
  userId: string
  message: string
}
