// FT-016: Profile Submission Approval Flow
module.exports = {
  id: 'FT-016',
  title: 'Profile Submission Approval Flow',
  testMode: 'browser',
  userStory: 'US-5.2',
  acceptance: [
    'AC-1: GIVEN researcher submits profile, WHEN saved, THEN status is pending',
    'AC-2: GIVEN admin views pending profiles, WHEN they approve, THEN profile becomes published',
    'AC-3: GIVEN admin views pending profiles, WHEN they reject, THEN researcher is notified with reason'
  ]
};
