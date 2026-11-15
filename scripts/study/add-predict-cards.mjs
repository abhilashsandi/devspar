// Builds the "Predict the Output" section of the JavaScript guide from predict-content.mjs.
//   node scripts/study/add-predict-cards.mjs && npm run study:build
// Re-running replaces the section, so edit predict-content.mjs and run it again.
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { predict } from './predict-content.mjs';

const { html, data } = await lib.load('javascript');
const old = data.findIndex((s) => s.id === 'js-predict');
if (old >= 0) data.splice(old, 1);
H.addSection(data, 'deep-objects', { id: 'js-predict', title: 'Predict the Output', questions: predict.map(({ q, a }) => ({ q, a })) });
const total = await lib.save('javascript', await lib.upgrade(lib.withData(html, data)));
console.log('javascript: ' + predict.length + ' predict cards (' + total + ' cards in the guide)');
