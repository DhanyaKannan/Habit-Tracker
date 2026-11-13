// Curated Offline Motivational Quotes for HabitFlow
export const MOTIVATIONAL_QUOTES = [
  {
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant"
  },
  {
    quote: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma"
  },
  {
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear"
  },
  {
    quote: "The secret of your future is hidden in your daily routine.",
    author: "Mike Murdock"
  },
  {
    quote: "Habits are the compound interest of self-improvement.",
    author: "James Clear"
  },
  {
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    quote: "Action is the foundational key to all success.",
    author: "Pablo Picasso"
  },
  {
    quote: "Consistency is what transforms average into excellence.",
    author: "Tony Robbins"
  },
  {
    quote: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    quote: "Your habits will determine your future. Build them with care.",
    author: "Jack Canfield"
  },
  {
    quote: "Every action you take is a vote for the person you wish to become.",
    author: "James Clear"
  },
  {
    quote: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln"
  }
];

export function getQuoteForToday() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const index = Math.abs(dayOfYear) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}

