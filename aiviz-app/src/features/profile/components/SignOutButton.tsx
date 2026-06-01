import { Alert } from "react-native";
import { useSignOut } from "@/features/auth/hooks";
import { Button } from "@/shared/components/buttons";

export function SignOutButton() {
  const signOut = useSignOut();
  const confirm = () =>
    Alert.alert("Sign out?", "You'll need to sign in again to continue.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);
  return <Button variant="secondary" label="Sign out" onPress={confirm} />;
}
