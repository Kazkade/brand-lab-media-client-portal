import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo';

export const TicketComments = new Mongo.Collection("TicketComments");

// content
// userID
// timestamp