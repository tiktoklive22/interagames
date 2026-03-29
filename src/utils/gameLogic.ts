import { GRID_SIZE, CATEGORIES } from '../constants';

export interface GridCell {
  char: string;
  r: number;
  c: number;
}

export interface WordPlacement {
  word: string;
  cells: { r: number; c: number }[];
}

export function generateLevel(level: number) {
  const grid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  const wordsToPlace: string[] = [];
  
  // Pick random category
  const categoryKeys = Object.keys(CATEGORIES);
  const randomCategoryKey = categoryKeys[Math.floor(Math.random() * categoryKeys.length)] as keyof typeof CATEGORIES;
  const category = CATEGORIES[randomCategoryKey];
  
  // Shuffle all available words in the category
  const allWords = [...category.words].sort(() => Math.random() - 0.5);
  const hint = category.hint;
  
  // Increase word count for 10x10 grid
  const numWords = Math.min(8 + Math.floor(level / 5), allWords.length);
  
  for (let i = 0; i < numWords; i++) {
    const randomIndex = Math.floor(Math.random() * allWords.length);
    wordsToPlace.push(allWords.splice(randomIndex, 1)[0]);
  }

  const placedWords: WordPlacement[] = [];

  for (const word of wordsToPlace) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const direction = Math.floor(Math.random() * 8); // 8 directions
      const dr = [0, 0, 1, -1, 1, 1, -1, -1][direction];
      const dc = [1, -1, 0, 0, 1, -1, 1, -1][direction];
      
      const startR = Math.floor(Math.random() * GRID_SIZE);
      const startC = Math.floor(Math.random() * GRID_SIZE);
      
      const endR = startR + dr * (word.length - 1);
      const endC = startC + dc * (word.length - 1);
      
      if (endR >= 0 && endR < GRID_SIZE && endC >= 0 && endC < GRID_SIZE) {
        let canPlace = true;
        const cells: { r: number; c: number }[] = [];
        
        for (let i = 0; i < word.length; i++) {
          const r = startR + dr * i;
          const c = startC + dc * i;
          if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
            canPlace = false;
            break;
          }
          cells.push({ r, c });
        }
        
        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            grid[cells[i].r][cells[i].c] = word[i];
          }
          placedWords.push({ word, cells });
          placed = true;
        }
      }
      attempts++;
    }
  }

  // Fill remaining with random letters
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return { grid, placedWords, hint };
}
