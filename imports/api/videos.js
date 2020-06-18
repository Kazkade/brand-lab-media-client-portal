import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Videos = new Mongo.Collection("Videos");

// name
// companyID
// dropbox
// wistia url
// streaming url
// bitly url

/**
 * The video will always be uploaded to Dropbox. Admins will have the option to upload to Wistia and generate a bitly link.
 */