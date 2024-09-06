import { env } from "@/src/env.mjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

const regions =
  env.NEXT_PUBLIC_LANGFUSE_CLOUD_REGION === "STAGING"
    ? [
        {
          name: "STAGING",
          hostname: "staging.langfuse.com",
          flag: "🇪🇺",
        },
      ]
    : env.NEXT_PUBLIC_LANGFUSE_CLOUD_REGION === "DEV"
      ? [
          {
            name: "DEV",
            hostname: null,
            flag: "🚧",
          },
        ]
      : [
          {
            name: "US",
            hostname: "us.cloud.langfuse.com",
            flag: "🇺🇸",
          },
          {
            name: "EU",
            hostname: "cloud.langfuse.com",
            flag: "🇪🇺",
          },
        ];

export function CloudRegionSwitch({
  isSignUpPage,
}: {
  isSignUpPage?: boolean;
}) {
  const capture = usePostHogClientCapture();

  if (env.NEXT_PUBLIC_LANGFUSE_CLOUD_REGION === undefined) return null;

  const currentRegion = regions.find(
    (region) => region.name === env.NEXT_PUBLIC_LANGFUSE_CLOUD_REGION,
  );

  return (
    <div>
    </div>
  );
}

const DataRegionInfo = () => (
  <Dialog>
  </Dialog>
);
