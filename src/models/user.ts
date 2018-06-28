export class UserDetails {
  readonly silentEchoToken: string;
  readonly vendorID: string;
  readonly smAPIAccessToken: string;
  readonly stripeSubscribedPlanId?: string;
  readonly stripeCustomerObjId?: string;
  stripeSubscribedPlanName?: string;

  constructor(silentEchoToken: string, smAPIAccessToken: string, vendorID: string, stripeSubscribedPlanId?: string,
    stripeCustomerObjId?: string, stripeSubscribedPlanName?: string) {
    this.silentEchoToken = silentEchoToken;
    this.smAPIAccessToken = smAPIAccessToken;
    this.vendorID = vendorID;
    this.stripeSubscribedPlanId = stripeSubscribedPlanId;
    this.stripeSubscribedPlanName = stripeSubscribedPlanName;
    this.stripeCustomerObjId = stripeCustomerObjId;
  }
}
export interface UserProperties {
  readonly email: string;
  readonly userId?: string;
  readonly displayName?: string;
  readonly photoUrl?: string;
  emailVerified?: boolean;
  stripeSubscribedPlanId?: string;
  stripeSubscribedPlanName?: string;
  stripeCustomerObjId?: string;
}

export class User implements UserProperties {

  readonly userId: string;
  readonly email: string;
  readonly displayName?: string;
  readonly photoUrl?: string;
  emailVerified?: boolean;
  stripeSubscribedPlanId?: string;
  stripeSubscribedPlanName?: string;
  stripeCustomerObjId?: string;


  constructor(props: UserProperties) {
    this.userId = props.userId;
    this.email = props.email;
    this.displayName = props.displayName;
    this.photoUrl = props.photoUrl;
    this.emailVerified = props.emailVerified;
    this.stripeSubscribedPlanId = props.stripeSubscribedPlanId;
    this.stripeSubscribedPlanName = props.stripeSubscribedPlanName;
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
