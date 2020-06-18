import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import './api/adApprovals';
import './api/companies';
import './api/tickets';
import './api/upcomingEvents';
import './api/users';
import './api/videos'
import './api/webinarQuestions';
import './api/dropboxIntegration';
import './api/homeHeadlines';
import './webhooks/webhooks';
import './api/mailgun';
import './api/auditLogs';
import './api/accounts';

import { Companies as CompanyDB } from '../imports/api/companies'

let CryptoJS = require("crypto-js");


Meteor.startup(() => {
  /**
   * PUBLICATIONS
   */
  Meteor.publish('userData', function () {
    if (this.userId) {
      return Meteor.users.find({ _id: this.userId });
    } else {
      this.ready();
    };


  });

  // Dropbox yt23l3zygcwy02a:ae50eyywrqux7mw:-hHo7Tt-OtAAAAAAAAAAveUKh8ZhY96o9bI24s9rqZRnhlxqj70OFuKh2Bfs0lJK
  
  Meteor.methods({
    "GetThinkificSSOURL"(data) {
      let CryptoJS = require("crypto-js");

      const base64url = (source) => {
        encodedSource = CryptoJS.enc.Base64.stringify(source);
    
        encodedSource = encodedSource.replace(/\=+$/, '');
        encodedSource = encodedSource.replace("+", "-");
        encodedSource = encodedSource.replace("/", '_');
    
        return encodedSource;
      }
      // https://support.thinkific.com/hc/en-us/articles/360030718713-SSO-Automatically-Sign-in-From-Your-Own-Website#c
      let header = {
        "alg": "HS256",
        "typ": "JWT"
      }
      let payload = {
        "first_name": data.first_name,
        "last_name": data.last_name,
        "email": data.email,
        "iat": Math.floor(Date.now() / 1000)
      }

      let readyHeader = base64url(CryptoJS.enc.Utf8.parse(JSON.stringify(header)));
      let readyData = base64url(CryptoJS.enc.Utf8.parse(JSON.stringify(payload)));
      let token = `${readyHeader}.${readyData}`;

      let signature = base64url(CryptoJS.HmacSHA256(token, "ca6adeafd7fe64c005955d411cc0705f"));
      let signedToken = `${token}.${signature}`; 

      let return_to = encodeURI("http://dashboard.brandlabmedia.com/training");
      let error_to = encodeURI("http://dashboard.brandlabmedia.com/sso/error");
      return `https://brandlabmedia.thinkific.com/api/sso/v2/sso/jwt?jwt=${signedToken}&return_url=${return_to}&error_url=${error_to}`;
    },
    "GetAccountStatus"(account) {
      let r = HTTP.get("https://www.activecampaign.com/api.php?api_key=409f31e5abfd297b725da66261b1b08fda64e38f8242d69b7a3e0f05274bdbcac5e1d44a&api_output=json&api_action=account_status&account="+account);
      console.log(r.data.status);
      return r.data.status;
    },
    "ApplyCredits"(data) {
      let url = data.url
      let amount = data.needed;
      let r = HTTP.get(`https://www.activecampaign.com/api.php?api_key=409f31e5abfd297b725da66261b1b08fda64e38f8242d69b7a3e0f05274bdbcac5e1d44a&api_output=json&api_action=account_credits_apply&account=${url}&credits=${amount}`);
    },
    async "GetACSSOUrl"(company) {
      const url = new Promise((resolve, reject) => {
        HTTP.post(
          `${company.ac_url}/admin/api.php?api_action=singlesignon&api_key=${company.ac_key}&api_output=application/json&sso_addr=${this.connection.clientAddress}&sso_user=${Meteor.user().emails[0].address}&sso_duration=${720}`
          , {}, (err, res) => {
            if(err) {reject(err); } else {
              let token = JSON.stringify(res.content).split("<token>")[1].split("</token>")[0];
              resolve(`${company.ac_url}/admin/main.php?_ssot=${token}`);
            }
          })
      });
      await url;
      return url;
    },
    "GetACAccountData"(company) {
      let comp = CompanyDB.findOne(company);
      if(!comp) { throw new Meteor.Error("There was no account found."); }
      // Get Contacts
      let contactData = HTTP.get(`${comp.ac_url}/api/3/contacts`, {
        headers: {
          "Api-Token": comp.ac_key
        }
      })
      let contacts = JSON.parse(contactData.content).contacts;
      // Get Deals
      let dealData = HTTP.get(`${comp.ac_url}/api/3/deals`, {
        headers: {
          "Api-Token": comp.ac_key
        }
      })
      let deals = JSON.parse(dealData.content).deals;
      console.log(deals);
      // Create payload
      let payload = {
        contacts: contacts,
        deals: deals
      }
      // Return
      console.log(payload)
      return payload;
    },
    "ACMigrateSingleContact"(contact) {
      console.log(contact);
      let hook = "https://hooks.zapier.com/hooks/catch/1775576/o4lviy7/"
      let deals = contact.deals;
      contact.deals = []

      // Send Contact to Webhook
      let r = HTTP.post(hook, {
        data: {
          contact
        }
      })
      console.log(r);
    },
    "receive pandadoc"(payload) {
      
    },
    "GetAdminCommands"() {
      if(Meteor.user().profile.admin) {
        return [
          {command: "purge audit logs", does: "Purges ALL audit logs.", parameters: "None"},
          {command: "GetAdApprovalDetails", does: "Pulls the object an Ad Approval.", parameters: `id`}, 
          {command: "GetWebinarQuestionDetails", does: "Pulls the object a Webinar Question.", parameters: `id`},
          {command: "DatabaseUpgradeUsersV1", does: "Upgrades ALL Users from V1 of the database structure to V2. This action cannot be undone.", parameters: `id`},
        ]
      } else {
        return "Not Authorized."
      }
    }
  })


  // remove all data
  Meteor.call("remove all tickets");
  
  //Meteor.call("remove all upcoming events");
  
  // Insert Demo Data
  Meteor.call("create demo tickets");
  //Meteor.call("demo upcoming events");

  
  /**
   * BEGIN
   Meteor.users.remove({});
   
   console.log("Users truncated.");
   
  // Insert Basic User
  Accounts.createUser({
    username: "admin",
    email: "admin@brandlabmedia.com",
    profile: {
      firstName: "Super",
      lastName: "User",
      fullName: `Super User`,
      admin: true,
      actingAs: "",
      companies: [],
      lastViewed: "",
    },
    password: "brand"
  });
  /*
  console.log("Basic User created.");

  console.log("Truncating companies");
  Meteor.call("remove all companies");
  console.log("Creating Companies");
  Meteor.call("create demo companies");
 */

  /**
   * END TESTING
   */
});
