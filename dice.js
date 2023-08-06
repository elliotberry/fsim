var bigramz;

// Implementation of Dice coefficient with memoization of bigrams
// https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
// Adapted from https://github.com/ka-weihe/fast-dice-coefficient
const getBigrams = str => {
  const map = bigramz.get(str) || new Map();
  if (!map.size) {
    let i, j, ref;
    for (i = j = 0, ref = str.length - 2; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      const bi = str.substr(i, 2);
      const repeats = 1 + (map.get(bi) || 0);
      map.set(bi, repeats);
    }
    bigramz.set(str, map);
  }
  return map;
};

const dice = (fst, snd, bigrams) => {
  bigramz = bigrams;
  if (fst.length < 2 || snd.length < 2) {
    return 0;
  }
  const map1 = getBigrams(fst);
  const map2 = getBigrams(snd);
  let match = 0;
  if (map1.length > map2.length) {
    map2.forEach((v, k) => {
      if (map1.has(k)) {
        match += Math.min(v, map1.get(k));
      }
    });
  } else {
    map1.forEach((v, k) => {
      if (map2.has(k)) {
        match += Math.min(v, map2.get(k));
      }
    });
  }
  return (2.0 * match) / (fst.length + snd.length - 2);
};

export {dice, getBigrams}