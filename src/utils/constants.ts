import {SocialAppMeta} from '../types';

export const MIN_WORD_COUNT = 5;
export const MIN_BLOCKER_SECONDS = 10;
export const CHARACTER_LIMIT = 500;
export const SNOOZE_DURATION_MINUTES = 15;
export const DEFAULT_THRESHOLD_SECONDS = 15 * 60;
export const WARNING_THRESHOLD_PERCENT = 0.8;
export const CELEBRATION_DURATION_MS = 2000;
export const BREATHING_INHALE_SECONDS = 4;
export const BREATHING_EXHALE_SECONDS = 4;
export const BACKGROUND_TASK_INTERVAL_MINUTES = 5;

export const GRATITUDE_PROMPTS: string[] = [
  'Name one thing that made you smile today.',
  'What is something your body did for you today that you did not notice?',
  'Who is someone you are glad exists?',
  'Describe a moment of kindness you witnessed recently.',
  'What is a small comfort in your life you usually overlook?',
  'What is one thing you learned today, however small?',
  'Name something beautiful you saw in the last 24 hours.',
  'Who has had a positive influence on your life this week?',
  'What is a challenge you survived that made you stronger?',
  'What simple pleasure are you grateful for right now?',
  'Name a friend or family member and one thing you appreciate about them.',
  'What is working in your life right now that you might be taking for granted?',
  'Describe a time recently when you felt genuinely connected to someone.',
  'What is something in nature that you find beautiful or calming?',
  'Name one skill or talent you have that you are proud of.',
  'What helped you get through a tough moment this week?',
  'Is there someone who believed in you before you believed in yourself?',
  'What is something about your home or living space that brings you comfort?',
  'Name a piece of music, art, or writing that has moved you lately.',
  'What opportunity do you have today that not everyone has?',
  'What is one thing you are looking forward to, even if it is small?',
  'Describe a conversation that left you feeling understood.',
  'What is something you did today that took courage?',
  'Name something you love about yourself that has nothing to do with productivity.',
  'What is a tradition or ritual that brings you joy?',
  'Who or what gave you energy today rather than draining it?',
  'What is a mistake you made that ultimately led somewhere good?',
  'Name something that made you laugh recently.',
  'What is a boundary you set that protected your peace?',
  'Describe one moment today when you felt fully present.',
];

export const MINDFULNESS_QUOTES: string[] = [
  'The present moment is the only moment available to us.',
  'You cannot find peace by avoiding life.',
  'Almost everything will work again if you unplug it for a few minutes.',
  'Breath is the finest gift of nature.',
  'Be where you are, not where you think you should be.',
  'The quieter you become, the more you can hear.',
  'Within you, there is a stillness and sanctuary to which you can retreat at any time.',
  'Wherever you are, be all there.',
  'Awareness is the greatest agent for change.',
  'Nothing is worth more than this day.',
  'The thing about meditation is: you become more and more you.',
  'Drink your tea slowly and reverently.',
  'If you want to conquer the anxiety of life, live in the moment.',
  'Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.',
  'Life is a dance. Mindfulness is witnessing that dance.',
  'Feelings come and go like clouds in a windy sky.',
  'The best way to capture moments is to pay attention.',
  'In today already walks tomorrow.',
  'Look past your thoughts so you may drink the pure nectar of this moment.',
  'With mindfulness, you can establish yourself in the present in order to touch the wonders of life.',
  'Peace comes from within. Do not seek it without.',
  'Open the window of your mind. Allow the fresh air, new lights and new truths to enter.',
  'The present moment always will have been.',
  'Happiness is your nature. It is not wrong to desire it.',
  'The only way to live is by accepting each minute as an unrepeatable miracle.',
  'Surrender to what is. Let go of what was. Have faith in what will be.',
  'You are the sky. Everything else — it is just the weather.',
  'Walk as if you are kissing the Earth with your feet.',
  'The mind is everything. What you think, you become.',
  'Each morning we are born again. What we do today is what matters most.',
  'To live is the rarest thing in the world. Most people exist, that is all.',
  'Simplicity is the ultimate sophistication.',
  'Nature does not hurry, yet everything is accomplished.',
  'Mindfulness is a way of befriending ourselves and our experience.',
  'Not everything that is faced can be changed, but nothing can be changed until it is faced.',
  'In the midst of movement and chaos, keep stillness inside of you.',
  'The secret of health for both mind and body is not to mourn for the past.',
  'Wherever you go, there you are.',
  "Respond, don't react. Listen, don't talk. Think, don't assume.",
  'Every moment is a fresh beginning.',
  'When I am fully present, I am alive.',
  'Do small things with great love.',
  'Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.',
  'Life is available only in the present moment.',
  'You are not your thoughts; you are aware of your thoughts.',
  'Adopting the right attitude can convert a negative stress into a positive one.',
  'Spend a little more time trying to make something of yourself and a little less time trying to impress people.',
  'Tension is who you think you should be. Relaxation is who you are.',
  'Knowing yourself is the beginning of all wisdom.',
  'Even the darkest night will end and the sun will rise.',
];

export const SOCIAL_APPS: SocialAppMeta[] = [
  {
    androidPackage: 'com.instagram.android',
    iosBundleId: 'com.burbn.instagram',
    displayName: 'Instagram',
    category: 'Social',
    colorHex: '#E1306C',
  },
  {
    androidPackage: 'com.zhiliaoapp.musically',
    iosBundleId: 'com.ss.android.ugc.trill',
    displayName: 'TikTok',
    category: 'Short Video',
    colorHex: '#010101',
  },
  {
    androidPackage: 'com.twitter.android',
    iosBundleId: 'com.atebits.Tweetie2',
    displayName: 'Twitter / X',
    category: 'Social',
    colorHex: '#1DA1F2',
  },
  {
    androidPackage: 'com.facebook.katana',
    iosBundleId: 'com.facebook.Facebook',
    displayName: 'Facebook',
    category: 'Social',
    colorHex: '#1877F2',
  },
  {
    androidPackage: 'com.google.android.youtube',
    iosBundleId: 'com.google.ios.youtube',
    displayName: 'YouTube',
    category: 'Video',
    colorHex: '#FF0000',
  },
  {
    androidPackage: 'com.reddit.frontpage',
    iosBundleId: 'com.reddit.Reddit',
    displayName: 'Reddit',
    category: 'Social',
    colorHex: '#FF4500',
  },
  {
    androidPackage: 'com.snapchat.android',
    iosBundleId: 'com.snapchat.Snapchat',
    displayName: 'Snapchat',
    category: 'Messaging',
    colorHex: '#FFFC00',
  },
  {
    androidPackage: 'com.linkedin.android',
    iosBundleId: 'com.linkedin.LinkedIn',
    displayName: 'LinkedIn',
    category: 'Professional',
    colorHex: '#0A66C2',
  },
  {
    androidPackage: 'com.pinterest',
    iosBundleId: 'com.pinterest.Pinterest',
    displayName: 'Pinterest',
    category: 'Discovery',
    colorHex: '#E60023',
  },
];

export const MOOD_LABELS: Record<string, string> = {
  grateful: 'Grateful',
  calm: 'Calm',
  reflective: 'Reflective',
  challenged: 'Challenged',
  hopeful: 'Hopeful',
  neutral: 'Neutral',
};

export const MOOD_COLORS: Record<string, string> = {
  grateful: '#2D6A4F',
  calm: '#2196F3',
  reflective: '#9C27B0',
  challenged: '#FF5722',
  hopeful: '#FF9800',
  neutral: '#607D8B',
};

export const MMKV_KEYS = {
  SETTINGS: 'settings',
  STREAK: 'streak',
  ONBOARDING_COMPLETE: 'onboardingComplete',
  BLOCKER_FLAG: 'blockerFlag',
  SNOOZE_UNTIL: 'snoozeUntil',
} as const;

export const NOTIFICATION_IDS = {
  THRESHOLD_EXCEEDED: 'threshold-exceeded',
  MORNING_REMINDER: 'morning-reminder',
  EVENING_REMINDER: 'evening-reminder',
} as const;

export const CHANNEL_ID = 'doomscroll-alert';
