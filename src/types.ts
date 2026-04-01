export type EnergyLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type EisenhowerQuadrant = 'DO_FIRST' | 'SCHEDULE' | 'DELEGATE' | 'DONT_DO';
export type TaskType = 'FIXED' | 'FLEXIBLE';

export interface User {
  id: string;
  email: string;
  name: string;
  telegramUserId?: string; // For Telegram integration
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[]; // Relation to tasks
}

export interface Task {
  id: string;
  userId: string;
  projectId?: string; // Optional relation to Project
  parentTaskId?: string; // For Sub-tasks (Parent-Child hierarchy)
  
  title: string;
  description?: string;
  
  type: TaskType; // Fixed (has specific time) or Flexible
  eisenhowerQuadrant: EisenhowerQuadrant;
  energyLevel: EnergyLevel;
  
  dueDate?: Date;
  startTime?: Date; // For FIXED tasks
  endTime?: Date; // For FIXED tasks
  estimatedDuration?: number; // In minutes, for FLEXIBLE tasks
  
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  subTasks?: Task[]; // Relation to sub-tasks
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  
  // Advanced Habit Tracking
  currentStreak: number;
  longestStreak: number;
  streakFreeze: number; // Number of "shields" available to protect the streak
  maxFreezePerMonth: number; // e.g., 2 days freeze/month
  
  createdAt: Date;
  updatedAt: Date;
}
