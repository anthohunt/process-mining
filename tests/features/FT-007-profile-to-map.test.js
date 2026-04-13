// FT-007: Profile to Map Navigation
module.exports = {
  id: 'FT-007',
  title: 'Profile to Map Navigation',
  testMode: 'browser',
  userStory: 'US-2.5',
  acceptance: [
    'AC-1: GIVEN a profile is displayed, WHEN user clicks "Voir sur la carte", THEN map screen opens',
    'AC-2: GIVEN the map opens from a profile, WHEN it renders, THEN view is centered on the researcher dot',
    'AC-3: GIVEN the map centers on a researcher, WHEN it renders, THEN the dot pulses or is visually highlighted'
  ]
};
