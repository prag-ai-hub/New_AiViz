import { Button } from "@/shared/components/buttons";

type Props = {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function SubmitButton({ label, loading, disabled, onPress }: Props) {
  return <Button label={label} loading={loading} disabled={disabled} onPress={onPress} />;
}
