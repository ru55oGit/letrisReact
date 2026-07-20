export type SupportedLanguage = "es" | "en" | "pt";

export interface Translation {
  // Layout / general
  appName: string;
  drawerHome: string;
  drawerPlay: string;
  language: string;

  // Home
  tagline: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  readyToPlay: string;
  playButton: string;
  recordTitle: string;
  recordEmptyBody: string;
  recordScoreCaption: (score: number) => string;
  recordWordsCaption: (n: number) => string;
  recordLongestWordCaption: (word: string) => string;
  whatIsTitle: string;
  whatIsBody: string;
  howToPlayTitle: string;
  howToPlayBody: string;

  // Game
  scoreLabel: string;
  levelLabel: string;
  levelGoalLabel: (current: number, total: number) => string;
  levelUpTitle: (level: number) => string;
  levelReachedLabel: (level: number) => string;
  wordsListTitle: string;
  wordsListEmpty: string;
  errorNotInDictionary: string;
  errorAlreadyUsed: (word: string) => string;
  gameOverTitle: string;
  gameOverBody: (score: number) => string;
  playAgainButton: string;
  backToHomeButton: string;
}

const es: Translation = {
  appName: "Letris",
  drawerHome: "Inicio",
  drawerPlay: "Jugar",
  language: "Idioma",

  tagline: "encastrá · formá · sumá",
  greetingMorning: "Buenos días",
  greetingAfternoon: "Buenas tardes",
  greetingEvening: "Buenas noches",
  readyToPlay: "¿Listo para jugar Letris?",
  playButton: "JUGAR",
  recordTitle: "Récord",
  recordEmptyBody: "Todavía no jugaste ninguna partida.",
  recordScoreCaption: (score) => `${score} puntos`,
  recordWordsCaption: (n) => `Más palabras en una partida: ${n}`,
  recordLongestWordCaption: (word) => `Palabra más larga: ${word} (${word.length} letras)`,
  whatIsTitle: "¿Qué es Letris?",
  whatIsBody: "Letris es un Tetris de letras. Cada pieza cae con una letra por cuadro, y al encastrar arriba de las demás va formando una sopa de letras. A diferencia del Tetris clásico, las líneas completas no se borran solas: tenés que encontrar palabras deslizando el dedo sobre la grilla para eliminarlas.",
  howToPlayTitle: "¿Cómo jugar?",
  howToPlayBody: "Movés y girás las piezas con los botones de abajo para acomodar las letras. Cuando veas una palabra formada en la grilla, deslizá el dedo pasando por sus letras: no hace falta que estén en línea recta, podés doblar en cualquier dirección mientras cada letra toque a la anterior. Si existe en el diccionario, se elimina y sumás puntos; las letras de arriba caen para ocupar su lugar. Repetir una palabra ya usada te resta 1 punto. Cada 5 palabras se completa un nivel: se vacía la grilla y arranca el siguiente. Perdés si las piezas llegan arriba de todo.",

  scoreLabel: "Puntos",
  levelLabel: "Nivel",
  levelGoalLabel: (current, total) => `Objetivo: ${current}/${total} palabras`,
  levelUpTitle: (level) => `¡Nivel ${level}!`,
  levelReachedLabel: (level) => `Nivel alcanzado: ${level}`,
  wordsListTitle: "Palabras encontradas",
  wordsListEmpty: "Formá una palabra en la grilla y seleccionala",
  errorNotInDictionary: "Esa palabra no se encuentra en mi diccionario.",
  errorAlreadyUsed: (word) => `Ya usaste "${word}" (-1 punto).`,
  gameOverTitle: "¡Se llenó la grilla!",
  gameOverBody: (score) => `Terminaste con ${score} puntos.`,
  playAgainButton: "Jugar de nuevo",
  backToHomeButton: "Volver al inicio",
};

const en: Translation = {
  appName: "Letris",
  drawerHome: "Home",
  drawerPlay: "Play",
  language: "Language",

  tagline: "stack · spell · score",
  greetingMorning: "Good morning",
  greetingAfternoon: "Good afternoon",
  greetingEvening: "Good evening",
  readyToPlay: "Ready to play Letris?",
  playButton: "PLAY",
  recordTitle: "Best score",
  recordEmptyBody: "You haven't played a game yet.",
  recordScoreCaption: (score) => `${score} points`,
  recordWordsCaption: (n) => `Most words in one game: ${n}`,
  recordLongestWordCaption: (word) => `Longest word: ${word} (${word.length} letters)`,
  whatIsTitle: "What is Letris?",
  whatIsBody: "Letris is a letter Tetris. Each piece falls with one letter per block, and as pieces stack up they form a word search grid. Unlike classic Tetris, full lines don't clear on their own: you have to find words by swiping across the grid to remove them.",
  howToPlayTitle: "How to play?",
  howToPlayBody: "Move and rotate pieces with the buttons below to arrange the letters. When you spot a word in the grid, swipe across its letters: they don't need to be in a straight line, you can turn in any direction as long as each letter touches the previous one. If it's in the dictionary, it's removed and you score points; the letters above fall down to fill the gap. Repeating an already-used word costs you 1 point. Every 5 words completes a level: the grid clears and the next one starts. You lose when the pieces stack up to the top.",

  scoreLabel: "Score",
  levelLabel: "Level",
  levelGoalLabel: (current, total) => `Goal: ${current}/${total} words`,
  levelUpTitle: (level) => `Level ${level}!`,
  levelReachedLabel: (level) => `Level reached: ${level}`,
  wordsListTitle: "Words found",
  wordsListEmpty: "Spell a word in the grid and select it",
  errorNotInDictionary: "That word isn't in my dictionary.",
  errorAlreadyUsed: (word) => `You already used "${word}" (-1 point).`,
  gameOverTitle: "The grid filled up!",
  gameOverBody: (score) => `You finished with ${score} points.`,
  playAgainButton: "Play again",
  backToHomeButton: "Back to home",
};

const pt: Translation = {
  appName: "Letris",
  drawerHome: "Início",
  drawerPlay: "Jogar",
  language: "Idioma",

  tagline: "encaixe · forme · pontue",
  greetingMorning: "Bom dia",
  greetingAfternoon: "Boa tarde",
  greetingEvening: "Boa noite",
  readyToPlay: "Pronto para jogar Letris?",
  playButton: "JOGAR",
  recordTitle: "Recorde",
  recordEmptyBody: "Você ainda não jogou nenhuma partida.",
  recordScoreCaption: (score) => `${score} pontos`,
  recordWordsCaption: (n) => `Mais palavras em uma partida: ${n}`,
  recordLongestWordCaption: (word) => `Palavra mais longa: ${word} (${word.length} letras)`,
  whatIsTitle: "O que é o Letris?",
  whatIsBody: "Letris é um Tetris de letras. Cada peça cai com uma letra por quadrado, e ao se encaixar sobre as outras vai formando um caça-palavras. Diferente do Tetris clássico, as linhas completas não somem sozinhas: você precisa encontrar palavras deslizando o dedo pela grade para eliminá-las.",
  howToPlayTitle: "Como jogar?",
  howToPlayBody: "Mova e gire as peças com os botões abaixo para organizar as letras. Quando ver uma palavra formada na grade, deslize passando pelas letras: elas não precisam estar em linha reta, você pode virar em qualquer direção contanto que cada letra toque a anterior. Se existir no dicionário, ela é removida e você ganha pontos; as letras de cima caem para ocupar o lugar. Repetir uma palavra já usada tira 1 ponto. A cada 5 palavras se completa um nível: a grade esvazia e começa o próximo. Você perde quando as peças chegam até o topo.",

  scoreLabel: "Pontos",
  levelLabel: "Nível",
  levelGoalLabel: (current, total) => `Objetivo: ${current}/${total} palavras`,
  levelUpTitle: (level) => `Nível ${level}!`,
  levelReachedLabel: (level) => `Nível alcançado: ${level}`,
  wordsListTitle: "Palavras encontradas",
  wordsListEmpty: "Forme uma palavra na grade e selecione",
  errorNotInDictionary: "Essa palavra não está no meu dicionário.",
  errorAlreadyUsed: (word) => `Você já usou "${word}" (-1 ponto).`,
  gameOverTitle: "A grade encheu!",
  gameOverBody: (score) => `Você terminou com ${score} pontos.`,
  playAgainButton: "Jogar de novo",
  backToHomeButton: "Voltar ao início",
};

export const translations: Record<SupportedLanguage, Translation> = { es, en, pt };

export const availableLanguages: Array<{ code: SupportedLanguage; name: string; flag: string }> = [
  { code: "es", name: "Español", flag: "🇦🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
];
