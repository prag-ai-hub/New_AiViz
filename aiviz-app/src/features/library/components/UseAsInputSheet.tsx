import { useContinueWith } from "@/features/library/hooks";
import type { ContinueTarget } from "@/features/library/types";
import { ActionSheet, type ActionSheetItem } from "@/shared/components/modals";

type Props = {
  visible: boolean;
  entryId: number | null;
  onClose: () => void;
};

const TARGETS: { value: ContinueTarget; label: string }[] = [
  { value: "vidya_lm", label: "💬 Use in Vidya LM" },
  { value: "image_gen", label: "🖼️ Use in Image Generator" },
  { value: "code_helper", label: "💻 Use in Code Helper" },
  { value: "music_gen", label: "🎵 Use in Music Generator" },
  { value: "video_gen", label: "🎬 Use in Video Generator" },
  { value: "speech_tutor", label: "🎤 Use in Speech Tutor" },
  { value: "skillguru", label: "📊 Use in Gap Analyzer Pro" },
];

export function UseAsInputSheet({ visible, entryId, onClose }: Props) {
  const continueWith = useContinueWith();

  const items: ActionSheetItem[] = TARGETS.map((t) => ({
    label: t.label,
    onPress: () => {
      if (entryId == null) return;
      continueWith.mutate({ id: entryId, target: t.value });
    },
  }));

  return (
    <ActionSheet
      visible={visible}
      onClose={onClose}
      title="Use as input for…"
      items={items}
    />
  );
}
