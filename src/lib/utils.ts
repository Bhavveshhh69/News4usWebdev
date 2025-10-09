export const getCategoryColor = (cat: string) => {
  switch (cat.toLowerCase()) {
    case 'politics': return 'red';
    case 'health': return 'teal';
    case 'sports': return 'green';
    case 'entertainment': return 'purple';
    default: return 'red';
  }
};

export const colorClasses = {
  red: 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  teal: 'border-teal-500 bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
  green: 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  purple: 'border-purple-500 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
};
