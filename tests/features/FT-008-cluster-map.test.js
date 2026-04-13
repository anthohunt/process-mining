// FT-008: Interactive Cluster Map
module.exports = {
  id: 'FT-008',
  title: 'Interactive Cluster Map',
  testMode: 'browser',
  userStory: 'US-3.1',
  acceptance: [
    'AC-1: GIVEN the map loads, WHEN cluster data is available, THEN SVG renders colored cluster regions and researcher dots',
    'AC-2: GIVEN the map is displayed, WHEN user scrolls, THEN the map zooms in/out',
    'AC-3: GIVEN the map is displayed, WHEN user drags, THEN the map pans',
    'AC-4: GIVEN the filter panel is displayed, WHEN user selects theme/lab and clicks "Appliquer", THEN only matching items are shown',
    'AC-5: GIVEN the map is displayed, WHEN the legend is visible, THEN each cluster color is labeled'
  ]
};
