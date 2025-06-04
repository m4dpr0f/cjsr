import fs from 'fs';
import path from 'path';

// Sacred text excerpts manually extracted from authentic sources
// Bhagavad Gita verses with thematic connections to the game
export const SACRED_TEXTS = {
  hinduism: [
    {
      id: 'bg_2_47',
      title: 'Right to Action (Bhagavad Gita 2.47)',
      content: 'You have a right to perform your prescribed duty, but not to the fruits of that action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.',
      source: 'Bhagavad Gita',
      tradition: 'Hinduism',
      reference: 'Chapter 2, Verse 47',
      themes: ['duty', 'action', 'detachment']
    },
    {
      id: 'bg_6_17',
      title: 'Balanced Living (Bhagavad Gita 6.17)',
      content: 'He who is regulated in his habits of eating, sleeping, recreation and work can mitigate all material pains by practicing the yoga system.',
      source: 'Bhagavad Gita',
      tradition: 'Hinduism',
      reference: 'Chapter 6, Verse 17',
      themes: ['balance', 'discipline', 'practice']
    },
    {
      id: 'bg_18_78',
      title: 'Victory Through Devotion (Bhagavad Gita 18.78)',
      content: 'Wherever there is Krishna, the master of all mystics, and wherever there is Arjuna, the supreme archer, there will also certainly be opulence, victory, extraordinary power, and morality.',
      source: 'Bhagavad Gita',
      tradition: 'Hinduism',
      reference: 'Chapter 18, Verse 78',
      themes: ['victory', 'devotion', 'divine presence']
    },
    {
      id: 'bg_11_24',
      title: 'Divine Vision (Bhagavad Gita 11.24)',
      content: 'O all-pervading Vishnu, seeing You with Your many radiant colors touching the sky, Your gaping mouths, and Your great glowing eyes, my mind is perturbed by fear. I can no longer maintain my steadiness or equilibrium of mind.',
      source: 'Bhagavad Gita',
      tradition: 'Hinduism',
      reference: 'Chapter 11, Verse 24',
      themes: ['divine vision', 'transcendence', 'awe']
    }
  ],
  
  buddhism: [
    {
      id: 'dhp_1',
      title: 'Mind as Foundation (Dhammapada 1)',
      content: 'All that we are is the result of what we have thought: it is founded on our thoughts, it is made up of our thoughts. If a man speaks or acts with an evil thought, pain follows him, as the wheel follows the foot of the ox that draws the carriage.',
      source: 'Dhammapada',
      tradition: 'Buddhism',
      reference: 'Verse 1',
      themes: ['mind', 'thoughts', 'consequences']
    },
    {
      id: 'dhp_183',
      title: 'The Teaching of All Buddhas (Dhammapada 183)',
      content: 'To avoid all evil, to cultivate good, and to cleanse one\'s mind — this is the teaching of the Buddhas.',
      source: 'Dhammapada',
      tradition: 'Buddhism',
      reference: 'Verse 183',
      themes: ['ethics', 'cultivation', 'purification']
    }
  ],
  
  christianity: [
    {
      id: 'mt_6_26',
      title: 'Divine Providence (Matthew 6:26)',
      content: 'Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?',
      source: 'Gospel of Matthew',
      tradition: 'Christianity',
      reference: 'Chapter 6, Verse 26',
      themes: ['providence', 'trust', 'divine care']
    },
    {
      id: 'phil_4_13',
      title: 'Strength in Christ (Philippians 4:13)',
      content: 'I can do all things through Christ who strengthens me.',
      source: 'Letter to the Philippians',
      tradition: 'Christianity',
      reference: 'Chapter 4, Verse 13',
      themes: ['strength', 'faith', 'empowerment']
    }
  ],
  
  islam: [
    {
      id: 'quran_2_255',
      title: 'Ayat al-Kursi (Quran 2:255)',
      content: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.',
      source: 'Quran',
      tradition: 'Islam',
      reference: 'Surah Al-Baqarah, Verse 255',
      themes: ['divine unity', 'eternal vigilance', 'sovereignty']
    }
  ],
  
  judaism: [
    {
      id: 'ps_23_1',
      title: 'The Lord is My Shepherd (Psalm 23:1)',
      content: 'The Lord is my shepherd, I shall not want.',
      source: 'Book of Psalms',
      tradition: 'Judaism',
      reference: 'Psalm 23, Verse 1',
      themes: ['guidance', 'provision', 'trust']
    }
  ],
  
  taoism: [
    {
      id: 'tao_1',
      title: 'The Tao That Can Be Spoken (Tao Te Ching 1)',
      content: 'The Tao that can be spoken is not the eternal Tao. The name that can be named is not the eternal name. The nameless is the beginning of heaven and earth.',
      source: 'Tao Te Ching',
      tradition: 'Taoism',
      reference: 'Chapter 1',
      themes: ['ineffability', 'mystery', 'origin']
    },
    {
      id: 'tao_81',
      title: 'The Sage Does Not Compete (Tao Te Ching 81)',
      content: 'True words are not beautiful; beautiful words are not true. Those who are good do not argue; those who argue are not good. The sage does not attempt anything very big, and thus achieves greatness.',
      source: 'Tao Te Ching',
      tradition: 'Taoism',
      reference: 'Chapter 81',
      themes: ['simplicity', 'non-competition', 'truth']
    }
  ],
  
  sikhism: [
    {
      id: 'jp_1',
      title: 'Mul Mantar (Japji Sahib)',
      content: 'There is one Creator, whose name is Truth, who is creative and fearless, without hate, timeless, beyond birth and death, self-existent; known by the Guru\'s grace.',
      source: 'Japji Sahib',
      tradition: 'Sikhism',
      reference: 'Mul Mantar',
      themes: ['divine unity', 'truth', 'grace']
    }
  ],
  
  atheism: [
    {
      id: 'humanist_1',
      title: 'Reason and Compassion',
      content: 'We are responsible for our own destiny. Through reason, compassion, and determination, we can create meaning and work together to build a better world for all humanity.',
      source: 'Humanist Philosophy',
      tradition: 'Atheism/Humanism',
      reference: 'Contemporary Humanist Thought',
      themes: ['responsibility', 'reason', 'compassion']
    },
    {
      id: 'stoic_1',
      title: 'Inner Strength (Marcus Aurelius)',
      content: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
      source: 'Meditations',
      tradition: 'Stoicism',
      reference: 'Marcus Aurelius',
      themes: ['inner strength', 'control', 'wisdom']
    }
  ]
};

// Get random sacred text by tradition
export function getRandomSacredText(tradition: string) {
  const texts = SACRED_TEXTS[tradition.toLowerCase() as keyof typeof SACRED_TEXTS];
  if (!texts || texts.length === 0) {
    // Fallback to a general wisdom text
    return {
      id: 'general_1',
      title: 'Universal Wisdom',
      content: 'In stillness, we find clarity. In practice, we find growth. In reflection, we find understanding.',
      source: 'Universal Wisdom',
      tradition: tradition,
      reference: 'Contemporary',
      themes: ['stillness', 'growth', 'understanding']
    };
  }
  
  return texts[Math.floor(Math.random() * texts.length)];
}

// Get all texts for a tradition
export function getTextsByTradition(tradition: string) {
  return SACRED_TEXTS[tradition.toLowerCase() as keyof typeof SACRED_TEXTS] || [];
}

// Get all available traditions
export function getAvailableTraditions() {
  return Object.keys(SACRED_TEXTS);
}