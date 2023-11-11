import { Ausstattung } from './ausstattung.entity.js';
import { Auto } from './auto.entity.js';
import { Eigentuemer } from './eigentuemer.entity.js';

// erforderlich in src/config/db.ts und src/auto/auto.module.ts
export const entities = [Ausstattung, Auto, Eigentuemer];
