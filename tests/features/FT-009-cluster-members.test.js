// FT-009: Cluster Click for Members
module.exports = {
  id: 'FT-009',
  title: 'Cluster Click for Members',
  testMode: 'browser',
  userStory: 'US-3.2',
  acceptance: [
    'AC-1: GIVEN the map is displayed, WHEN user clicks a cluster region, THEN a popover lists member researchers',
    'AC-2: GIVEN the popover is displayed, WHEN themes are associated, THEN they are shown as tags',
    'AC-3: GIVEN the popover lists researchers, WHEN user clicks a name, THEN navigates to their profile'
  ]
};
