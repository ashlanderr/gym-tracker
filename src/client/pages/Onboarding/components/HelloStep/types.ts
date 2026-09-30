import type { Account } from "../../../../api";

export interface HelloStepProps {
  account: Account;
  onStart: () => void;
}
