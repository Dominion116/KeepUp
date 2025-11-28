// Task Categories System
export const TASK_CATEGORIES = {
  FITNESS: 'fitness',
  LEARNING: 'learning',
  HEALTH: 'health',
  WORK: 'work',
  PERSONAL: 'personal',
  SOCIAL: 'social',
} as const;

export type TaskCategory = typeof TASK_CATEGORIES[keyof typeof TASK_CATEGORIES];

export interface CategoryConfig {
  id: TaskCategory;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const CATEGORY_CONFIGS: Record<TaskCategory, CategoryConfig> = {
  fitness: {
    id: 'fitness',
    label: 'Fitness',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: '',
  },
  learning: {
    id: 'learning',
    label: 'Learning',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '',
  },
  health: {
    id: 'health',
    label: 'Health',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '',
  },
  work: {
    id: 'work',
    label: 'Work',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: '',
  },
  personal: {
    id: 'personal',
    label: 'Personal',
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
    icon: '',
  },
  social: {
    id: 'social',
    label: 'Social',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: '',
  },
};

export const ALL_CATEGORIES = Object.values(CATEGORY_CONFIGS);

// LocalStorage key for category mappings
const STORAGE_KEY = 'keepup-task-categories';

export interface TaskCategoryMapping {
  [taskId: string]: TaskCategory;
}

// Get category for a task
export const getTaskCategory = (taskId: string | bigint): TaskCategory | null => {
  const id = taskId.toString();
  const mappings = getCategoryMappings();
  return mappings[id] || null;
};

// Set category for a task
export const setTaskCategory = (taskId: string | bigint, category: TaskCategory): void => {
  const id = taskId.toString();
  const mappings = getCategoryMappings();
  mappings[id] = category;
  saveCategoryMappings(mappings);
};

// Remove category mapping for a task
export const removeTaskCategory = (taskId: string | bigint): void => {
  const id = taskId.toString();
  const mappings = getCategoryMappings();
  delete mappings[id];
  saveCategoryMappings(mappings);
};

// Get all category mappings
export const getCategoryMappings = (): TaskCategoryMapping => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save category mappings
const saveCategoryMappings = (mappings: TaskCategoryMapping): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Failed to save category mappings:', error);
  }
};

// Get category config
export const getCategoryConfig = (category: TaskCategory | null): CategoryConfig | null => {
  if (!category) return null;
  return CATEGORY_CONFIGS[category] || null;
};
