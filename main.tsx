import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  Play, Pause, RotateCcw, TreePine, Sparkles, CheckCircle2, Trash2, Trophy,
  UserCheck, Users, Clock, Music, Feather, ShoppingBag, ChevronRight
} from 'lucide-react';

type Distraction = { id: number; text: string; time: string };
type ForestTree = { id: string; speciesId: string; name: string; icon: string; date: string; duration: number };
type AmbientSound = 'none' | 'rain' | 'forest' | 'drone';
type CricketPlayer = {
  id: string;
  name: string;
  role: string;
  tier: string;
  cost: number;
  rating: number;
  country: string;
  avatar: string;
  stats: { bat: number; bowl: number; field: number };
};

function readStoredValue<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null) return fallback;
    const value: unknown = JSON.parse(stored);
    return isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isDistractionArray(value: unknown): value is Distraction[] {
  return Array.isArray(value) && value.every((item) =>
    item !== null &&
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.text === 'string' &&
    typeof item.time === 'string',
  );
}

function isForestArray(value: unknown): value is ForestTree[] {
  return Array.isArray(value) && value.every((item) =>
    item !== null &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.speciesId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.icon === 'string' &&
    typeof item.date === 'string' &&
    typeof item.duration === 'number',
  );
}

// --- INITIAL DATA & SEEDS ---
const FEATURED_PLAYERS: CricketPlayer[] = [
  { id: 'p1', name: 'Virat Kohli', role: 'Batter', tier: 'Legendary', cost: 300, rating: 96, country: 'IND', avatar: '🏏', stats: { bat: 98, bowl: 30, field: 92 } },
  { id: 'p2', name: 'Jasprit Bumrah', role: 'Bowler', tier: 'Legendary', cost: 300, rating: 97, country: 'IND', avatar: '⚡', stats: { bat: 25, bowl: 99, field: 88 } },
  { id: 'p3', name: 'Ben Stokes', role: 'All-Rounder', tier: 'Legendary', cost: 280, rating: 94, country: 'ENG', avatar: '🦁', stats: { bat: 92, bowl: 89, field: 91 } },
  { id: 'p4', name: 'Steve Smith', role: 'Batter', tier: 'World Class', cost: 220, rating: 92, country: 'AUS', avatar: '👑', stats: { bat: 95, bowl: 40, field: 90 } },
  { id: 'p5', name: 'Travis Head', role: 'Batter', tier: 'World Class', cost: 210, rating: 91, country: 'AUS', avatar: '🔥', stats: { bat: 93, bowl: 55, field: 86 } },
  { id: 'p6', name: 'Rashid Khan', role: 'Bowler', tier: 'World Class', cost: 220, rating: 93, country: 'AFG', avatar: '🌀', stats: { bat: 68, bowl: 95, field: 89 } },
  { id: 'p7', name: 'AB de Villiers', role: 'Wicket-Keeper', tier: 'Legendary', cost: 300, rating: 96, country: 'SA', avatar: '🚀', stats: { bat: 97, bowl: 20, field: 96 } },
  { id: 'p8', name: 'Kane Williamson', role: 'Batter', tier: 'World Class', cost: 200, rating: 90, country: 'NZ', avatar: '🎯', stats: { bat: 92, bowl: 35, field: 88 } },
  { id: 'p9', name: 'Mitchell Starc', role: 'Bowler', tier: 'World Class', cost: 210, rating: 91, country: 'AUS', avatar: '🏹', stats: { bat: 45, bowl: 93, field: 82 } },
  { id: 'p10', name: 'Hardik Pandya', role: 'All-Rounder', tier: 'Star', cost: 150, rating: 88, country: 'IND', avatar: '⚡', stats: { bat: 86, bowl: 84, field: 87 } },
  { id: 'p11', name: 'Jos Buttler', role: 'Wicket-Keeper', tier: 'World Class', cost: 230, rating: 92, country: 'ENG', avatar: '🧤', stats: { bat: 93, bowl: 10, field: 90 } },
  { id: 'p12', name: 'Trent Boult', role: 'Bowler', tier: 'Star', cost: 140, rating: 87, country: 'NZ', avatar: '❄️', stats: { bat: 30, bowl: 89, field: 84 } },
  { id: 'p13', name: 'Shakib Al Hasan', role: 'All-Rounder', tier: 'Star', cost: 130, rating: 86, country: 'BAN', avatar: '🐅', stats: { bat: 84, bowl: 86, field: 80 } },
  { id: 'p14', name: 'Rishabh Pant', role: 'Wicket-Keeper', tier: 'Star', cost: 160, rating: 89, country: 'IND', avatar: '💥', stats: { bat: 90, bowl: 10, field: 88 } },
  { id: 'p15', name: 'Kagiso Rabada', role: 'Bowler', tier: 'Star', cost: 150, rating: 88, country: 'SA', avatar: '🐆', stats: { bat: 35, bowl: 90, field: 85 } }
];

const ADDITIONAL_PLAYER_NAMES = [
  'Rohit Sharma', 'KL Rahul', 'Jacob Duffy', 'K Pollard', 'Stokes', 'V Sooryawanshi',
  'K Perara', 'V Kohli', 'Will Jacks', 'Mulder', 'Shakib', 'Billings', 'Maharaj',
  'Milne', 'Starc', 'J Seales', 'Jaiswal', 'I Kishan', 'King', 'Bethell', 'M Owen',
  'J Holder', 'Jadeja', 'Jamieson', 'A Rashid', 'J Bumrah', 'J Hazlewood', 'Rohit S',
  'T Siefert', 'M Marsh', 'Tilak', 'Inglis', 'Brevis', 'N Dhir', 'Nortje', 'Y Chahal',
  'Rabada', 'Arshdeep S', 'Gill S', 'Markram', 'J Root', 'R Pant', 'Hardik P', 'Reddy',
  'Axar Patel', 'Romario', 'Theekshana', 'J Archer', 'Shami', 'Sai Sudarshan',
  'Duckett', 'S Samson', 'C Green', 'Pooran', 'Miller', 'M Ali', 'Curran', 'Ferguson',
  'Zampa', 'Cummins', 'Rickleton', 'R Gurbaz', 'Patidar', 'Webster', 'S Dube', 'Omarzai',
  'G Linde', 'Ghazanfar', 'S Joseph', 'Wood', 'Will Young', 'T Head', 'M Labuschagne',
  'S Iyer', 'Gulbadin N', 'Jack Edwards', 'Wellage', 'A Hosein', 'S Thakur', 'K Pandya',
  'H Rana', 'Bairstow', 'De Kock', 'Surya', 'Conolly', 'Kamindu', 'Shanaka', 'Neesham',
  'Santner', 'Walsh Jr', 'P Krishna', 'Pathirana', 'D Jurel', 'C Asalanka', 'T Banton',
  'Jason Barendoff', 'Nabi', 'M Jansen', 'J Duffy', 'M Bretzke', 'Brook', 'Hardie',
  'Hasaranga', 'Bavuma', 'M Rehman', 'Livingstone', 'Stubbs', 'Prince Y', 'G Motie',
  'Ben Dwarshius', 'Siraj', 'Kuldeep Y', 'Coetzee', 'Rachin R', 'Mat Renshaw', 'A Turner',
  'Burger', 'Noor Ahmed', 'Chase', 'Will O Rouke', 'B Carse', 'T Natarajan', 'Buttler',
  'D Chameera', 'Hope', 'J Overton', 'Bracewell', 'Philip', 'Alex C', 'R Powell', 'Varun C',
  'Rashid K'
];

const PLAYER_NAME_ALIASES: Record<string, string> = {
  'stokes': 'ben stokes',
  'v kohli': 'virat kohli',
  'shakib': 'shakib al hasan',
  'starc': 'mitchell starc',
  'rabada': 'kagiso rabada',
  'hardik p': 'hardik pandya',
  'r pant': 'rishabh pant',
  't head': 'travis head',
  'buttler': 'jos buttler',
  'rashid k': 'rashid khan',
  'j bumrah': 'jasprit bumrah',
  'j duffy': 'jacob duffy',
  'rohit s': 'rohit sharma',
  'k pollard': 'kieron pollard',
  'k perara': 'kusal perera',
  'v sooryawanshi': 'vaibhav sooryavanshi',
  'mulder': 'wiaan mulder',
  'maharaj': 'keshav maharaj',
  'j seales': 'jayden seales',
  'jaiswal': 'yashasvi jaiswal',
  'i kishan': 'ishan kishan',
  'king': 'brandon king',
  'milne': 'adam milne',
  'webster': 'beau webster',
  'bethell': 'jacob bethell',
  'm owen': 'mitchell owen',
  'j holder': 'jason holder',
  'jadeja': 'ravindra jadeja',
  'jamieson': 'kyle jamieson',
  'a rashid': 'adil rashid',
  'j hazlewood': 'josh hazlewood',
  't siefert': 'tim seifert',
  'm marsh': 'mitchell marsh',
  'tilak': 'tilak varma',
  'inglis': 'josh inglis',
  'brevis': 'dewald brevis',
  'nortje': 'anrich nortje',
  'y chahal': 'yuzvendra chahal',
  'arshdeep s': 'arshdeep singh',
  'gill s': 'shubman gill',
  'markram': 'aiden markram',
  'j root': 'joe root',
  'reddy': 'nitish kumar reddy',
  'c green': 'cameron green',
  'miller': 'david miller',
  'curran': 'sam curran',
  'ferguson': 'lockie ferguson',
  'zampa': 'adam zampa',
  'romario': 'romario shepherd',
  'theekshana': 'maheesh theekshana',
  'j archer': 'jofra archer',
  'shami': 'mohammed shami',
  'duckett': 'ben duckett',
  's samson': 'sanju samson',
  'poor an': 'nicholas pooran',
  'pooran': 'nicholas pooran',
  'm ali': 'moeen ali',
  'cummins': 'pat cummins',
  'rickleton': 'ryan rickelton',
  'r gurbaz': 'rahmanullah gurbaz',
  'n dhir': 'naman dhir',
  'patidar': 'rajat patidar',
  's dube': 'shivam dube',
  'omarzai': 'azmatullah omarzai',
  'g linde': 'george linde',
  'ghazanfar': 'allah ghazanfar',
  's joseph': 'shamar joseph',
  'wood': 'mark wood',
  'm labuschagne': 'marnus labuschagne',
  's iyer': 'shreyas iyer',
  'gulbadin n': 'gulbadin naib',
  'wellage': 'dunith wellalage',
  'a hosein': 'akeal hosein',
  's thakur': 'shardul thakur',
  'k pandya': 'krunal pandya',
  'h rana': 'harshit rana',
  'bairstow': 'jonny bairstow',
  'de kock': 'quinton de kock',
  'surya': 'suryakumar yadav',
  'conolly': 'cooper connolly',
  'kamindu': 'kamindu mendis',
  'shanaka': 'dasun shanaka',
  'ne esham': 'jimmy neesham',
  'neesham': 'jimmy neesham',
  'santner': 'mitchell santner',
  'walsh jr': 'hayden walsh jr',
  'p krishna': 'prasidh krishna',
  'pathirana': 'matheesha pathirana',
  'd jurel': 'dhruv jurel',
  'c asalanka': 'charith asalanka',
  't banton': 'tom banton',
  'jason barendoff': 'jason behrendorff',
  'nabi': 'mohammad nabi',
  'm jansen': 'marco jansen',
  'm bretzke': 'matthew breetzke',
  'brook': 'harry brook',
  'hardie': 'aaron hardie',
  'hasaranga': 'wanindu hasaranga',
  'bavuma': 'temba bavuma',
  'm rehman': 'mustafizur rahman',
  'livingstone': 'liam livingstone',
  'stubbs': 'tristan stubbs',
  'g motie': 'gudakesh motie',
  'ben dwarshius': 'ben dwarshuis',
  'siraj': 'mohammed siraj',
  'kuldeep y': 'kuldeep yadav',
  'coetzee': 'gerald coetzee',
  'rachin r': 'rachin ravindra',
  'mat renshaw': 'matt renshaw',
  'a turner': 'ashton turner',
  'burger': 'nandre burger',
  'noor ahmed': 'noor ahmad',
  'chase': 'roston chase',
  'will o rouke': 'will o rourke',
  'b carse': 'brydon carse',
  't natrajan': 't natarajan',
  't natarajan': 't natarajan',
  'd chameera': 'dushmantha chameera',
  'hope': 'shai hope',
  'j overton': 'jamie overton',
  'bracewell': 'michael bracewell',
  'billings': 'sam billings',
  'philip': 'phil salt',
  'alex c': 'alex carey',
  'r powell': 'rovman powell',
  'varun c': 'varun chakravarthy'
};

const normalizePlayerName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ');
const slugifyPlayerName = (name: string) =>
  name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const knownPlayerNames = new Set(FEATURED_PLAYERS.map((player) => normalizePlayerName(player.name)));
const seenPlayerNames = new Set(knownPlayerNames);

type PlayerMarketValue = Pick<CricketPlayer, 'tier' | 'cost' | 'rating'>;
const PLAYER_MARKET_VALUES: Record<string, PlayerMarketValue> = {};

const setPlayerTier = (tier: string, cost: number, rating: number, names: string[]) => {
  for (const name of names) {
    PLAYER_MARKET_VALUES[name] = { tier, cost, rating };
  }
};

setPlayerTier('Legendary', 300, 95, [
  'rohit sharma', 'ravindra jadeja', 'pat cummins', 'suryakumar yadav'
]);
setPlayerTier('World Class', 220, 92, [
  'yashasvi jaiswal', 'shubman gill', 'joe root', 'josh hazlewood',
  'jofra archer', 'nicholas pooran', 'harry brook', 'kuldeep yadav',
  'rachin ravindra', 'kl rahul', 'mitchell marsh', 'adil rashid',
  'mohammed shami', 'aiden markram', 'cameron green', 'david miller',
  'sam curran', 'adam zampa', 'wanindu hasaranga', 'quinton de kock',
  'liam livingstone', 'tristan stubbs', 'mohammed siraj', 'lockie ferguson',
  'shreyas iyer', 'kamindu mendis'
]);
setPlayerTier('Star', 150, 88, [
  'jacob duffy', 'ishan kishan', 'jason holder', 'tilak varma', 'josh inglis',
  'arshdeep singh', 'axar patel', 'mitchell santner', 'matheesha pathirana',
  'noor ahmad', 'varun chakravarthy', 'will jacks', 'kieron pollard',
  'kusal perera', 'jayden seales', 'brandon king', 'jacob bethell',
  'mitchell owen', 'kyle jamieson', 'tim seifert',   'dewald brevis',
  'anrich nortje', 'yuzvendra chahal', 'sai sudarshan', 'sanju samson',
  'naman dhir', 'nitish kumar reddy', 'romario shepherd', 'maheesh theekshana',
  'ben duckett', 'moeen ali', 'ryan rickelton', 'rahmanullah gurbaz',
  'rajat patidar', 'beau webster', 'shivam dube', 'azmatullah omarzai',
  'george linde', 'shamar joseph', 'mark wood', 'will young',
  'marnus labuschagne', 'gulbadin naib', 'dunith wellalage', 'akeal hosein',
  'shardul thakur', 'krunal pandya', 'harshit rana', 'jonny bairstow',
  'dasun shanaka', 'jimmy neesham', 'hayden walsh jr', 'prasidh krishna',
  'dhruv jurel', 'charith asalanka', 'tom banton', 'jason behrendorff',
  'mohammad nabi', 'marco jansen', 'matthew breetzke', 'aaron hardie',
  'temba bavuma', 'mustafizur rahman', 'gudakesh motie', 'ben dwarshuis',
  'gerald coetzee', 'matt renshaw', 'ashton turner', 'nandre burger',
  'roston chase', 'will o rourke', 'brydon carse', 't natarajan',
  'dushmantha chameera', 'shai hope', 'jamie overton', 'michael bracewell',
  'phil salt', 'alex carey', 'rovman powell', 'cooper connolly',
  'wiaan mulder', 'sam billings', 'keshav maharaj', 'adam milne'
]);
setPlayerTier('Emerging', 120, 82, [
  'vaibhav sooryavanshi', 'allah ghazanfar', 'jack edwards'
]);

const PLAYER_DISPLAY_NAMES: Record<string, string> = {
  'rohit sharma': 'Rohit Sharma',
  'kl rahul': 'KL Rahul',
  'kieron pollard': 'Kieron Pollard',
  'kusal perera': 'Kusal Perera',
  'vaibhav sooryavanshi': 'Vaibhav Sooryavanshi',
  'yashasvi jaiswal': 'Yashasvi Jaiswal',
  'ishan kishan': 'Ishan Kishan',
  'josh hazlewood': 'Josh Hazlewood',
  'tim seifert': 'Tim Seifert',
  'shubman gill': 'Shubman Gill',
  'sai sudarshan': 'Sai Sudarshan',
  'pat cummins': 'Pat Cummins',
  'ryan rickelton': 'Ryan Rickelton',
  'rahmanullah gurbaz': 'Rahmanullah Gurbaz',
  'nitish kumar reddy': 'Nitish Kumar Reddy',
  'maheesh theekshana': 'Maheesh Theekshana',
  'marnus labuschagne': 'Marnus Labuschagne',
  'gulbadin naib': 'Gulbadin Naib',
  'dunith wellalage': 'Dunith Wellalage',
  'jonny bairstow': 'Jonny Bairstow',
  'quinton de kock': 'Quinton de Kock',
  'suryakumar yadav': 'Suryakumar Yadav',
  'kamindu mendis': 'Kamindu Mendis',
  'dasun shanaka': 'Dasun Shanaka',
  'jimmy neesham': 'Jimmy Neesham',
  'hayden walsh jr': 'Hayden Walsh Jr.',
  'prasidh krishna': 'Prasidh Krishna',
  'matheesha pathirana': 'Matheesha Pathirana',
  'dhruv jurel': 'Dhruv Jurel',
  'charith asalanka': 'Charith Asalanka',
  'tom banton': 'Tom Banton',
  'jason behrendorff': 'Jason Behrendorff',
  'mohammad nabi': 'Mohammad Nabi',
  'marco jansen': 'Marco Jansen',
  'matthew breetzke': 'Matthew Breetzke',
  'harry brook': 'Harry Brook',
  'aaron hardie': 'Aaron Hardie',
  'wanindu hasaranga': 'Wanindu Hasaranga',
  'mustafizur rahman': 'Mustafizur Rahman',
  'liam livingstone': 'Liam Livingstone',
  'tristan stubbs': 'Tristan Stubbs',
  'gudakesh motie': 'Gudakesh Motie',
  'ben dwarshuis': 'Ben Dwarshuis',
  'kuldeep yadav': 'Kuldeep Yadav',
  'gerald coetzee': 'Gerald Coetzee',
  'rachin ravindra': 'Rachin Ravindra',
  'matt renshaw': 'Matt Renshaw',
  'ashton turner': 'Ashton Turner',
  'nandre burger': 'Nandre Burger',
  'noor ahmad': 'Noor Ahmad',
  'roston chase': 'Roston Chase',
  'will o rourke': 'Will O’Rourke',
  'brydon carse': 'Brydon Carse',
  't natarajan': 'T. Natarajan',
  'dushmantha chameera': 'Dushmantha Chameera',
  'shai hope': 'Shai Hope',
  'jamie overton': 'Jamie Overton',
  'michael bracewell': 'Michael Bracewell',
  'phil salt': 'Phil Salt',
  'alex carey': 'Alex Carey',
  'rovman powell': 'Rovman Powell',
  'cooper connolly': 'Cooper Connolly',
  'wiaan mulder': 'Wiaan Mulder',
  'sam billings': 'Sam Billings',
  'keshav maharaj': 'Keshav Maharaj',
  'adam milne': 'Adam Milne',
  'jacob bethell': 'Jacob Bethell',
  'mitchell owen': 'Mitchell Owen',
  'beau webster': 'Beau Webster',
  'will jacks': 'Will Jacks'
};

const ADDITIONAL_PLAYERS: CricketPlayer[] = ADDITIONAL_PLAYER_NAMES.flatMap((name) => {
  const normalizedName = normalizePlayerName(name);
  const canonicalName = PLAYER_NAME_ALIASES[normalizedName] ?? normalizedName;
  if (seenPlayerNames.has(canonicalName)) return [];
  seenPlayerNames.add(canonicalName);

  const displayName = PLAYER_DISPLAY_NAMES[canonicalName] ??
    (canonicalName !== normalizedName
      ? canonicalName.replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
      : name.replace(/\b[a-z]/g, (letter) => letter.toUpperCase()));
  const marketValue = PLAYER_MARKET_VALUES[canonicalName] ?? {
    tier: 'Needs review',
    cost: 100,
    rating: 75
  };

  return [{
    id: `player-${slugifyPlayerName(canonicalName)}`,
    name: displayName,
    role: marketValue.tier === 'Needs review' ? 'Needs identification' : 'Unassigned',
    ...marketValue,
    country: '—',
    avatar: '🏏',
    stats: { bat: marketValue.rating, bowl: marketValue.rating, field: marketValue.rating }
  }];
});

const CRICKET_PLAYERS = [...FEATURED_PLAYERS, ...ADDITIONAL_PLAYERS];
const POINTS_PER_HOUR = 40;
const pointsForSession = (minutes: number) => Math.round((minutes / 60) * POINTS_PER_HOUR);

const TREE_SPECIES = [
  { id: 'oak', name: 'Green Oak', cost: 0, growthTime: 25, icon: '🌳', color: 'text-emerald-400', desc: 'Sturdy & timeless focus tree' },
  { id: 'pine', name: 'Alpine Pine', cost: 50, growthTime: 30, icon: '🌲', color: 'text-teal-400', desc: 'Thrives under cold, quiet focus' },
  { id: 'sakura', name: 'Cherry Sakura', cost: 120, growthTime: 45, icon: '🌸', color: 'text-pink-400', desc: 'Blooms into brilliant focus petals' },
  { id: 'banyan', name: 'Golden Banyan', cost: 250, growthTime: 60, icon: '🌴', color: 'text-amber-400', desc: 'Legendary tree of deep wisdom' }
];

type TreeSpecies = (typeof TREE_SPECIES)[number];

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'timer' | 'auction' | 'squad' | 'forest'>('timer');
  const [points, setPoints] = useState(() => {
    const stored = window.localStorage.getItem('cf_points');
    const parsed = stored === null ? 150 : Number.parseInt(stored, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 150;
  });

  // Timer State
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTreeSpecies, setSelectedTreeSpecies] = useState('oak');

  // Distractions
  const [distractions, setDistractions] = useState<Distraction[]>(() =>
    readStoredValue('cf_distractions', [], isDistractionArray),
  );
  const [distractionInput, setDistractionInput] = useState('');
  const [showParkingLot, setShowParkingLot] = useState(false);

  // Cricket State
  const [unlockedPlayers, setUnlockedPlayers] = useState<string[]>(() =>
    readStoredValue('cf_unlocked_players', ['p10'], isStringArray),
  );
  const [playingXI, setPlayingXI] = useState<string[]>(() =>
    readStoredValue('cf_playing_xi', ['p10'], isStringArray),
  );

  // Forest State
  const [unlockedTrees, setUnlockedTrees] = useState<string[]>(() =>
    readStoredValue('cf_unlocked_trees', ['oak'], isStringArray),
  );
  const [forestGrid, setForestGrid] = useState<ForestTree[]>(() =>
    readStoredValue('cf_forest_grid', [], isForestArray),
  );

  // Audio Ambient State
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');
  const [audioError, setAudioError] = useState('');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('cf_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('cf_unlocked_players', JSON.stringify(unlockedPlayers));
  }, [unlockedPlayers]);

  useEffect(() => {
    localStorage.setItem('cf_playing_xi', JSON.stringify(playingXI));
  }, [playingXI]);

  useEffect(() => {
    localStorage.setItem('cf_unlocked_trees', JSON.stringify(unlockedTrees));
  }, [unlockedTrees]);

  useEffect(() => {
    localStorage.setItem('cf_forest_grid', JSON.stringify(forestGrid));
  }, [forestGrid]);

  useEffect(() => {
    localStorage.setItem('cf_distractions', JSON.stringify(distractions));
  }, [distractions]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleSessionComplete();
    }
    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Handle Session Completion
  const handleSessionComplete = () => {
    const earned = pointsForSession(durationMinutes);
    setPoints((prev) => prev + earned);

    // Add tree to forest grid
    const treeObj = TREE_SPECIES.find((t) => t.id === selectedTreeSpecies) || TREE_SPECIES[0];
    const newForestItem = {
      id: Date.now().toString(),
      speciesId: treeObj.id,
      name: treeObj.name,
      icon: treeObj.icon,
      date: new Date().toLocaleDateString(),
      duration: durationMinutes
    };
    setForestGrid((prev) => [newForestItem, ...prev]);

    // Play victory sound
    playCompletionSound();
  };

  const handlePresetSelect = (mins: number) => {
    setDurationMinutes(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    if (timeLeft === 0) return;
    setIsRunning((running) => !running);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60);
  };

  // Web Audio Synth for Ambient Sounds
  const handleAmbientToggle = (soundType: Exclude<AmbientSound, 'none'>) => {
    if (ambientSound === soundType) {
      setAmbientSound('none');
      stopAudio();
    } else {
      playAudio(soundType);
    }
  };

  const stopAudio = () => {
    const source = soundNodeRef.current;
    soundNodeRef.current = null;
    if (source) {
      source.stop();
      source.disconnect();
    }
  };

  const reportAudioError = (error: unknown) => {
    console.error('Unable to play focus audio:', error);
    setAudioError('Audio could not be played. Check your browser audio settings and try again.');
  };

  const playAudio = (type: Exclude<AmbientSound, 'none'>) => {
    try {
      stopAudio();
      const ctx = audioCtxRef.current ?? new AudioContext();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        void ctx.resume().catch(reportAudioError);
      }

      // White/Pink noise generation for rain/lofi ambience
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        gain.gain.value = 0.15;
      } else if (type === 'forest') {
        filter.type = 'bandpass';
        filter.frequency.value = 2500;
        gain.gain.value = 0.08;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        gain.gain.value = 0.25;
      }

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.onended = () => {
        if (soundNodeRef.current === noise) soundNodeRef.current = null;
      };
      noise.start();
      soundNodeRef.current = noise;
      setAmbientSound(type);
      setAudioError('');
    } catch (error) {
      reportAudioError(error);
    }
  };

  const playCompletionSound = () => {
    try {
      const ctx = audioCtxRef.current ?? new AudioContext();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (error) {
      reportAudioError(error);
    }
  };

  useEffect(() => () => {
    stopAudio();
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      void audioCtxRef.current.close();
    }
  }, []);

  // --- CRICKET ACTIONS ---
  const buyPlayer = (player: CricketPlayer) => {
    if (points >= player.cost && !unlockedPlayers.includes(player.id)) {
      setPoints((prev) => prev - player.cost);
      setUnlockedPlayers((prev) => [...prev, player.id]);
      if (playingXI.length < 11) {
        setPlayingXI((prev) => [...prev, player.id]);
      }
    }
  };

  const toggleXI = (playerId: string) => {
    if (playingXI.includes(playerId)) {
      setPlayingXI(playingXI.filter((id) => id !== playerId));
    } else {
      if (playingXI.length < 11) {
        setPlayingXI([...playingXI, playerId]);
      }
    }
  };

  // Calculate XI Stats
  const selectedPlayerObjs = CRICKET_PLAYERS.filter((p) => playingXI.includes(p.id));
  const teamRating = selectedPlayerObjs.length > 0 
    ? Math.round(selectedPlayerObjs.reduce((acc, curr) => acc + curr.rating, 0) / selectedPlayerObjs.length)
    : 0;

  const roleCounts = selectedPlayerObjs.reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] || 0) + 1;
    return acc;
  }, { Batter: 0, Bowler: 0, 'All-Rounder': 0, 'Wicket-Keeper': 0 });

  const isBalancedSquad = (roleCounts['Batter'] || 0) >= 3 && 
                          (roleCounts['Bowler'] || 0) >= 3 && 
                          (roleCounts['All-Rounder'] || 0) >= 1 && 
                          (roleCounts['Wicket-Keeper'] || 0) >= 1;

  // --- FOREST ACTIONS ---
  const unlockTreeSpecies = (species: TreeSpecies) => {
    if (points >= species.cost && !unlockedTrees.includes(species.id)) {
      setPoints((prev) => prev - species.cost);
      setUnlockedTrees((prev) => [...prev, species.id]);
    }
  };

  // --- DISTRACTION HANDLERS ---
  const addDistraction = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!distractionInput.trim()) return;
    setDistractions((current) => [
      { id: Date.now(), text: distractionInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...current,
    ]);
    setDistractionInput('');
  };

  const removeDistraction = (id: number) => {
    setDistractions((current) => current.filter((distraction) => distraction.id !== id));
  };

  // Formatting Helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress Ratio
  const totalSeconds = durationMinutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Determine tree growth stage for current timer
  const getGrowthStage = () => {
    if (progressPercent < 25) return { stage: 'Seed', icon: '🌱', size: 'text-3xl' };
    if (progressPercent < 65) return { stage: 'Sprout', icon: '🌿', size: 'text-5xl' };
    if (progressPercent < 95) return { stage: 'Sapling', icon: '🪴', size: 'text-6xl' };
    return { stage: 'Mature Tree', icon: TREE_SPECIES.find(t => t.id === selectedTreeSpecies)?.icon || '🌳', size: 'text-8xl' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* HEADER BAR */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Trophy className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                CricFocus
              </span>
              <span className="text-xs text-slate-400 block -mt-1 font-mono">Deep Work & Dream XI</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('timer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'timer'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-4 h-4" /> Focus Session
            </button>
            <button
              onClick={() => setActiveTab('auction')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'auction'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Player Auction
            </button>
            <button
              onClick={() => setActiveTab('squad')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'squad'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" /> My Playing XI ({playingXI.length}/11)
            </button>
            <button
              onClick={() => setActiveTab('forest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'forest'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TreePine className="w-4 h-4" /> Virtual Forest
            </button>
          </nav>

          {/* Points Pill & Parking Lot Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowParkingLot(!showParkingLot)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
              title="Open Distraction Parking Lot"
            >
              <Feather className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Notes</span>
              {distractions.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {distractions.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-mono font-bold text-amber-300 text-sm">{points}</span>
              <span className="text-xs text-slate-400 font-medium">PTS</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex border-t border-slate-800 bg-slate-950 px-2 py-1 justify-around">
          <button
            onClick={() => setActiveTab('timer')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${activeTab === 'timer' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <Clock className="w-5 h-5" /> Focus
          </button>
          <button
            onClick={() => setActiveTab('auction')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${activeTab === 'auction' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <ShoppingBag className="w-5 h-5" /> Auction
          </button>
          <button
            onClick={() => setActiveTab('squad')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${activeTab === 'squad' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <Users className="w-5 h-5" /> Squad
          </button>
          <button
            onClick={() => setActiveTab('forest')}
            className={`p-2 rounded-lg text-xs flex flex-col items-center ${activeTab === 'forest' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <TreePine className="w-5 h-5" /> Forest
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between relative">

        {/* DISTRACTION PARKING LOT OVERLAY SLIDE-OUT */}
        {showParkingLot && (
          <div className="absolute top-4 right-4 z-50 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-200">Distraction Parking Lot</h3>
              </div>
              <button 
                onClick={() => setShowParkingLot(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Jot down random thoughts or urgent tasks here to clear your brain without leaving focus mode.
            </p>

            <form onSubmit={addDistraction} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Check electric bill..."
                value={distractionInput}
                onChange={(e) => setDistractionInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                Park
              </button>
            </form>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {distractions.length === 0 ? (
                <div className="text-center py-6 text-slate-600 text-xs italic">
                  No distractions parked yet. Mind is clear!
                </div>
              ) : (
                distractions.map((d) => (
                  <div key={d.id} className="flex items-start justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 group">
                    <div>
                      <p className="text-xs text-slate-300 font-medium">{d.text}</p>
                      <span className="text-[10px] text-slate-500">{d.time}</span>
                    </div>
                    <button
                      onClick={() => removeDistraction(d.id)}
                      type="button"
                      className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 1: FOCUS TIMER */}
        {activeTab === 'timer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
            {/* Left Column: Timer Ring & Controls */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-sm relative overflow-hidden">
              
              {/* Background Ambient Glow */}
              <div className={`absolute w-72 h-72 rounded-full blur-3xl opacity-10 transition-all duration-700 pointer-events-none ${
                isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-teal-500'
              }`} />

              {/* Preset Selector */}
              <div className="flex items-center gap-2 mb-8 bg-slate-900 p-1.5 rounded-xl border border-slate-800 z-10">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handlePresetSelect(mins)}
                    disabled={isRunning}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      durationMinutes === mins
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Circular SVG Timer */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center z-10 my-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    className="stroke-slate-800 fill-none stroke-[8]"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    className="stroke-emerald-400 fill-none stroke-[8] transition-all duration-1000 ease-linear"
                    strokeDasharray="264%"
                    strokeDashoffset={`${264 - (264 * progressPercent) / 100}%`}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Clock Overlay Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-100">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Earn +{pointsForSession(durationMinutes)} Points
                  </span>
                </div>
              </div>

              {/* Main Play/Pause Controls */}
              <div className="flex items-center gap-4 mt-8 z-10">
                <button
                  onClick={resetTimer}
                  className="p-3.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={toggleTimer}
                  disabled={timeLeft === 0}
                  className={`px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-3 transition-all transform active:scale-95 shadow-xl ${
                    isRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                      : timeLeft === 0
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                  }`}
                >
                  {timeLeft === 0 ? (
                    <>Session Complete</>
                  ) : isRunning ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" /> Pause Session
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" /> Start Deep Work
                    </>
                  )}
                </button>
              </div>

              {/* Soundscape Control Bar */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 w-full flex flex-col sm:flex-row items-center justify-between gap-3 z-10 px-2">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <Music className="w-3.5 h-3.5 text-emerald-400" /> Focus Soundscape:
                </span>
                <div className="flex items-center gap-2">
                  {([
                    { id: 'rain', label: '🌧️ Gentle Rain' },
                    { id: 'forest', label: '🌲 Wind & Birds' },
                    { id: 'drone', label: '🎧 Deep Drone' },
                  ] as const).map((snd) => (
                    <button
                      key={snd.id}
                      onClick={() => handleAmbientToggle(snd.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        ambientSound === snd.id
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {snd.label}
                    </button>
                  ))}
                </div>
              </div>
              {audioError && (
                <p className="text-xs text-red-400" role="alert">
                  {audioError}
                </p>
              )}

            </div>

            {/* Right Column: Live Tree Growth & Active Reward Status */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Virtual Tree Growth Preview Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-200 text-base">Current Tree Growth</h3>
                    <p className="text-xs text-slate-400">Growing live during this session</p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {getGrowthStage().stage}
                  </span>
                </div>

                {/* Growth Stage Display */}
                <div className="h-44 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center relative my-2 overflow-hidden">
                  <div className={`transition-all duration-700 transform ${getGrowthStage().size} animate-bounce-slow`}>
                    {getGrowthStage().icon}
                  </div>
                  <span className="text-xs text-slate-400 mt-2 font-mono">
                    {Math.round(progressPercent)}% Grown
                  </span>

                  {/* Ground Line */}
                  <div className="absolute bottom-0 inset-x-0 h-3 bg-emerald-950/60 border-t border-emerald-800/40" />
                </div>

                {/* Tree Selector */}
                <div className="mt-4">
                  <label className="text-xs text-slate-400 mb-2 block">Choose Seed to Plant:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TREE_SPECIES.map((spec) => {
                      const isUnlocked = unlockedTrees.includes(spec.id);
                      return (
                        <button
                          key={spec.id}
                          onClick={() => isUnlocked && setSelectedTreeSpecies(spec.id)}
                          disabled={!isUnlocked}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            selectedTreeSpecies === spec.id
                              ? 'bg-emerald-500/10 border-emerald-500 text-slate-100'
                              : isUnlocked
                              ? 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                              : 'bg-slate-950/20 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <span className="text-xl">{spec.icon}</span>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold truncate">{spec.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {isUnlocked ? 'Ready' : `${spec.cost} PTS`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dream XI Target Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" /> Playing XI Status
                  </h3>
                  <button
                    onClick={() => setActiveTab('squad')}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Manage <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-mono">SQUAD SIZE</span>
                    <span className="text-lg font-bold text-slate-100">{playingXI.length} / 11 Players</span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-mono">TEAM RATING</span>
                    <span className="text-lg font-bold text-amber-400">{teamRating > 0 ? teamRating : 'N/A'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: CRICKET AUCTION HOUSE */}
        {activeTab === 'auction' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" /> Cricket Auction House
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Spend Focus Points earned from deep work sessions to sign world-class cricket superstars.
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Prices and tiers are game estimates based on international standing and the existing roster scale.
                  Unclear names are marked Needs review.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> {points} PTS Available
                </div>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CRICKET_PLAYERS.map((player) => {
                const isOwned = unlockedPlayers.includes(player.id);
                const canAfford = points >= player.cost;

                return (
                  <div
                    key={player.id}
                    className={`bg-slate-900/60 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                      isOwned
                        ? 'border-emerald-500/40 bg-slate-900/90'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Tier Badge & Country */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        player.tier === 'Legendary'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : player.tier === 'World Class'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : player.tier === 'Star'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : player.tier === 'Emerging'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                      }`}>
                        {player.tier}
                      </span>
                      <span className="text-xs text-slate-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {player.country}
                      </span>
                    </div>

                    {/* Player Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shadow-inner">
                        {player.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-base">{player.name}</h3>
                        <span className="text-xs text-slate-400 block">{player.role}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] text-slate-500 font-mono">OVERALL RATING:</span>
                          <span className="text-xs font-bold font-mono text-amber-400">{player.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stat Bars */}
                    <div className="space-y-1.5 mb-5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Batting</span>
                        <span className="font-mono font-bold text-slate-200">{player.stats.bat}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${player.stats.bat}%` }} />
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-400">Bowling</span>
                        <span className="font-mono font-bold text-slate-200">{player.stats.bowl}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-400 h-full rounded-full" style={{ width: `${player.stats.bowl}%` }} />
                      </div>
                    </div>

                    {/* Action Button */}
                    {isOwned ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                        <UserCheck className="w-4 h-4" /> Signed to Squad
                      </div>
                    ) : (
                      <button
                        onClick={() => buyPlayer(player)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          canAfford
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Sign for {player.cost} PTS
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MY PLAYING XI */}
        {activeTab === 'squad' && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" /> Playing XI Squad Builder
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select 11 unlocked players to form your ultimate competitive lineup.
                </p>
              </div>

              {/* Squad Overall Metrics */}
              <div className="flex items-center gap-4">
                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">SELECTED</span>
                  <span className="text-base font-bold text-slate-100">{playingXI.length} / 11</span>
                </div>

                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">TEAM RATING</span>
                  <span className="text-base font-bold text-amber-400">{teamRating}</span>
                </div>

                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">CHEMISTRY</span>
                  <span className={`text-base font-bold ${isBalancedSquad ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isBalancedSquad ? 'Balanced' : 'Imbalanced'}
                  </span>
                </div>
              </div>
            </div>

            {/* Squad Requirements Checklist */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-4 text-xs">
              <span className="text-slate-400 font-medium">Lineup Balance Rules:</span>
              <span className={roleCounts['Batter'] >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                ✓ Batters ({roleCounts['Batter'] || 0}/3+)
              </span>
              <span className={roleCounts['Bowler'] >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                ✓ Bowlers ({roleCounts['Bowler'] || 0}/3+)
              </span>
              <span className={roleCounts['All-Rounder'] >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                ✓ All-Rounder ({roleCounts['All-Rounder'] || 0}/1+)
              </span>
              <span className={roleCounts['Wicket-Keeper'] >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                ✓ Keeper ({roleCounts['Wicket-Keeper'] || 0}/1+)
              </span>
            </div>

            {/* Unlocked Roster Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300">Your Unlocked Players List</h3>
              {unlockedPlayers.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl">
                  <p className="text-slate-400 text-sm">No players signed yet!</p>
                  <button
                    onClick={() => setActiveTab('auction')}
                    className="mt-3 text-xs bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg"
                  >
                    Go to Auction House
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CRICKET_PLAYERS.filter((p) => unlockedPlayers.includes(p.id)).map((player) => {
                    const inXI = playingXI.includes(player.id);
                    return (
                      <div
                        key={player.id}
                        onClick={() => toggleXI(player.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          inXI
                            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/5'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{player.avatar}</div>
                          <div>
                            <h4 className="font-bold text-slate-100 text-sm">{player.name}</h4>
                            <span className="text-xs text-slate-400">{player.role} • {player.country}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-amber-400">{player.rating}</span>
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                            inXI ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-950'
                          }`}>
                            {inXI && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: VIRTUAL FOREST */}
        {activeTab === 'forest' && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-emerald-400" /> Digital Forest Sanctuary
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Every completed focus session plants a permanent tree in your personal sanctuary.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-sm font-bold">
                  {forestGrid.length} Trees Planted
                </div>
              </div>
            </div>

            {/* Tree Species Unlock Shop */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" /> Unlock Rare Tree Species
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {TREE_SPECIES.map((spec) => {
                  const isUnlocked = unlockedTrees.includes(spec.id);
                  const canAfford = points >= spec.cost;

                  return (
                    <div
                      key={spec.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        isUnlocked
                          ? 'bg-slate-950/60 border-emerald-500/30'
                          : 'bg-slate-950/30 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{spec.icon}</span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-200">{spec.name}</h4>
                          <p className="text-[10px] text-slate-400">{spec.desc}</p>
                        </div>
                      </div>

                      {isUnlocked ? (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded text-center border border-emerald-500/20 mt-2">
                          Unlocked
                        </span>
                      ) : (
                        <button
                          onClick={() => unlockTreeSpecies(spec)}
                          disabled={!canAfford}
                          className={`mt-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            canAfford
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Unlock for {spec.cost} PTS
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Isometric Forest Grid View */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 min-h-[350px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-300">Forest Sanctuary Grid</h3>
                <span className="text-xs text-slate-500 font-mono">1 Grid Tile = 1 Completed Work Session</span>
              </div>

              {forestGrid.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                  <div className="text-5xl mb-3 opacity-30">🌲</div>
                  <p className="text-slate-400 text-sm max-w-sm">
                    Your forest is currently empty. Complete your first 60-minute focus session to plant a tree!
                  </p>
                  <button
                    onClick={() => setActiveTab('timer')}
                    className="mt-4 bg-emerald-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl"
                  >
                    Start Focus Session
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {forestGrid.map((tree) => (
                    <div
                      key={tree.id}
                      className="aspect-square bg-slate-950/80 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-2 relative group hover:border-emerald-500/50 transition-all shadow-md"
                    >
                      <span className="text-3xl transform group-hover:scale-110 transition-transform">
                        {tree.icon}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 truncate w-full text-center">
                        {tree.duration}m
                      </span>

                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-slate-200 text-[10px] p-2 rounded-lg border border-slate-700 whitespace-nowrap z-20 shadow-xl">
                        <div className="font-bold">{tree.name}</div>
                        <div className="text-slate-400">Planted: {tree.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-600">
        <p>CricFocus & Forest Workspace • Deep Work Engine with Gamified Progression</p>
      </footer>
    </div>
  );
}