import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

export const AdApprovals = new Mongo.Collection("AdApprovals");

// name
// companyID
// url
// status