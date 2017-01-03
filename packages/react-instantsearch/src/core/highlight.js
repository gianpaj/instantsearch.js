import {get} from 'lodash';

/**
 * Find an highlighted attribute give a path `attributeName`, parses it,
 * and provided an array of objects with the string value and a boolean if this
 * value is highlighted.
 *
 * In order to use this feature, highlight must be activated in the configuration of
 * the index. The `preTag` and `postTag` attributes are respectively highlightPreTag and
 * highligtPostTag in Algolia configuration.
 *
 * @param {string} preTag - string used to identify the start of an highlighted value
 * @param {string} postTag - string used to identify the end of an highlighted value
 * @param {string} path - path to the structure containing the highlight attribute in the results
 * @param {string} attributeName - the highlighted attribute to look for
 * @param {object} hit - the actual hit returned by Algolia.
 * @return {object[]} - An array of {value: string, isDefined: boolean}.
 */
export default function parseAlgoliaHit({
  preTag = '<em>',
  postTag = '</em>',
  path,
  attributeName,
  hit,
}) {
  if (!hit) throw new Error('`hit`, the matching record, must be provided');

  const highlightObject = get(hit[path], attributeName);
  const highlightedValue = !highlightObject ? '' : highlightObject.value;

  return parseHighlightedAttribute({preTag, postTag, highlightedValue});
}

/**
 * Parses an highlighted attribute into an array of objects with the string value, and
 * a boolean that indicated if this part is highlighted.
 *
 * @param {string} preTag - string used to identify the start of an highlighted value
 * @param {string} postTag - string used to identify the end of an highlighted value
 * @param {string} highlightedValue - highlighted attribute as returned by Algolia highlight feature
 * @return {object[]} - An array of {value: string, isDefined: boolean}.
 */
function parseHighlightedAttribute({
  preTag,
  postTag,
  highlightedValue,
}) {
  const splitByPreTag = highlightedValue.split(preTag);
  const firstValue = splitByPreTag.shift();
  const elements = firstValue === '' ? [] : [{value: firstValue, isHighlighted: false}];

  if (postTag === preTag) {
    let isHighlighted = true;
    splitByPreTag.forEach(split => {
      elements.push({value: split, isHighlighted});
      isHighlighted = !isHighlighted;
    });
  } else {
    splitByPreTag.forEach(split => {
      const splitByPostTag = split.split(postTag);
      elements.push({
        value: splitByPostTag[0],
        isHighlighted: true,
      });

      if (splitByPostTag[1] !== '') {
        elements.push({
          value: splitByPostTag[1],
          isHighlighted: false,
        });
      }
    });
  }

  return elements;
}
