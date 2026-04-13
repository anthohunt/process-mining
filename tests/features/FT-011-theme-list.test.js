// FT-011: Theme List View
module.exports = {
  id: 'FT-011',
  title: 'Theme List View',
  testMode: 'browser',
  userStory: 'US-3.4',
  acceptance: [
    'AC-1: GIVEN the themes screen loads, WHEN cluster data is available, THEN a grid of cluster cards displays',
    'AC-2: GIVEN a cluster card is displayed, WHEN clicked, THEN it expands to show member researcher names',
    'AC-3: GIVEN an expanded card lists researchers, WHEN user clicks a name, THEN navigates to profile',
    'AC-4: GIVEN the themes screen is displayed, WHEN "Voir sur la carte" is clicked, THEN navigates to map'
  ]
};
