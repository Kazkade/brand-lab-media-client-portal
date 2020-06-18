/**
 * CORE IMPORTS
 */
import React, {createRef} from 'react';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import { 
  Router, 
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ReactBreakpoints from 'react-breakpoints';

/**
 * PAGE IMPORTS
 */
import NotFound404 from './system/404 - Not Found';
import NotAuthorized from './system/401 - Not Authorized';
//import Login from './system/Login';
import LoginForm from './system/Login/LoginForm';
import ForgotPasswordForm from './system/Login/ForgotPasswordForm';
import Home from './app/home';
import Dashboard from './app/Dashboard';
import Tickets from './app/tickets';
import AdApprovals from './app/adApprovals';
import CRM from './app/crm';
import Videos from './app/videos';
import Signout from './app/signout';
import Training from './app/training';
import Users from './app/Users/Users'
import CompaniesPage from './app/companiesPage';
import CreditApplier from './app/creditApplier';
import Administration from './app/adminstration';
import AgencyDashboard from './app/agencyDashboard';
import PrivacyPolicy from './app/privacyPolicy';
import MigrationHelper from './app/migrationHelper';
import WebinarQuestions from './app/webinarQuestions';
import ChangePassword from './system/ChangePassword';
import AuditLogs from './app/auditLogs';
import { Sidebar, Segment, Menu, Icon, Ref, Image, Label, Sticky, Dropdown, Item, Header, Responsive, Button } from 'semantic-ui-react';

// Tables
import { Companies as CompanyDB } from '../api/companies';
import { GetPrivilegeLevel } from './app/subcomponents/PrivilegeParser';
import SetPasswordForm from './system/Login/SetPasswordForm';
/**
 * SYSTEM CONFIG
 */

const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1200,
}

const history = createBrowserHistory();

/**
 * APP BASE
 */

const Companies = Meteor.subscribe("companies");

export default class AppRouter extends React.Component {
  

  constructor(props) {
    super(props);

    if(!window.location.href.split(":")[0].includes('s')) {
      let redirect = "https:"+window.location.href.split(":")[1];
      window.location.href = redirect;
    }

    this.changeCompany = this.changeCompany.bind(this);

    this.state = {
      isOnMobile: (window.innerWidth <= 763) ? true : false,
      loggedIn: false,
      sidebarVisible: true,
      sidebarDimmable: false,
      sidebarPushMargin: "0",
      selectedCompany: "",
    }

    this.notifications = {
    }

    this.menus = [
      {name: "Home", disabled: false, icon: 'home', token: '', privilegeLevel: 1},
      //{name: "Dashboard", disabled: false, icon: "dashboard", token: "dashboard", privilegeLevel: 1},
      {name: "CRM", disabled: false, icon: "user md", token: "crm", privilegeLevel: 1},
      {name: "Ads", disabled: false, icon: "adversal", token: "ads",  privilegeLevel: 1},
      {name: "Videos", disabled: false, icon: "video", token: "videos",  privilegeLevel: 1},
      //{name: "Tickets", disabled: false, icon: "ticket", token: "tickets",  privilegeLevel: 1},
      {name: "Training", disabled: false, icon: "external", token: "training",  privilegeLevel: 1},
      //{name: "Agency Dashboard", disabled: false, icon: "settings", token: "agency_dashboard", admin: true},
      {name: "Users", disabled: false, icon: "user", token: "users",  privilegeLevel: 2},
      {name: "Companies", disabled: false, icon: "building", token: "companiespage",  privilegeLevel: 2},
      {name: "Administration", disabled: false, icon: "hashtag", token: "administration",  privilegeLevel: 2},
      //{name: "AC Credit Applier", disabled: false, icon: "reply", token: "credit_applier",  privilegeLevel: 3},
      //{name: "Migration Tool", disabled: false, icon: "exchange", token:"migration_helper",  privilegeLevel: 3},
      {name: "Webinar Questions", disabled: false, icon: "conversation", token:"webinar_questions",  privilegeLevel: 2},
      {name: "Audit Logs", disabled: false, icon: "list", token:"audit_logs",  privilegeLevel: 3},
      {name: "Sign Out", disabled: false, icon:"log out", token: "signout",  privilegeLevel: 1}
    ]

    Tracker.autorun(() => {
      if(Meteor.user()) {
        this.setState({selectedCompany: Meteor.user().profile.lastViewed});
        this.setState({loggedIn: true});
        this.UIFixForCRMView();
      }
    });

    this.SetForceRefreshTimer();

  };

  SetForceRefreshTimer() {
    // Create Timeout to refresh the page at midnight.
    let d = new Date(); // Get now's time. 
    let n = new Date(); // Get now's time.
    d.setHours(24,0,0,0); // Change one time to next midnight.
    let r = d - n; // Refresh in r milliseconds.
    //console.log("Refreshing in "+r/1000/60/60+" hours");
    Meteor.setTimeout(() => {
      window.location.reload(true);
    }, r)
  }

  PrivateRoute = ({component: Component, ...props}) => {
    return(
      <Route {...props} render={innerProps =>
        (Meteor.user() ) ? 
          <Component {...innerProps} />
          :
          <Redirect to="/errors/401" />
      }
      />
    );
  };

  AppSidebar = () => {
    return <Sidebar 
      secondary
      as={Menu}
      style={{fontFamily: "Helvetica, sans-serif", backgroundColor: "#fff", borderRadius: "0px !imporant"}}
      vertical
      animation='overlay'
      onHide={() => {if(window.location.href.split("/")[window.location.href.split("/").length-1] ==="crm" || this.state.isOnMobile) { this.setState({sidebarVisible: false})}}}
      visible={this.state.sidebarVisible}
      >
      <Menu.Item style={{background: "", backgroundSize:'cover', borderRadius: "0 !important" }}>
        <Image centered circular style={{
            width: "88px", height: '88px', filter: 'blue(8px)', 
            filter: "drop-shadow(-3px -2px 3px rgba(255,255,0,0.25)) drop-shadow(0px 5px 3px rgba(0,255,255,0.25)) drop-shadow(3px -2px 3px rgba(255,0,255,0.25)) "
          }}src='/image/blankAvatar.jpg' />
        <Header as='h2' style={{marginTop: "16px"}} textAlign='center'>
          <Header.Subheader >Welcome Back,</Header.Subheader>
          {Meteor.user().profile.fullName}
        </Header>
      </Menu.Item>
      <this.MenuItems menus={this.menus} history={this.props.history}/>
      {/**
       * 
      <Menu.Item style={{position: "absolute", bottom: 0, left: 0, right: 0}}>
        <Image centered src="/image/blm_logo.png" />
        <div className="home-header" as='h4' textAlign='center' style={{marginTop: "0", textAlign: "center"}}>Client Dashboard<sup>&copy;</sup></div>
      </Menu.Item>
       */}
    </Sidebar>
  }

  GrantNotifications() {
    Notification.requestPermission().then((res) => {
      //console.log("Permissions response... "+ res);
      if(res==="granted") {
        //console.log("Notifications granted")
      }
    })
  }

  MenuItems = (props) => {
    const items = []
    props.menus.map((menu) => {
      console.log("User Privilege: "+GetPrivilegeLevel(), "Menu Level: "+menu.privilegeLevel);
      if(GetPrivilegeLevel() < menu.privilegeLevel) {
        return;
      }
      items.push(
        <Menu.Item 
            key={menu.token} 
            style={{color: "#607179"}} 
            active={(window.location.href.split("/")[window.location.href.split('/').length-1] === menu.token)}
            disabled={menu.disabled} 
            as='a' 
            onClick={() => { history.push(menu.token); this.UIFixForCRMView();
          }}>
          <Icon style={{float: 'left', marginLeft: "4px", marginRight: "16px"}} name={menu.icon} />
          {(this.notifications.hasOwnProperty(menu.token)) ? 
            <this.NotificationLabels labels={this.notifications[menu.token]} token={menu.token}/>
          : null }
          {menu.name}
        </Menu.Item>
      )
    })
    return items;
  }

  NotificationLabels = (props) => {
    const labels = props.labels;
    if(labels > 0) {
      return <Label color="red" key={`${Math.random()}`}>{labels}</Label>
    } else {
      return null;
    }
  }

  GetCompaniesDropdownItems = (props) => {
    let items = [];
    
    // If Admin, show all else show mine. 
    if(Meteor.user().profile.admin) {
      let companies = CompanyDB.find().fetch();
      if(companies.length === 0) {
        items.push(<Dropdown.Item><Icon name="warning sign" color='orange'/>No Companies</Dropdown.Item>)
      } else {
        companies.map((company) => {
          items.push(
            <Dropdown.Item key={company._id} value={company._id}>{company.name}</Dropdown.Item>
          )
        })
      }
    } else {
      if(Meteor.user().profile.companies.length == 0) {
        return([
          <Dropdown.Item>
            <Icon name="warning sign"  color='orange' />
            No Companies
          </Dropdown.Item>
        ])
      } else {
        Meteor.user().profile.companies.map((company) => {
          items.push(
            <Dropdown.Item key={company._id} value={company._id}>{company.name}</Dropdown.Item>
            )
          })
      }
    }
    
    return items;
  }

  GetCompaniesDropdownItemsObjects = () => {
    let items = [];
    let allCompanies = false;
    // If Admin, show all else show mine. 
    if(Meteor.user().profile.admin) {
      let companies = CompanyDB.find().fetch();
      if(companies.length === 0) {
        items.push(<Dropdown.Item key="none"><Icon name="warning sign" color='orange'/>No Companies</Dropdown.Item>)
      } else {
        allCompanies = true;
        companies.map((company) => {
          items.push(
            {key: company._id, value:company._id, text:`${this.getParentName(company.parent)}${company.name}`}
          )
        })
      }
    } else {
      if(Meteor.user().profile.companies.length == 0) {
        return([
          <Dropdown.Item >
            <Icon name="warning sign"  color='orange' />
            No Companies
          </Dropdown.Item>
        ])
      } else {
        allCompanies = true;
        let myCompanies = Meteor.user().profile.companies;
        let myCompaniesData = CompanyDB.find({"_id": {$in: myCompanies}}).fetch()
        myCompaniesData.map((company) => {
          items.push(
              {key: company._id, value:company._id, text:`${this.getParentName(company.parent)}${company.name}`}
            )
          })
      }
    }
    // Sort and return items.
    items.sort((a, b) => (a.text > b.text) ? 1 : -1);
    if(allCompanies) { items.unshift({key: "0", value: "0",  text: "All Companies"}); }
    return items;
  }

  changeCompany = (e, data) => {
    this.setState({selectedCompany: data.value});
  }

  getDropdownName = () => {
    let choice = CompanyDB.find({_id: this.state.selectedCompany}).fetch();
    if(choice.length === 0) {
      return "All Companies"
    } else {
      // Update the user's last viewed company.
      Meteor.users.update({"_id": Meteor.userId() }, {
        $set: {
          'profile.lastViewed': this.state.selectedCompany
        }
      })
      // Return full company name with parent as prefix. 
      return `${this.getParentName(choice[0].parent)}${choice[0].name}`
    }
  }

  getParentName = (id) => {
    return ""; //jfc i'm done
    if(id === undefined) {return ""}
    if(id === "") { return "";}
    let d = CompanyDB.findOne({_id: id});
    if(d.name !== undefined) {
      return `${d.name} - `;
    } else {
      return "";
    }
  }

  MainMenu = () => 
    <Sticky context={this.contextRef}>
      <Menu secondary style={{fontFamily: "Helvetica, sans-serif",  background: 'linear-gradient(to right, #003263, #1B75BC)', boxShadow: "-8px 8px 6px -6px rgba(0,0,0,0.1), 8px 8px 6px -6px rgba(0,0,0,0.1)", borderRadius: '0 !important',}}>
        {(!this.state.sidebarVisible) ? 
          <Menu.Item as='a' name="menu" onClick={() => {this.setState({sidebarVisible: true})}}>
            <Icon name='bars' style={{color: "white",}}/>
          </Menu.Item>
        : null }
        <Menu.Header style={{marginLeft: "16px"}}></Menu.Header>
          {(window.location.href.split("/")[window.location.href.split("/").length-1] !="crm") ? 
          <Dropdown 
          item 
          selection 
          search 
          text={this.getDropdownName()}
          onChange={this.changeCompany}
          options={this.GetCompaniesDropdownItemsObjects()}
          style={{paddingRight: "32px", position: "absolute", left: "32px", right: 0, maxWidth: "400px",color: "white"}}
          >
          </Dropdown>
        : null}
      </Menu>
    </Sticky>

  UIFixForCRMView() {
    //console.log("Checking mobile and crm status.");
    if(this.state.isOnMobile) {
      this.setState({sidebarVisible: false});
      this.setState({sidebarDimmable: true});
      this.setState({sidebarPushMargin: "0px"})
    } else {
      let loc = window.location.href.split("/");
      if(loc[loc.length-1] === "crm") {
        this.setState({sidebarVisible: false});
        this.setState({sidebarDimmable: true});
        this.setState({sidebarPushMargin: "0px"})
      } else {
        this.setState({sidebarVisible: true});
        this.setState({sidebarDimmable: false});
        this.setState({sidebarPushMargin: "260px"});
      }
    }

  }

  render() {
    this.contextRef = createRef();
    const loginMenuOnly = (Meteor.user()) ? null : {justifyContent: 'center', alignItems: 'middle', display: 'flex'}
    return(
      <React.Fragment>
        <ReactBreakpoints breakpoints={breakpoints}>
          <Ref innerRef={this.contextRef}>
            <Sidebar.Pushable as={Segment}  attached  style={{backgroundSize: "cover", height: "100%", transform: 'none', position: 'absolute', bottom: 0, top: "-1px"}}>
              {(Meteor.user()) ? <Sticky context={this.contextRef}><this.AppSidebar /></Sticky> : null}
              <Sidebar.Pusher dimmed={this.state.sidebarDimmable && this.state.sidebarVisible}  style={ loginMenuOnly, { marginLeft: this.state.sidebarPushMargin, width: `calc(100% - ${this.state.sidebarPushMargin})`, minHeight: "100%", }}>
                {(Meteor.user()) ? 
                  <this.MainMenu />
                  : null}
                <Router history={history}>
                  {/** This is where all of the pages contents go. */}
                  <Switch>
                    <this.PrivateRoute exact path='/' component={Home} />
                    <this.PrivateRoute path='/dashboard' component={Dashboard} />
                    <this.PrivateRoute path="/crm" component={CRM} />
                    <this.PrivateRoute path="/tickets" component={Tickets} />
                    <this.PrivateRoute path="/ads" component={AdApprovals} />
                    <this.PrivateRoute path="/videos" component={Videos} />
                    <this.PrivateRoute path="/signout" component={Signout} />
                    <this.PrivateRoute path="/training" component={Training} />
                    <this.PrivateRoute path="/administration" component={Administration} />
                    <this.PrivateRoute path="/agency_dashboard" component={AgencyDashboard} />
                    <this.PrivateRoute path="/companiespage" component={CompaniesPage} />
                    <this.PrivateRoute path='/credit_applier' component={CreditApplier} />
                    <this.PrivateRoute path="/migration_helper" component={MigrationHelper} />
                    <this.PrivateRoute path="/webinar_questions" component={WebinarQuestions} />
                    <this.PrivateRoute path="/audit_logs" component={AuditLogs} />
                    <this.PrivateRoute path='/users' component={Users} />
                    <Route exact path="/privacy_policy" component={PrivacyPolicy} />
                    {/** 
                     * V1 Login Forms
                     * <Route exact path="/login" component={Login} />
                    * <Route exact path='/change_password' component={ChangePassword} />
                    */}
                    {/**
                     * Login Forms
                     */}
                    <Route exact path="/login" component={LoginForm} />
                    <Route exact path="/forgot_password" component={ForgotPasswordForm} />
                    <Route path="/set_password/:token" component={SetPasswordForm} />
                    {/**
                     * System
                     */}
                    <Route exact path="/errors/401" component={NotAuthorized} />
                    <Route path='*'><NotFound404 /></Route>
                  </Switch>
                </Router>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </Ref>
        </ReactBreakpoints>
      </React.Fragment>

    )
  }
}