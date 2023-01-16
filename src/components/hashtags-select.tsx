import type { FC } from "react";
import { useEffect, useState } from "react";
import type { Option } from "../molecules/multiselect";
import { Multiselect } from "../molecules/multiselect";
import { trpc } from "@/src/utils/trpc";
import { useIntersection } from "../hooks/use-intersection";
import { cleanStr } from "../utils/clean-str";

type HashtagsSelectProps = {
  onHashtagsSelect: (hashtags: string[]) => void;
};

export const HashtagsSelect: FC<HashtagsSelectProps> = ({
  onHashtagsSelect,
}) => {
  const { ref, isVisible } = useIntersection();
  const { options, setOptions } = useGetHashtagsAsOptions({
    enabled: Boolean(isVisible),
  });

  const optionsToStringArr = (options: Option[]) => options.map((o) => o.value);

  const onCreateNewHashtag = (value: string) => {
    const depoluted = cleanStr(value).replace(/#+/g, "");

    if (options.some((o) => o.value === depoluted)) return;

    setOptions((prev) => [
      ...prev,
      { label: `#${depoluted}`, value: depoluted },
    ]);
  };

  return (
    <div ref={ref}>
      <Multiselect
        options={options}
        placeholder="Add hashtags"
        onMultiSelect={(options) =>
          onHashtagsSelect(optionsToStringArr(options))
        }
        onNew={onCreateNewHashtag}
      />
    </div>
  );
};

const useGetHashtagsAsOptions = ({ enabled }: { enabled: boolean }) => {
  const [options, setOptions] = useState<Option[]>([]);

  const { data: hashtags, isLoading } = trpc.hashtag.getAllNames.useQuery(
    undefined,
    {
      enabled,
    }
  );

  useEffect(() => {
    const appropriateHashtagsToOptions = hashtags?.length
      ? hashtags.map((h) => ({ label: `#${h.name}`, value: h.name }))
      : [];

    setOptions(appropriateHashtagsToOptions);
    console.log(appropriateHashtagsToOptions);
  }, [hashtags]);

  return { options, setOptions, isLoading };
};
