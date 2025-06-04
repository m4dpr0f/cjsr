// Season 0 Campaign: The Rise of the First Feather

export interface CampaignRace {
  id: number;
  title: string;
  setting: string;
  prompt: string;
  promptDescription: string;
  difficulty: "easy" | "medium" | "hard" | "extreme";
  unlocks: string[];
  xpReward: number;
  completed?: boolean;
  bestStats?: {
    wpm: number;
    accuracy: number;
    time: number;
    position: number;
    completedAt: Date;
  };
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  races: CampaignRace[];
  progress?: number; // Index of current race
  completed?: boolean;
  unlocked?: boolean; // Whether the campaign is unlocked for the player
  bestScores?: { [raceId: number]: any }; // Best scores for each race
}

// Sample prompts for each race based on Steve's 9-race campaign arc
const RACE_PROMPTS = {
  race0:
    "I AM STEVE GARUHEART! ... but you can call me THE CHICKEN JOCKEY!!!",

  race1:
    "Steve joined a big festival where Garu riders raced for fun and honor. The city let people watch and cheer, but many didn't understand the real bond between a rider and their Garu. Steve rode with Brutus, his big feathered friend, listening to music that helped them move together. Some people made fun of him and called him 'Chicken Jockey,' but Steve didn't care. He raced with joy, proud of his rhythm and history. The air filled with the sounds of celebration, colorful banners flying overhead as Steve and Brutus wove through the course with perfect harmony.",

  race2:
    "After the race, Steve went home to fix Brutus's gear. He used old tools and strong feathers to make a new saddle. Then he rode through high walkways, trading things with other riders. He didn't need roads or signs. Steve trusted his feeling, his Garu, and the air. His ride wasn't just about speed-it was about being free. The workshop smelled of leather and feathers, the tools worn but reliable in his experienced hands. As sunset painted the sky, Steve and Brutus took to the paths only they could see.",

  race3:
    "Steve visited a bright, busy market full of colors and sounds. There, he met Iam, a kind girl who wrote special poems. They shared stories instead of coins. Iam gave Steve a small glowing token, and Steve gave her a song he had written. They sat under a warm light and talked until the market faded into night. That's when their story together began. The Ember Market glowed with lanterns, the air rich with spices and laughter. Steve felt something change in his heart as he listened to Iam's words, something that would shape all his journeys to come.",

  race4:
    "One day, city guards took Brutus away. Steve waited until the sun went down. Then he climbed rooftops and moved like a shadow to find him. When Steve saw Brutus in a cage, he set him free. They raced away together as alarms blared. Steve knew they couldn't stay. So they ran. The moonlight guided their escape, boots slipping on slate tiles as guards shouted below. Brutus's feathers gleamed silver in the darkness as they leapt from building to building, their bond stronger than any cage.",

  race5:
    "Steve and Iam escaped into the woods. They found an old stone where Garu used to nest. There, they built a small home and shared quiet days together, learning to live with the land. Iam told Steve a story her father once shared. She said, 'When I dreamed of catching a fish, my father told me it meant a child was on the way.' She smiled and placed a hand on her belly. Steve held her close and listened with quiet joy as they talked about the future. The forest welcomed them, ancient trees standing guard as they created a new life away from those who would not understand.",

  race6:
    "Trouble came when a robot from the empire flew too close. Steve jumped on Brutus and raced through hot, smoky land. Fire cracked the ground as they ran. Steve used his quill to trick the robot's signals. It was a scary ride, with falling rocks and shaking earth. But Steve didn't stop. He had to keep his family safe. Ash filled the air, making it hard to breathe as Brutus's powerful legs carried them through dangerous terrain. The robot's lights flickered and faded behind them as Steve's clever trick worked, buying precious time for those he loved.",

  race7:
    "Some time passed. Steve dreamed of becoming a father. He planned a big race in the mountains for other hidden Garu riders. There were no prizes-just the joy of riding together. Each rider brought their story. Steve rode last. When he finished, he saw his children clapping at the edge of the track. He smiled. For a moment, everything felt right. The mountain air was crisp and clean, the summit track challenging even the most skilled riders. But it was the faces of his children that made Steve's heart soar higher than any race could take him.",

  race8:
    "Steve wanted to pass on what he loved most. He gave Auto his saddle and a special feather to remember him by. Then he gave Iam his book of memories. That night, he placed a hidden record of their story into the rocks. He hoped they wouldn't need it, but wanted them to remember what he stood for. The fire crackled as he carefully wrapped each gift, knowing that these treasures carried more than just material value-they carried his legacy, his wisdom, and his love.",

  race9:
    "Steve and Auto joined riders from all over the land for the biggest Garu celebration anyone had ever seen. Flags flew high, drums pounded like heartbeats, and the sky shimmered with feathers of every color. This was more than a race-it was a festival of freedom, a promise that the old ways would never be forgotten. Steve stood beside Auto at the starting line of the World Ride, a race that would circle the earth. He smiled proudly, knowing this was just the beginning. The crowd roared as generations of riders gathered, unified by their respect for the ancient bond between human and Garu.",
};

// Auto's campaign prompts
const AUTO_RACE_PROMPTS = {
  race0:
    "I am Auto Garuheart. My father Steve named me for the rhythm that drives all things forward-the automatic beat of a heart, the steady pulse of progress. I carry his legacy in my veins and his red quill in my hand, but my story is written with sparks and circuits, gears and code. Where my father rode with tradition, I race toward tomorrow. With my Garu companion Ember by my side, I will forge a new path that honors the old ways while embracing the power of innovation.",

  race1:
    "Riders from every land came together to race in the biggest festival ever held. Feathers filled the sky. Music rang from mountaintops. Auto stood beside his father, holding his red quill, ready for his first real race. When the horn blew, he felt the rhythm in his chest. He and his young Garu, Ember, soared down the track. It wasn't about winning. It was about feeling alive. And as they crossed the finish, Auto's story truly began.",

  race2:
    "After the festival, Auto found a hidden workshop deep in the cliffs. There, he met Kip, a clever rider who built things with lightning and scrap. Auto helped gather parts to upgrade Ember's saddle and crafted his first gear: a light-powered quill booster. Racing through wind tunnels and air bridges, he learned to listen to the world in motion. 'Machines can feel too,' Kip said. Auto believed it.",

  race3:
    "Auto returned to the outer city, where his father had once been called a thief. It was the first time he'd been back since the night Steve disappeared. No one saw it happen. One day, Steve was there. The next, only his feather was left on the doorway. Now, Auto wore that same feather as his name. There, he entered the secret race market, where riders traded parts, stories, and coded scrolls. He met Sela, a city-born scribe who whispered of hidden places where old knowledge lived.",

  race4:
    "Auto broke into the old city records, hidden deep below stone halls. Every Garu had been given a number, their real names erased. Auto typed fast, dodging traps and writing new names into the book of memory. 'Wahinu. Ember. Koa.' With each name restored, the pages glowed. He didn't just remember - he rewrote. And the Codex began to whisper back.",

  race5:
    "In the tunnels beneath the market, Auto found a place called the Geargrave - where broken mounts and old tech were tossed away. He drew new maps with his quill and built his first machine-kin: a small scout Garu made from gears and feathers. It squeaked and hopped, and followed him everywhere. 'I name you Echo,' he said. And the ground began to shift.",

  race6:
    "The empire traced him. Their drones hacked the sky and turned the wind wild. Auto and Ember had to race through a broken firewall maze - every wall changing, every word he typed sparking wild paths. 'The rules are theirs,' he thought, 'but the rhythm is mine.' By the time he burst out of the codefield, he saw Ember was slowing. She had given her all. He knelt beside her and said, 'You've earned your rest.' She nudged him one last time.",

  race7:
    "That night, near the edge of camp, a wild Garu arrived. Her feathers were ruffled and her steps unsure, but her eyes burned with fire. 'She came from the empire's edge,' Kip said. 'Alone. Escaped.' Auto approached slowly. The Garu didn't run. He touched her chest and whispered, 'Your name is Timaru. If you'll ride with me, we'll write the next part together.' She nodded.",

  race8:
    "With Timaru and Echo by his side, Auto delivered a ledger of rewritten names to the Hidden Circle - a growing group of resistance riders. They gave him a coin of flameglass, shaped like a feather, and told him: 'You are no longer a boy. You are the storm.' His name now stood beside Steve's in the Book of Riders. And beneath it, the words: 'He rides with both fire and code.'",

  race9:
    "The sky was red with sunrise. The Garu gathered again - but this time, the world was watching. The World Ride continued, not just as a race, but as a movement. Auto stood tall, Timaru at his side, Echo whirring in rhythm. When the signal flared, they launched forward, his red quill glowing like a comet. The wind lifted beneath them, and as Auto flew ahead, the Codex sang: 'The Chicken Jockey rides again.'",
};

// Matikah's campaign prompts
const MATIKAH_RACE_PROMPTS = {
  race0:
    "I am Matikah, daughter of moonlight and music. My name means 'the one who sings to stars,' and in my voice lives the ancient harmony between earth and sky. Born under silver light with my Garu companion Chalisa, I learned early that true racing is not about speed alone-it is about finding the rhythm that connects all living things. Where others see only competition, I hear the song that binds rider and mount, heart to heart, spirit to spirit.",

  race1:
    "Matikah didn't ride at first. She ran barefoot, side by side with Chalisa, her Garu friend. Beneath the full moon, they raced through misty trees while the leaves sang above. It wasn't about speed - it was about breath. Matching step for step. Heart for heart. At the finish, Chalisa bent her long neck, and Matikah placed her hand over her golden beak. The world shifted. The bond began.",

  race2:
    "To earn her place as a rider, Matikah had to gather the wind-feathers: rare plumage that only appeared during dawn gusts. With Chalisa's help, she climbed, leapt, and collected each one. Every feather glowed with a different story. She weaved them into a sash that shimmered with motion. This was not just her gear - it was her wind-song, stitched from trust and sky.",

  race3:
    "In a hidden forest market, Matikah danced between booths, trading her woven sash for old scrolls, feathers, and a glowing flute that once belonged to a scribe. There she met Ayo, a dancer who taught her how to race with flame underfoot. They competed in a spinning fire-circle, where each turn made her laugh and leap. 'You ride with music,' Ayo said. 'That's rarer than gold.'",

  race4:
    "Matikah found a flooded temple deep in the swamp. Its walls whispered old stories of riders forgotten by time. She and Chalisa had to wade through dark waters, reading glyphs aloud to open stone doors. With each spoken name, the pool shimmered. As she reached the center, a memory called out - not hers, but her mother's. Iam's voice, hidden in the walls. 'Speak, daughter. Sing us free.'",

  race5:
    "To protect her people's stories, Matikah raced through the ancient mossroot trails, chased by echo-beasts of stone and code. She drew new maps with her flute and quill, each note revealing secret paths. Chalisa trusted her sound more than sight, galloping through vines and fog. By the end, they had shaped a new path through the earth - one only moon-riders could follow.",

  race6:
    "Everything changed when the sky cracked open. A storm of glitch and light swallowed the old trails. Matikah was pulled into the Spiral - a shifting track made of broken songs and twisted gravity. Only her rhythm kept her grounded. She and Chalisa raced not forward, but inward - and emerged with a melody that no one else remembered. A spell of balance in chaos.",

  race7:
    "Matikah was called to the Circle of Feathered Elders. To become a Scribe Rider, she had to ride across a bridge of names - every step a story, every breath a memory. As she typed and rode, the track changed based on her heart. She rode as herself, but carried her whole family: Steve's hammerbeat, Iam's whisper-song, and Auto's flame. At the far end, Chalisa bowed. Matikah had become a legend, and she had earned her name.",

  race8:
    "As tradition called, Matikah gave up her most treasured creation - the wind-feather sash - to the Codex Flame. In return, she was gifted a pearl-quill made from starlight. It allowed her to write mid-race, shaping spells in motion. With it, she recorded her own line in the Book of Riders: 'I did not tame my Garu. I followed her. And we arrived.'",

  race9:
    "At the next World Ride, Matikah did not join the race. Instead, she stood at the peak with Chalisa. She sang. As she did, riders from seven nations launched from the hill, her voice guiding them across the stars. The Codex glowed. Riders wept. The flame danced in the sky like a story retold. Matikah closed her eyes. 'Let them race. I will sing the way.'",
};

// Iam's campaign prompts
const IAM_RACE_PROMPTS = {
  race0:
    "Iam Iam. That is my name, spoken twice because I am both the question and the answer, the seeker and the found. I am the mystery that walks between shadow and light, carrying stories that have never been told and memories that belong to no one and everyone. With each word I write, with each race I run, I weave the threads that connect all tales. My journey is not about reaching a destination-it is about discovering who I become along the way.",

  race1:
    "As a child of the trade routes, Iam learned to read stories from sand, wind, and whispers. At the Scrollrunner's Festival, young scribes raced across open fields carrying glowing scrolls, each step unlocking a new verse. Iam's scroll sang only when she laughed. She didn't win, but her story danced through the crowd. That night, her father told her, 'You ride the world with your words.'",

  race2:
    "Iam wandered the wild trails alone, learning the names of birds and the shape of silent things. She raced with wind-garlanded traders and learned to speak the 'feather tongue' - a code of colors and motions. Her mount then was no Garu, but her own two feet and the whispers of the sky. Each journey added a symbol to her cloak, stitched with windthread and patience.",

  race3:
    "At the famous Ember Market, Iam traded a poem for a golden quill. She used it to carve fire-letters on leaves and lanterns. That day, she met a soft-eyed rider named Steve, who shared his song in return. They walked between market stalls long after the sun had set. 'You write like you're flying,' he said. 'You ride like you're listening,' she replied. A bond was sparked, not claimed.",

  race4:
    "After the escape, Iam and Steve hid in the ridgewood. Their home was built from roots and moonlight. Iam planted memory-ribbons in the trees, each one holding a whisper of their love. She raced quietly through the glades, marking safe paths with lullaby glyphs. When she dreamed of catching a fish, her father's words echoed: 'That means a child is coming.' Matikah stirred in her belly. The forest hummed.",

  race5:
    "While Steve mapped trails with stone and speed, Iam charted meaning with color and cloth. She raced between safehouses and villages, delivering stitched scrolls no code-breaker could read. Her quill wrote paths only the heart could follow. She learned the turns of the land by how they echoed her children's names - Auto in thunder, Matikah in mist.",

  race6:
    "The drone came fast. Steve rode to draw it away. Iam stayed to shield the children. She raced through the camp, gathering tools, hiding scrolls, singing safety into stones. When the fire cracked the sky, she drew a line of protection around their home. 'Not today,' she whispered. Her race wasn't for escape. It was to hold the center.",

  race7:
    "Years passed. Iam stood before the Council of Scribes, holding a book with no words. To earn her seal, she had to ride the Inkstone Track and let the world write through her. Each curve brought memories: Steve's laugh, Auto's rage, Matikah's song. Her quill floated. Her mount was made of light and silence. When she crossed the final line, her book was full.",

  race8:
    "Iam returned to her old home, now a meeting place for Riders. She gave each visitor a story of who they were - not from blood, but from rhythm. She was no longer just a mother or a rider. She was a keeper of kin. In the flamebasket near the door, she found a feather. Brutus's feather. Left by someone unseen.",

  race9:
    "On the day of the Great Ride, Iam didn't race. She stood on a high hill and sang. Her voice wove seven old songs into one - one for each Rider who'd ever held the quill with love. Her voice called across the fields, guiding lost Garu home. And as the stars turned, Matikah and Auto raced below. 'Let them ride,' she whispered. 'I will be the wind that carries them.'",
};

// Special donor appreciation race featuring new jockey assets
const DONOR_RACE_PROMPT = "Thank you for believing in the future of Chicken Jockey Scribe Racer! Your support helps us bring new stories, new riders, and new adventures to life. As you type these words, imagine the colorful Garu riders of tomorrow - the brave jockeys who will carry forward the legacy that Steve, Iam, Auto, and Matikah began. Each keystroke you make helps fund the development of new characters, new mounts, and new worlds where typing becomes an art form. The rainbow of feathers before you represents the diversity of stories yet to be told, the spectrum of adventures waiting to unfold. From the emerald-winged scouts to the crimson-plumed warriors, from the sapphire wind-dancers to the golden flame-bearers - each rider carries a piece of the dream you've helped make possible. Race forward, dear supporter, knowing that your contribution echoes through every character we create, every story we tell, and every race we design. The future of CJSR is as bright and varied as the magnificent Garu spreading their wings in tomorrow's dawn!";

export const SPECIAL_RACES = {
  donor: {
    id: "donor-appreciation",
    title: "Rainbow Riders: A Thank You Race",
    description: "A special appreciation race for our generous donors, featuring the colorful new jockey designs coming to CJSR",
    prompt: DONOR_RACE_PROMPT,
    difficulty: "medium" as const,
    xpReward: 100,
    specialRewards: ["Donor Badge", "Rainbow Feather collectible", "Supporter title"]
  }
};

export const CAMPAIGNS: Record<string, Campaign> = {
  season0: {
    id: "season0",
    title: "STEVE GARUHEART: RIDER IN FUGITIVITY",
    description:
      "A 10-race single-player typing campaign that tells the legendary story of Steve Garuheart, a defiant Chicken Jockey who kept the tradition alive. Each race contains lore, themed prompts, and unlockable rewards.",
    races: [
      {
        id: 0,
        title: "The Dreamer's Introduction",
        setting:
          "A quiet hillside at dawn where young Steve first meets his destiny with Brutus the Garu.",
        promptDescription:
          "Steve introduces himself and shares the beginning of his legendary journey as a Chicken Jockey.",
        prompt: RACE_PROMPTS.race0,
        difficulty: "easy",
        unlocks: ["Steve's Origin Badge", "Dawn Sky background"],
        xpReward: 25,
      },
      {
        id: 1,
        title: "The Festival of Flightsong",
        setting:
          "A vibrant city festival where Garu riders race for honor among colorful banners and cheering crowds.",
        promptDescription:
          "Steve races with joy and pride at a traditional festival, bonding with his Garu mount Brutus despite mockery from others.",
        prompt: RACE_PROMPTS.race1,
        difficulty: "easy",
        unlocks: ["Festival Brutus skin", "Celebration Banner trail"],
        xpReward: 50,
      },
      {
        id: 2,
        title: "The Maker's Ride",
        setting:
          "Steve's workshop filled with tools and materials for crafting riding gear, high walkways beyond the window.",
        promptDescription:
          "After the race, Steve crafts new gear for Brutus and rides the high paths known only to Garu riders.",
        prompt: RACE_PROMPTS.race2,
        difficulty: "easy",
        unlocks: ["Craftsman's Saddle", "Sky Path background"],
        xpReward: 75,
      },
      {
        id: 3,
        title: "The Ember Market",
        setting:
          "A bustling night market lit by warm lanterns, filled with traders, storytellers, and secret exchanges.",
        promptDescription:
          "Steve meets Iam, a poet who changes his life, as they share stories instead of coins under the market's warm glow.",
        prompt: RACE_PROMPTS.race3,
        difficulty: "medium",
        unlocks: ["Ember Token collectible", "Market Lantern effect"],
        xpReward: 100,
      },
      {
        id: 4,
        title: "The Rooftop Reclaiming",
        setting:
          "Moonlit city rooftops with guard towers and alarms, Brutus caged in a restricted compound below.",
        promptDescription:
          "Under cover of night, Steve infiltrates a city compound to rescue his captured Garu companion Brutus.",
        prompt: RACE_PROMPTS.race4,
        difficulty: "medium",
        unlocks: ["Shadow Runner effect", "Moonlit Escape background"],
        xpReward: 125,
      },
      {
        id: 5,
        title: "The Way of Roots",
        setting:
          "A peaceful forest clearing with an ancient stone nest site and a small, hidden dwelling.",
        promptDescription:
          "Steve and Iam build a new life in the forest, finding peace and the promise of a family together.",
        prompt: RACE_PROMPTS.race5,
        difficulty: "medium",
        unlocks: ["Forest Home background", "Family Blessing effect"],
        xpReward: 150,
      },
      {
        id: 6,
        title: "Ashwind Skirmish",
        setting:
          "A dangerous landscape of cracked earth, smoke, and fire with imperial robots searching from above.",
        promptDescription:
          "Steve races through dangerous, fiery terrain to protect his family from an imperial drone.",
        prompt: RACE_PROMPTS.race6,
        difficulty: "hard",
        unlocks: ["Smokerunner trail", "Signal Scrambler collectible"],
        xpReward: 175,
      },
      {
        id: 7,
        title: "The Summit Circuit",
        setting:
          "A majestic mountain racetrack with breathtaking views and gathered Garu riders from all hidden communities.",
        promptDescription:
          "Years later, Steve organizes a mountain race for fellow Garu riders, witnessing the joy of his children at the finish line.",
        prompt: RACE_PROMPTS.race7,
        difficulty: "hard",
        unlocks: ["Mountain Circuit background", "Summit Badge collectible"],
        xpReward: 200,
      },
      {
        id: 8,
        title: "The Feather Ledger",
        setting:
          "A quiet evening scene with Steve passing down treasured heirlooms to his family and hiding records in stone.",
        promptDescription:
          "Steve passes his legacy to Auto and Iam, ensuring his story and traditions will survive whatever comes.",
        prompt: RACE_PROMPTS.race8,
        difficulty: "hard",
        unlocks: ["Legacy Saddle collectible", "Memory Book effect"],
        xpReward: 225,
      },
      {
        id: 9,
        title: "The Grand Gathering of Wings",
        setting:
          "An epic gathering of Garu riders from across the world, with flags, drums, and a rainbow of feathers filling the sky.",
        promptDescription:
          "Steve and Auto join the greatest Garu celebration ever known, preparing for the legendary World Ride race.",
        prompt: RACE_PROMPTS.race9,
        difficulty: "extreme",
        unlocks: [
          "World Rider title",
          "Garuheart Legacy badge",
          "Steve Character unlock",
        ],
        xpReward: 300,
      },
    ],
  },
  auto: {
    id: "auto",
    title: "AUTO GARUHEART: COMET QUILL",
    description:
      "A 10-race single-player typing campaign that follows Auto's journey from Steve's son to a legendary rider in his own right, merging technology and tradition.",
    races: [
      {
        id: 0,
        title: "The Innovator's Introduction",
        setting:
          "Auto's workshop filled with gears, circuits, and his father's red quill glowing on the workbench.",
        promptDescription:
          "Auto introduces himself and his mission to honor tradition while embracing technological innovation.",
        prompt: AUTO_RACE_PROMPTS.race0,
        difficulty: "easy",
        unlocks: ["Auto's Origin Badge", "Tech Workshop background"],
        xpReward: 25,
      },
      {
        id: 1,
        title: "The Grand Gathering of Wings",
        setting:
          "A massive festival where riders from all lands come together, with feathers filling the sky and music ringing from mountaintops.",
        promptDescription:
          "Auto's first real race alongside his father, where he experiences the joy of riding with his young Garu, Ember.",
        prompt: AUTO_RACE_PROMPTS.race1,
        difficulty: "easy",
        unlocks: ["Young Auto skin", "Festival Ember mount"],
        xpReward: 50,
      },
      {
        id: 2,
        title: "The Tinker's Trail",
        setting:
          "A hidden workshop deep in the cliffs, filled with lightning-powered inventions and mechanical marvels.",
        promptDescription:
          "Auto meets Kip, a clever rider who teaches him to craft tech, including his first light-powered quill booster.",
        prompt: AUTO_RACE_PROMPTS.race2,
        difficulty: "easy",
        unlocks: ["Quill Booster item", "Wind Tunnel trail"],
        xpReward: 75,
      },
      {
        id: 3,
        title: "The City of Shadows",
        setting:
          "The outer city where Auto returns for the first time since his father's disappearance, now wearing Steve's feather as his own.",
        promptDescription:
          "Auto explores the secret race market, trading parts and meeting Sela, who tells of places where old knowledge lives.",
        prompt: AUTO_RACE_PROMPTS.race3,
        difficulty: "medium",
        unlocks: ["Shadow Market background", "Coded Scroll collectible"],
        xpReward: 100,
      },
      {
        id: 4,
        title: "The Vault of Names",
        setting:
          "Ancient city records hidden deep below stone halls, where the true names of all Garu have been erased and replaced with numbers.",
        promptDescription:
          "Auto races to restore the true names of Garu to the books of memory, causing the Codex to whisper back to him.",
        prompt: AUTO_RACE_PROMPTS.race4,
        difficulty: "medium",
        unlocks: ["Memory Glow effect", "Book of Names collectible"],
        xpReward: 125,
      },
      {
        id: 5,
        title: "The Geargrave Below",
        setting:
          "The tunnels beneath the market where broken mounts and old tech are discarded in a technological graveyard.",
        promptDescription:
          "Auto builds Echo, his first machine-kin companion made from gears and feathers, who follows him everywhere.",
        prompt: AUTO_RACE_PROMPTS.race5,
        difficulty: "medium",
        unlocks: ["Echo Companion", "Geargrave Map collectible"],
        xpReward: 150,
      },
      {
        id: 6,
        title: "The Firewall Run",
        setting:
          "A chaotic, ever-changing maze of digital barriers created by imperial drones that have hacked the sky.",
        promptDescription:
          "Auto races through a dangerous firewall maze to escape the empire's drones, ultimately saying goodbye to his loyal Ember.",
        prompt: AUTO_RACE_PROMPTS.race6,
        difficulty: "hard",
        unlocks: ["Codebreaker effect", "Ember Memorial item"],
        xpReward: 175,
      },
      {
        id: 7,
        title: "The Arrival of Timaru",
        setting:
          "The edge of the resistance camp at twilight, where a wild Garu with ruffled feathers but fiery eyes has just arrived.",
        promptDescription:
          "Auto meets and names Timaru, a Garu who escaped from the empire's edge, forming a new bond that will define his future.",
        prompt: AUTO_RACE_PROMPTS.race7,
        difficulty: "hard",
        unlocks: ["Timaru Mount", "Bond Formation effect"],
        xpReward: 200,
      },
      {
        id: 8,
        title: "The Ledger of Sparks",
        setting:
          "The secret meeting place of the Hidden Circle, a growing group of resistance riders fighting against the empire.",
        promptDescription:
          "Auto delivers rewritten names to the resistance and earns his place beside his father in the Book of Riders.",
        prompt: AUTO_RACE_PROMPTS.race8,
        difficulty: "hard",
        unlocks: ["Flameglass Coin collectible", "Storm Rider title"],
        xpReward: 225,
      },
      {
        id: 9,
        title: "The Flameborn Flight",
        setting:
          "The dawn of the World Ride, where the sky is red with sunrise and riders gather not just for a race but for a movement.",
        promptDescription:
          "Auto, with Timaru and Echo, launches forward in the World Ride as his red quill glows like a comet and the Codex sings.",
        prompt: AUTO_RACE_PROMPTS.race9,
        difficulty: "extreme",
        unlocks: [
          "Comet Quill legendary item",
          "Codex Singer title",
          "Auto Character unlock",
        ],
        xpReward: 300,
      },
    ],
  },
  matikah: {
    id: "matikah",
    title: "MATIKAH: MOON-BORN SINGER",
    description:
      "A 10-race single-player typing campaign following Matikah's mystical journey as she learns to sing to the stars and bonds with her Garu companion Chalisa.",
    races: [
      {
        id: 0,
        title: "The Singer's Introduction",
        setting:
          "A moonlit grove where Matikah first discovers her connection to the ancient harmony between earth and sky.",
        promptDescription:
          "Matikah introduces herself as the one who sings to stars, explaining her mystical bond with her Garu companion Chalisa.",
        prompt: MATIKAH_RACE_PROMPTS.race0,
        difficulty: "easy",
        unlocks: ["Matikah's Origin Badge", "Moonlit Grove background"],
        xpReward: 25,
      },
      {
        id: 1,
        title: "The Moonlight Run",
        setting:
          "Misty trees under a full moon where leaves sing in the wind and mystical bonds are formed.",
        promptDescription:
          "The mystical bond between rider and Garu is formed under moonlight as Matikah and Chalisa race barefoot through singing trees.",
        prompt: MATIKAH_RACE_PROMPTS.race1,
        difficulty: "easy",
        unlocks: ["Moonlight Bond effect", "Chalisa Mount"],
        xpReward: 50,
      },
      {
        id: 2,
        title: "The Wind Dancers' Trail",
        setting:
          "Dawn-lit cliffs where rare wind-feathers appear during morning gusts, requiring climbing and leaping to collect.",
        promptDescription:
          "Matikah and Chalisa gather mystical wind-feathers to weave into a shimmering sash that becomes her wind-song.",
        prompt: MATIKAH_RACE_PROMPTS.race2,
        difficulty: "easy",
        unlocks: ["Wind-Feather Sash", "Dawn Gust effect"],
        xpReward: 75,
      },
      {
        id: 3,
        title: "The Bazaar of Echoes",
        setting:
          "A hidden forest market with spinning fire-circles where dancers and traders gather among booths and flames.",
        promptDescription:
          "In a mystical market, Matikah trades her sash for ancient scrolls and meets Ayo, learning to race with flame underfoot.",
        prompt: MATIKAH_RACE_PROMPTS.race3,
        difficulty: "medium",
        unlocks: ["Fire Dance ability", "Glowing Flute item"],
        xpReward: 100,
      },
      {
        id: 4,
        title: "The Hollow Archive",
        setting:
          "A flooded temple deep in a swamp where ancient walls whisper forgotten stories of lost riders.",
        promptDescription:
          "Matikah discovers a temple filled with memories, including her mother Iam's voice calling from the walls to 'sing us free.'",
        prompt: MATIKAH_RACE_PROMPTS.race4,
        difficulty: "medium",
        unlocks: ["Memory Echo effect", "Temple Glyph knowledge"],
        xpReward: 125,
      },
      {
        id: 5,
        title: "The Mossroot Maze",
        setting:
          "Ancient trails winding through mossy roots where echo-beasts of stone and code pursue through vines and fog.",
        promptDescription:
          "Chased by mystical creatures, Matikah uses her flute to map secret paths that only moon-riders can follow.",
        prompt: MATIKAH_RACE_PROMPTS.race5,
        difficulty: "hard",
        unlocks: ["Echo-Beast Ward", "Mossroot Map"],
        xpReward: 150,
      },
      {
        id: 6,
        title: "The Spiral Storm",
        setting:
          "A chaotic realm where the sky has cracked open, creating a shifting track of broken songs and twisted gravity.",
        promptDescription:
          "Pulled into the Spiral, Matikah must race inward through chaos, emerging with a melody that balances all things.",
        prompt: MATIKAH_RACE_PROMPTS.race6,
        difficulty: "hard",
        unlocks: ["Chaos Balance spell", "Spiral Memory"],
        xpReward: 175,
      },
      {
        id: 7,
        title: "The Trial of Names",
        setting:
          "The Circle of Feathered Elders where a bridge of names changes based on the rider's heart and family bonds.",
        promptDescription:
          "Matikah faces the elders' trial, riding across a bridge of stories while carrying her family's rhythms within her.",
        prompt: MATIKAH_RACE_PROMPTS.race7,
        difficulty: "hard",
        unlocks: ["Scribe Rider title", "Family Echo ability"],
        xpReward: 200,
      },
      {
        id: 8,
        title: "The Offering of Flight",
        setting:
          "The sacred Codex Flame where treasured creations are offered in exchange for legendary gifts.",
        promptDescription:
          "Matikah sacrifices her wind-feather sash to receive a pearl-quill made from starlight, allowing mid-race spell writing.",
        prompt: MATIKAH_RACE_PROMPTS.race8,
        difficulty: "extreme",
        unlocks: ["Pearl-Quill legendary item", "Starlight Writing"],
        xpReward: 225,
      },
      {
        id: 9,
        title: "The Night of Seven Songs",
        setting:
          "The peak overlooking the World Ride where Matikah's voice guides riders from seven nations across the stars.",
        promptDescription:
          "At the World Ride's peak, Matikah sings rather than races, her voice becoming the wind that carries all riders forward.",
        prompt: MATIKAH_RACE_PROMPTS.race9,
        difficulty: "extreme",
        unlocks: [
          "Seven-Song Voice",
          "Guiding Wind mastery",
          "Matikah Character unlock",
        ],
        xpReward: 300,
      },
    ],
  },
  iam: {
    id: "iam",
    title: "IAM IAM: THE MYSTERY WALKER",
    description:
      "A 10-race single-player typing campaign following the enigmatic Iam as she weaves stories and discovers the threads that connect all tales.",
    races: [
      {
        id: 0,
        title: "The Mystery's Introduction",
        setting:
          "A crossroads between shadow and light where stories are born and memories belong to everyone and no one.",
        promptDescription:
          "Iam introduces herself as both question and answer, the mystery that walks between worlds weaving the threads of all stories.",
        prompt: IAM_RACE_PROMPTS.race0,
        difficulty: "easy",
        unlocks: ["Iam's Origin Badge", "Story Crossroads background"],
        xpReward: 25,
      },
      {
        id: 1,
        title: "The Scrollrunner's Festival",
        setting:
          "Open fields where young scribes race carrying glowing scrolls, each step unlocking a new verse.",
        promptDescription:
          "A young scribe learns to race with words and laughter as her scroll sings and her story dances through the crowd.",
        prompt: IAM_RACE_PROMPTS.race1,
        difficulty: "easy",
        unlocks: ["Glowing Scroll effect", "Feather Tongue ability"],
        xpReward: 50,
      },
    ],
  },
};

// Helper functions for campaign management - now purely for local storage before account creation
export function getCampaignProgress(): Record<string, Campaign> {
  const savedProgress = localStorage.getItem("campaignProgress");
  if (savedProgress) {
    return JSON.parse(savedProgress);
  }
  return CAMPAIGNS;
}

// New function to get progress from database for authenticated users
export async function getDatabaseCampaignProgress(): Promise<Record<string, Campaign>> {
  try {
    const response = await fetch("/api/campaign-progress");
    if (response.ok) {
      const data = await response.json();
      if (data.campaigns) {
        // Convert database format to local format
        const localFormat: Record<string, Campaign> = {};
        
        // Map backend keys to frontend keys
        const backendToFrontendMapping = {
          steve: 'season0',
          auto: 'season1',
          matikah: 'season2',
          iam: 'season3'
        };

        Object.keys(CAMPAIGNS).forEach(frontendKey => {
          const baseCampaign = CAMPAIGNS[frontendKey];
          
          // Find matching backend data
          let dbCampaign = null;
          Object.keys(backendToFrontendMapping).forEach(backendKey => {
            if (backendToFrontendMapping[backendKey as keyof typeof backendToFrontendMapping] === frontendKey) {
              dbCampaign = data.campaigns[backendKey];
            }
          });
          
          if (dbCampaign && baseCampaign) {
            localFormat[frontendKey] = JSON.parse(JSON.stringify(baseCampaign));
            
            // Set campaign-level properties
            localFormat[frontendKey].progress = dbCampaign.progress !== undefined ? dbCampaign.progress : dbCampaign.completed.length;
            localFormat[frontendKey].completed = dbCampaign.completed.length >= baseCampaign.races.length;
            localFormat[frontendKey].unlocked = dbCampaign.unlocked !== undefined ? dbCampaign.unlocked : true;
            
            // Mark individual races as completed based on database data
            localFormat[frontendKey].races.forEach((race, index) => {
              race.completed = dbCampaign.completed.includes(index);
              if (dbCampaign.bestScores && dbCampaign.bestScores[index]) {
                race.bestStats = {
                  wpm: dbCampaign.bestScores[index].wpm,
                  accuracy: dbCampaign.bestScores[index].accuracy,
                  time: dbCampaign.bestScores[index].time,
                  position: dbCampaign.bestScores[index].position,
                  completedAt: new Date()
                };
              }
            });
            
            console.log(`Converted ${frontendKey} campaign: progress=${localFormat[frontendKey].progress}, completed races=[${dbCampaign.completed.join(',')}]`);
          } else {
            localFormat[frontendKey] = JSON.parse(JSON.stringify(baseCampaign));
            localFormat[frontendKey].progress = 0;
            localFormat[frontendKey].completed = false;
            localFormat[frontendKey].races.forEach(race => {
              race.completed = false;
            });
          }
        });
        
        return localFormat;
      }
    }
  } catch (error) {
    console.error("Error fetching database campaign progress:", error);
  }
  
  // Fallback to fresh campaigns
  const fresh: Record<string, Campaign> = {};
  Object.keys(CAMPAIGNS).forEach(campaignKey => {
    fresh[campaignKey] = JSON.parse(JSON.stringify(CAMPAIGNS[campaignKey]));
    fresh[campaignKey].progress = 0;
    fresh[campaignKey].completed = false;
    fresh[campaignKey].races.forEach(race => {
      race.completed = false;
    });
  });
  return fresh;
}

// New function to get campaign progress with proper unlock logic from backend
export async function getCampaignProgressWithUnlocks(): Promise<Record<string, Campaign>> {
  try {
    const response = await fetch("/api/campaign-progress");
    if (response.ok) {
      const data = await response.json();
      if (data.campaigns) {
        // Merge backend unlock data with frontend campaign structure
        const mergedCampaigns = { ...CAMPAIGNS };
        
        // Update unlock status from backend
        Object.keys(data.campaigns).forEach(campaignKey => {
          if (mergedCampaigns[campaignKey] && data.campaigns[campaignKey]) {
            mergedCampaigns[campaignKey] = {
              ...mergedCampaigns[campaignKey],
              unlocked: data.campaigns[campaignKey].unlocked,
              completed: data.campaigns[campaignKey].completed || [],
              bestScores: data.campaigns[campaignKey].bestScores || {}
            };
          }
        });
        
        // Save to localStorage for offline access
        localStorage.setItem("campaignProgress", JSON.stringify(mergedCampaigns));
        return mergedCampaigns;
      }
    }
  } catch (error) {
    console.error("Failed to load campaign progress from backend:", error);
  }
  
  // Fallback to localStorage
  return getCampaignProgress();
}

export function saveCampaignProgress(
  campaigns: Record<string, Campaign>,
): void {
  localStorage.setItem("campaignProgress", JSON.stringify(campaigns));
}

// Automatic save function that handles both authenticated users and guests
export async function autoSaveCampaignProgress(
  campaigns: Record<string, Campaign>,
): Promise<{ saved: boolean; isGuest: boolean }> {
  // Always save to localStorage first
  saveCampaignProgress(campaigns);
  
  try {
    // Convert frontend format to backend format for database
    const backendFormat = {
      steve: convertCampaignToBackendFormat(campaigns.season0),
      auto: convertCampaignToBackendFormat(campaigns.season1),
      matikah: convertCampaignToBackendFormat(campaigns.season2),
      iam: convertCampaignToBackendFormat(campaigns.season3)
    };

    // Check if user is authenticated by trying to save to backend
    const response = await fetch("/api/campaign-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ campaigns: backendFormat }),
    });

    if (response.ok) {
      return { saved: true, isGuest: false };
    } else if (response.status === 401) {
      // User is not authenticated - guest user
      return { saved: true, isGuest: true };
    } else {
      // Some other error occurred
      return { saved: false, isGuest: false };
    }
  } catch (error) {
    console.error("Failed to save campaign progress to profile:", error);
    // Still saved locally, might be guest user
    return { saved: true, isGuest: true };
  }
}

// Helper function to convert frontend campaign format to backend format
function convertCampaignToBackendFormat(campaign: Campaign | undefined) {
  if (!campaign) {
    return { unlocked: false, completed: [], bestScores: {} };
  }

  const completed = campaign.races
    .map((race, index) => race.completed ? index : -1)
    .filter(index => index !== -1);

  const bestScores: Record<number, any> = {};
  campaign.races.forEach((race, index) => {
    if (race.bestStats) {
      bestScores[index] = {
        wpm: race.bestStats.wpm,
        accuracy: race.bestStats.accuracy,
        time: race.bestStats.time,
        position: race.bestStats.position
      };
    }
  });

  return {
    unlocked: campaign.progress > 0 || completed.length > 0,
    completed,
    bestScores
  };
}

// Function to migrate local progress when user creates account
export async function migrateLocalProgressToAccount(): Promise<boolean> {
  try {
    const localProgress = getCampaignProgress();
    const response = await fetch("/api/campaign-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ campaigns: localProgress }),
    });
    
    return response.ok;
  } catch (error) {
    console.error("Failed to migrate local progress to account:", error);
    return false;
  }
}

export async function loadCampaignProgressFromProfile(): Promise<
  Record<string, Campaign>
> {
  try {
    const response = await fetch("/api/campaign-progress");
    if (response.ok) {
      const data = await response.json();
      if (data.campaigns) {
        // Save to localStorage as well
        localStorage.setItem(
          "campaignProgress",
          JSON.stringify(data.campaigns),
        );
        return data.campaigns;
      }
    }
  } catch (error) {
    console.error("Failed to load campaign progress from profile:", error);
  }

  // Fallback to localStorage or default campaigns
  return getCampaignProgress();
}

// Function to migrate local storage progress to database (for new users)
export async function migrateGuestProgressToDatabase(): Promise<void> {
  const guestProgress = localStorage.getItem("campaignProgress");
  if (guestProgress) {
    try {
      const campaigns = JSON.parse(guestProgress);
      await saveProgressToDatabase(campaigns);
      // Clear local storage after successful migration
      localStorage.removeItem("campaignProgress");
    } catch (error) {
      console.error("Failed to migrate guest progress:", error);
    }
  }
}

// Save progress directly to database (for authenticated users)
async function saveProgressToDatabase(campaigns: Record<string, Campaign>): Promise<void> {
  const formattedProgress = {
    steve: { 
      completed: campaigns.season0?.races?.filter(r => r.completed).map((_, i) => i) || [],
      bestScores: {} as Record<number, any>,
      unlocked: true
    },
    auto: { 
      completed: campaigns.season1?.races?.filter(r => r.completed).map((_, i) => i) || [],
      bestScores: {} as Record<number, any>,
      unlocked: (campaigns.season1?.progress || 0) > 0
    },
    matikah: { 
      completed: campaigns.season2?.races?.filter(r => r.completed).map((_, i) => i) || [],
      bestScores: {} as Record<number, any>,
      unlocked: (campaigns.season2?.progress || 0) > 0
    },
    iam: { 
      completed: campaigns.season3?.races?.filter(r => r.completed).map((_, i) => i) || [],
      bestScores: {} as Record<number, any>,
      unlocked: (campaigns.season3?.progress || 0) > 0
    }
  };

  // Add best scores - map frontend keys to backend keys
  const keyMapping = {
    season0: 'steve',
    season1: 'auto', 
    season2: 'matikah',
    season3: 'iam'
  };

  Object.keys(campaigns).forEach(campaignKey => {
    const campaign = campaigns[campaignKey];
    const backendKey = keyMapping[campaignKey as keyof typeof keyMapping];
    
    if (campaign?.races && backendKey && formattedProgress[backendKey as keyof typeof formattedProgress]) {
      campaign.races.forEach((race, index) => {
        if (race.bestStats) {
          formattedProgress[backendKey as keyof typeof formattedProgress].bestScores[index] = {
            wpm: race.bestStats.wpm,
            accuracy: race.bestStats.accuracy,
            time: race.bestStats.time,
            position: race.bestStats.position
          };
        }
      });
    }
  });

  await fetch("/api/campaign-progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ campaigns: formattedProgress }),
  });
}

// New save function - save current progress to database
export async function saveGameToProfile(): Promise<{ success: boolean; message: string }> {
  try {
    // For authenticated users, get progress from database, not localStorage
    const campaigns = await getDatabaseCampaignProgress();
    await saveProgressToDatabase(campaigns);
    
    return {
      success: true,
      message: "Campaign progress saved successfully!"
    };
  } catch (error) {
    console.error("Save game error:", error);
    return {
      success: false,
      message: "Error saving progress. Please try again."
    };
  }
}

// New load function - reload progress from database
export async function loadGameFromProfile(): Promise<{ success: boolean; message: string }> {
  try {
    // Simply fetch fresh data from database
    await getDatabaseCampaignProgress();
    
    return {
      success: true,
      message: "Campaign progress reloaded from database!"
    };
  } catch (error) {
    console.error("Load game error:", error);
    return {
      success: false,
      message: "Error loading progress. Please try again."
    };
  }
}

export async function markRaceCompleted(
  campaignId: string,
  raceId: number,
  stats: {
    wpm: number;
    accuracy: number;
    time: number;
    position: number;
    xpGained: number;
  },
): Promise<void> {
  const campaigns = getCampaignProgress();
  const campaign = campaigns[campaignId];

  if (campaign) {
    const raceIndex = campaign.races.findIndex((race) => race.id === raceId);
    if (raceIndex !== -1) {
      const race = campaign.races[raceIndex];

      // Mark race as completed
      race.completed = true;

      // Update best stats if this is a new best score
      if (
        !race.bestStats ||
        stats.wpm > race.bestStats.wpm ||
        (stats.wpm === race.bestStats.wpm &&
          stats.accuracy > race.bestStats.accuracy)
      ) {
        race.bestStats = {
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          time: stats.time,
          position: stats.position,
          completedAt: new Date(),
        };
      }

      // Only unlock next race if player finished in top 3 (position 1, 2, or 3)
      if (stats.position <= 3 && raceIndex < campaign.races.length - 1) {
        campaign.progress = raceIndex + 1;
      } else if (raceIndex === campaign.races.length - 1) {
        campaign.completed = true;
      }

      campaigns[campaignId] = campaign;

      // Save to both localStorage and profile using autosave
      await autoSaveCampaignProgress(campaigns);
    }
  }
}

// Function to check if a race is unlocked - now async to handle database reads
export async function isRaceUnlockedAsync(campaignId: string, raceId: number): Promise<boolean> {
  // Try to get the most current campaign data
  let campaigns;
  try {
    // Check if user is authenticated by trying to get database progress
    const response = await fetch('/api/campaign-progress');
    if (response.ok) {
      const data = await response.json();
      campaigns = await getDatabaseCampaignProgress();
    } else {
      campaigns = getCampaignProgress();
    }
  } catch (error) {
    campaigns = getCampaignProgress();
  }
  
  const campaign = campaigns[campaignId];
  
  if (!campaign) return false;
  
  // Race 0 is always unlocked for Steve campaign
  if (campaignId === 'season0' && raceId === 0) return true;
  
  // For other campaigns, they're locked until Steve has 3 completed races
  if (campaignId !== 'season0') {
    const steveCampaign = campaigns['season0'];
    if (!steveCampaign) return false;
    
    const steveCompletedRaces = steveCampaign.races.filter(race => race.completed).length;
    if (steveCompletedRaces < 3) return false;
  }
  
  // Check if previous race is completed with top 3 finish
  if (raceId === 0) return true; // First race is always unlocked
  
  const previousRace = campaign.races[raceId - 1];
  return !!(previousRace && previousRace.completed && previousRace.bestStats && previousRace.bestStats.position <= 3);
}

// Legacy synchronous function for backward compatibility
export function isRaceUnlocked(campaignId: string, raceId: number): boolean {
  const campaigns = getCampaignProgress();
  const campaign = campaigns[campaignId];
  
  if (!campaign) return false;
  
  // Race 0 is always unlocked for Steve campaign
  if (campaignId === 'season0' && raceId === 0) return true;
  
  // For other campaigns, they're locked until Steve has 3 completed races
  if (campaignId !== 'season0') {
    const steveCampaign = campaigns['season0'];
    if (!steveCampaign) return false;
    
    const steveCompletedRaces = steveCampaign.races.filter(race => race.completed).length;
    if (steveCompletedRaces < 3) return false;
  }
  
  // Check if previous race is completed with top 3 finish
  if (raceId === 0) return true; // First race is always unlocked
  
  const previousRace = campaign.races[raceId - 1];
  return !!(previousRace && previousRace.completed && previousRace.bestStats && previousRace.bestStats.position <= 3);
}

// Function to check if a campaign is unlocked
export function isCampaignUnlocked(campaignId: string): boolean {
  if (campaignId === 'season0') return true; // Steve's campaign is always unlocked
  
  const campaigns = getCampaignProgress();
  const steveCampaign = campaigns['season0'];
  
  if (!steveCampaign) return false;
  
  const steveCompletedRaces = steveCampaign.races.filter(race => race.completed).length;
  return steveCompletedRaces >= 3;
}

export function getCampaignRaceByID(
  campaignId: string,
  raceId: number,
): CampaignRace | null {
  const campaigns = getCampaignProgress();
  const campaign = campaigns[campaignId];

  if (campaign) {
    return campaign.races.find((r) => r.id === raceId) || null;
  }

  return null;
}

export function getCurrentCampaignRace(
  campaignId: string,
): CampaignRace | null {
  const campaigns = getCampaignProgress();
  const campaign = campaigns[campaignId];

  if (campaign) {
    const progressIndex = campaign.progress || 0;
    if (progressIndex < campaign.races.length) {
      return campaign.races[progressIndex];
    }
  }

  return null;
}

export function initializeCampaignIfNeeded(): void {
  const savedProgress = localStorage.getItem("campaignProgress");
  if (!savedProgress) {
    // First time setup - deep clone the campaigns to avoid reference issues
    const initialCampaigns = JSON.parse(JSON.stringify(CAMPAIGNS));

    // Set initial progress for each campaign
    Object.values(initialCampaigns).forEach((campaignObj: unknown) => {
      const campaign = campaignObj as Campaign;
      campaign.progress = 0;
      campaign.completed = false;
      campaign.races.forEach((race) => {
        race.completed = false;
      });
    });

    saveCampaignProgress(initialCampaigns);
  }
}

// Initialize campaign data when this module loads
initializeCampaignIfNeeded();
