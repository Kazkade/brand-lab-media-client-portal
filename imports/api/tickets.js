
import { Mongo } from 'meteor/mongo';

export const Tickets = new Mongo.Collection("Tickets");

// ID
// Issue
// Description
// UserID
// CompanyID
// Status
// Assignee
// Attachments []
// Comments []