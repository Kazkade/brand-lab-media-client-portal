import { Meteor } from 'meteor/meteor';

function AsyncCreateAuditLog(data) {
    return new Promise((resolve, reject) => {
        Meteor.call("create audit log", { 
            model: data.model, 
            action: data.action, 
            status: data.status, 
            performedBy: data.performedBy, 
            message: data.message 
        });
        resolve();
    })
}

export function CallAsyncCreateAuditLog(data) {
    AsyncCreateAuditLog(data);
}