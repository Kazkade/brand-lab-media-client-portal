import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

export const UserRoles = new Mongo.Collection("UserRoles");

// Name
// Power