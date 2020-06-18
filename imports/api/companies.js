import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

export const Companies = new Mongo.Collection("Companies");

// ID
// Name
// Phone
// Address {}
// Active