import { createMorph } from '../lib/morphicons/dom.js';

const mockPath = {
  attrs: {},
  setAttribute(name, val) {
    this.attrs[name] = val;
  }
};

const iconLink = 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71';
const iconArrowRight = 'M5 12h14M12 5l7 7-7 7';

try {
  const m = createMorph(mockPath, iconLink);
  console.log('Initial d:', mockPath.attrs.d);
  m.morphTo(iconArrowRight, 'snappy');
  console.log('MorphTo called successfully!');
} catch (err) {
  console.error('Morph error:', err);
}
