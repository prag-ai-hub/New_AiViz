import { useQuery } from "@tanstack/react-query";
import { getStyles } from "@/features/image-gen/api";

export const stylesKey = ["image", "styles"] as const;

export function useStylePresets() {
  return useQuery({
    queryKey: stylesKey,
    queryFn: getStyles,
    staleTime: 1000 * 60 * 30,
  });
}
