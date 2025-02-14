
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Warning, X } from "@phosphor-icons/react";

interface AccountStatusAlertsProps {
  isBanned: boolean;
  isSuspended: boolean;
  suspensionEndTimestamp: string | null;
}

export const AccountStatusAlerts: React.FC<AccountStatusAlertsProps> = ({
  isBanned,
  isSuspended,
  suspensionEndTimestamp,
}) => {
  if (!isBanned && !isSuspended) return null;

  return (
    <>
      {isBanned && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>
            This account has been banned for violating our community guidelines.
          </AlertDescription>
        </Alert>
      )}
      {isSuspended && (
        <Alert variant="destructive">
          <Warning className="h-4 w-4" />
          <AlertDescription>
            This account is temporarily suspended until{" "}
            {new Date(suspensionEndTimestamp || "").toLocaleDateString()}.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
