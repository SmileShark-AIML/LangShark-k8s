import { ChevronDown, Trash } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { api } from "@/src/utils/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useState } from "react";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";

export function TraceTableMultiSelectAction({
  selectedTraceIds,
  projectId,
  onDeleteSuccess,
}: {
  selectedTraceIds: string[];
  projectId: string;
  onDeleteSuccess: () => void;
}) {
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const capture = usePostHogClientCapture();

  const hasDeleteAccess = useHasProjectAccess({
    projectId,
    scope: "traces:delete",
  });
  const mutDeleteTraces = api.traces.deleteMany.useMutation({
    onSuccess: () => {
      onDeleteSuccess();
      void utils.traces.all.invalidate();
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={selectedTraceIds.length < 1}>
            작업 ({selectedTraceIds.length} 선택됨)
            <ChevronDown className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            disabled={!hasDeleteAccess}
            onClick={() => {
              capture("trace:delete_form_open", {
                count: selectedTraceIds.length,
                source: "table-multi-select",
              });
              setOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            <span>삭제</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>트레이스 삭제</DialogTitle>
            <DialogDescription>
            이 작업은 실행 취소할 수 없으며<br></br>
            이러한 추적과 관련된 모든 데이터를 제거합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              loading={mutDeleteTraces.isLoading}
              disabled={mutDeleteTraces.isLoading}
              onClick={() => {
                void mutDeleteTraces
                  .mutateAsync({
                    traceIds: selectedTraceIds,
                    projectId,
                  })
                  .then(() => {
                    setOpen(false);
                  });
                capture("trace:delete_form_submit", {
                  count: selectedTraceIds.length,
                  source: "table-multi-select",
                });
              }}
            >
              {selectedTraceIds.length} 개 트레이스를 삭제합니다.
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
