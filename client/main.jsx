import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import 'semantic-ui-css/semantic.min.css'

// Classes
import AppRouter from '/imports/ui/AppRouter'

// Subscriptions
Meteor.subscribe("UpcomingEvents");

Meteor.startup(() => {
  /**
   * SUBSCRIPTIONS
   */
  Meteor.subscribe('userData');

  render(<AppRouter />, document.getElementById('react-target'));
});
