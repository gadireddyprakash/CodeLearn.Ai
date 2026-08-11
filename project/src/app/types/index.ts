// Types for the Code Learning Application

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  fullName?: string;
  mobile?: string;
  bio?: string;
  location?: string;
  avatar?: string;
}

export interface UserStats {
  userId: string;
  username: string;
  totalScore: number;
  timeSpent: number; // in minutes
  levelsCompleted: number;
  rank: number;
  progressPercentage: number;
}

export interface Leaderboard {
  users: UserStats[];
  lastUpdated: string;
}