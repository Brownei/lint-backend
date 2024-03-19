/* eslint-disable prettier/prettier */
export enum Routes {
  AUTH = 'auth',
  USERS = 'users',
  COLLABORATORS = 'collaborators',
  COLLABORATORS_REQUESTS = 'collaborators/requests',
  MESSAGES = 'conversations/:id/messages',
  CONVERSATIONS = 'conversations',
  PROFILE = 'profile',
  POSTS = 'posts',
}

export const userSelects = {
  email: true,
  fullName: true,
  profile: {
    username: true,
    bio: true,
    location: true,
    occupation: true,
    profileImage: true,
  },
}