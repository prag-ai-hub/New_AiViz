import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import {
  EntryDetailModal,
  FilterChips,
  LibrarySection,
  NotebookEntryCard,
  SearchBox,
  UseAsInputSheet,
  type FilterValue,
} from "@/features/library/components";
import {
  useDeleteEntry,
  useNotebookEntries,
} from "@/features/library/hooks";
import type { NotebookEntry, SourceKind } from "@/features/library/types";
import { Spinner } from "@/shared/components/loaders";
import { Text } from "@/shared/components/typography";
import { Screen } from "@/shared/layouts";

const SECTION_LABEL: Record<SourceKind, string> = {
  vidya_lm: "Chats",
  image_gen: "Images",
  video_gen: "Videos",
  code_helper: "Code",
};

const SECTION_ORDER: SourceKind[] = [
  "video_gen",
  "image_gen",
  "vidya_lm",
  "code_helper",
];

export function LibraryScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [filter, setFilter] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");
  const [viewer, setViewer] = useState<NotebookEntry | null>(null);
  const [sheetEntryId, setSheetEntryId] = useState<number | null>(null);

  const entriesQuery = useNotebookEntries({
    tool: filter === "all" ? undefined : filter,
    q: query || undefined,
  });
  const deleteMut = useDeleteEntry();

  const entries: NotebookEntry[] = useMemo(() => {
    const pages = entriesQuery.data?.pages ?? [];
    return pages.flatMap((p) => p.results);
  }, [entriesQuery.data]);

  const grouped = useMemo(() => {
    const map: Record<SourceKind, NotebookEntry[]> = {
      vidya_lm: [],
      image_gen: [],
      video_gen: [],
      code_helper: [],
    };
    for (const e of entries) {
      map[e.source_kind].push(e);
    }
    return map;
  }, [entries]);

  const total = entriesQuery.data?.pages?.[0]?.count ?? 0;
  const isLoading = entriesQuery.isLoading;
  const isEmpty = !isLoading && entries.length === 0;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          gap: tokens.spacing.lg,
          paddingBottom: tokens.spacing["2xl"],
        }}
      >
        <View style={styles.titleRow}>
          <Text style={{ fontSize: 22 }}>📁</Text>
          <Text variant="h1" style={{ color: colors.text }}>
            My Library
          </Text>
          {total > 0 ? (
            <Text
              variant="caption"
              style={{ color: colors.muted, marginLeft: tokens.spacing.sm }}
            >
              {total} {total === 1 ? "item" : "items"}
            </Text>
          ) : null}
        </View>

        <SearchBox value={query} onChange={setQuery} />
        <FilterChips value={filter} onChange={setFilter} />

        {isLoading ? (
          <View style={{ alignItems: "center", padding: tokens.spacing.xl }}>
            <Spinner size="large" />
          </View>
        ) : null}

        {!isLoading && !isEmpty
          ? SECTION_ORDER.map((kind) => {
              if (filter !== "all" && filter !== kind) return null;
              const items = grouped[kind];
              if (items.length === 0) return null;
              return (
                <LibrarySection key={kind} title={SECTION_LABEL[kind]}>
                  {items.map((entry) => (
                    <NotebookEntryCard
                      key={entry.id}
                      entry={entry}
                      onView={() => setViewer(entry)}
                      onUseAsInput={() => setSheetEntryId(entry.id)}
                      onDelete={() => deleteMut.mutate(entry.id)}
                    />
                  ))}
                </LibrarySection>
              );
            })
          : null}

        {isEmpty ? (
          <View
            style={[
              styles.emptyCard,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Text style={{ fontSize: 48, marginBottom: tokens.spacing.md }}>
              🖼️
            </Text>
            <Text
              variant="h3"
              style={{ color: colors.text, marginBottom: tokens.spacing.xs }}
            >
              {query || filter !== "all"
                ? "No matching entries"
                : "No media found"}
            </Text>
            <Text
              variant="caption"
              style={{
                color: colors.muted,
                marginBottom: tokens.spacing.lg,
                textAlign: "center",
              }}
            >
              Generate something with any AI tool — it'll show up here.
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/tools" as never)}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={{ fontSize: 16 }}>➕</Text>
              <Text style={{ color: colors.primaryFg, fontWeight: "700" }}>
                Create Something
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <EntryDetailModal entry={viewer} onClose={() => setViewer(null)} />
      <UseAsInputSheet
        visible={sheetEntryId != null}
        entryId={sheetEntryId}
        onClose={() => setSheetEntryId(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing["2xl"],
    alignItems: "center",
    justifyContent: "center",
    minHeight: 280,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
  },
});
