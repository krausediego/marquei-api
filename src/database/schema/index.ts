import { accounts } from "./accounts";
import { invitations } from "./invitations";
import { members } from "./members";
import { organizations } from "./organizations";
import { sessions } from "./sessions";
import { subscriptions } from "./subscriptions";
import { users } from "./users";
import { verifications } from "./verifications";

export const schema = {
  users,
  sessions,
  accounts,
  verifications,
  organizations,
  invitations,
  subscriptions,
  members,
} as const;
