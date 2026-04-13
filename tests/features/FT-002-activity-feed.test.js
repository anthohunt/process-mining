// FT-002: Activity Feed
module.exports = {
  id: 'FT-002',
  title: 'Activity Feed',
  testMode: 'browser',
  userStory: 'US-1.2',
  acceptance: [
    'AC-1: GIVEN the dashboard loads, WHEN activity data is fetched, THEN the 5 most recent activities display with avatar, name, action, and timestamp',
    'AC-2: GIVEN activities exist, WHEN displayed, THEN they are sorted by date descending',
    'AC-3: GIVEN an activity displays a researcher name, WHEN clicked, THEN navigates to that researcher profile'
  ]
};
