import { useRouter } from "expo-router";
import { ActionSheet, type ActionSheetItem } from "@/shared/components/modals";

type Props = {
  visible: boolean;
  onClose: () => void;
  seed: string;
};

export function ContinueWithSheet({ visible, onClose, seed }: Props) {
  const router = useRouter();

  const go = (path: string) => () => {
    const encoded = encodeURIComponent(seed.slice(0, 500));
    router.push(`${path}?seed=${encoded}` as never);
  };

  const items: ActionSheetItem[] = [
    { label: "Continue with Image Gen", onPress: go("/tools/image-gen") },
    { label: "Continue with Video Gen", onPress: go("/tools/video-gen") },
    { label: "Continue with Music Gen", onPress: go("/tools/music-gen") },
  ];

  return <ActionSheet visible={visible} onClose={onClose} title="Continue with…" items={items} />;
}
