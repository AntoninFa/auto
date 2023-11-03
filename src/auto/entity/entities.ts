import { Abbildung } from './abbildung.entity.js';
import { Auto } from './auto.entity.js';
import { Titel } from './titel.entity.js';

// erforderlich in src/config/db.ts und src/auto/auto.module.ts
export const entities = [Abbildung, Auto, Titel];
