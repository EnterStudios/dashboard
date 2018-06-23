export class UserDetails {
  readonly silentEchoToken: string;
  readonly vendorID: string;
  readonly smAPIAccessToken: string;
  readonly stripeSusbcribedPlanId?: string;
  readonly stripeCustomerObjId?: string;
  stripeSusbcribedPlanName?: string;

  constructor(silentEchoToken: string, smAPIAccessToken: string, vendorID: string, stripeSusbcribedPlanId?: string,
    stripeCustomerObjId?: string, stripeSusbcribedPlanName?: string) {
    this.silentEchoToken = silentEchoToken;
    this.smAPIAccessToken = smAPIAccessToken;
    this.vendorID = vendorID;
    this.stripeSusbcribedPlanId = stripeSusbcribedPlanId;
    this.stripeSusbcribedPlanName = stripeSusbcribedPlanName;
    this.stripeCustomerObjId = stripeCustomerObjId;
  }
}
export interface UserProperties {
  readonly email: string;
  readonly userId?: string;
  readonly displayName?: string;
  readonly photoUrl?: string;
  emailVerified?: boolean;
  stripeSusbcribedPlanId?: string;
  stripeSusbcribedPlanName?: string;
  stripeCustomerObjId?: string;
}

export class User implements UserProperties {

  readonly userId: string;
  readonly email: string;
  readonly displayName?: string;
  readonly photoUrl?: string;
  emailVerified?: boolean;
  stripeSusbcribedPlanId?: string;
  stripeSusbcribedPlanName?: string;
  stripeCustomerObjId?: string;


  constructor(props: UserProperties) {
    this.userId = props.userId;
    this.email = props.email;
    this.displayName = props.displayName;
    this.photoUrl = props.photoUrl;
    this.emailVerified = props.emailVerified;
    this.stripeSusbcribedPlanId = props.stripeSusbcribedPlanId;
    this.stripeSusbcribedPlanName = props.stripeSusbcribedPlanName;
    this.stripeCustomerObjId = props.stripeCustomerObjId;
  }
}

export default User;

import { remoteservice } from "../services/remote-service";

export class FirebaseUser extends User {

  constructor(user: remoteservice.user.User) {
    super({
      userId: user.uid, email: user.email, displayName: user.displayName,
      photoUrl: user.photoURL, emailVerified: user.emailVerified
    });
  }
}
