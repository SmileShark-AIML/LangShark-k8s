import { Button } from "@/src/components/ui/button";
import { Edit, LockIcon, PlusIcon, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useState } from "react";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { DatasetForm } from "@/src/features/datasets/components/DatasetForm";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";
import { type Prisma } from "@langfuse/shared";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";

interface BaseDatasetButtonProps {
  mode: "create" | "update" | "delete";
  projectId: string;
  className?: string;
  onFormSuccess?: () => void;
}

interface CreateDatasetButtonProps extends BaseDatasetButtonProps {
  mode: "create";
}

interface DeleteDatasetButtonProps extends BaseDatasetButtonProps {
  mode: "delete";
  datasetId: string;
}

interface UpdateDatasetButtonProps extends BaseDatasetButtonProps {
  mode: "update";
  datasetId: string;
  datasetName: string;
  datasetDescription?: string;
  datasetMetadata?: Prisma.JsonValue;
  icon?: boolean;
}

type DatasetActionButtonProps =
  | CreateDatasetButtonProps
  | UpdateDatasetButtonProps
  | DeleteDatasetButtonProps;

export const DatasetActionButton = (props: DatasetActionButtonProps) => {
  const capture = usePostHogClientCapture();
  const [open, setOpen] = useState(false);
  const hasAccess = useHasProjectAccess({
    projectId: props.projectId,
    scope: "datasets:CUD",
  });

  return (
    <Dialog open={hasAccess && open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.mode === "update" ? (
          props.icon ? (
            <Button
              variant="outline"
              size={"icon"}
              className={props.className}
              disabled={!hasAccess}
              onClick={() =>
                capture("datasets:update_form_open", {
                  source: "dataset",
                })
              }
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              onClick={() => {
                setOpen(true);
                capture("datasets:update_form_open", {
                  source: "table-single-row",
                });
              }}
            >
              {hasAccess ? (
                <Edit className="mr-2 h-4 w-4" />
              ) : (
                <LockIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              리네이밍
            </div>
          )
        ) : props.mode === "delete" ? (
          <div
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            onClick={() => {
              setOpen(true);
              capture("datasets:delete_form_open", {
                source: "table-single-row",
              });
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            삭제
          </div>
        ) : (
          <Button
            className={props.className}
            disabled={!hasAccess}
            onClick={() => capture("datasets:new_form_open")}
          >
            {hasAccess ? (
              <PlusIcon className="-ml-0.5 mr-1.5" aria-hidden="true" />
            ) : (
              <LockIcon className="-ml-0.5 mr-1.5 h-3 w-3" aria-hidden="true" />
            )}
            새 데이터셋 생성
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="mb-4">
            {props.mode === "create"
              ? "새 데이터셋 생성"
              : props.mode === "delete"
                ? "데이터셋을 삭제합니다."
                : "데이터셋 업데이트"}
          </DialogTitle>
          {props.mode === "delete" && (
            <DialogDescription className="text-md p-0">
              이 작업은 실행 취소할 수 없으며 이 데이터셋과 관련된 모든 데이터를 제거합니다.
            </DialogDescription>
          )}
        </DialogHeader>
        {props.mode === "create" ? (
          <DatasetForm
            mode="create"
            projectId={props.projectId}
            onFormSuccess={() => setOpen(false)}
          />
        ) : props.mode === "delete" ? (
          <DatasetForm
            mode="delete"
            projectId={props.projectId}
            onFormSuccess={() => setOpen(false)}
            datasetId={props.datasetId}
          />
        ) : (
          <DatasetForm
            mode="update"
            projectId={props.projectId}
            onFormSuccess={() => setOpen(false)}
            datasetId={props.datasetId}
            datasetName={props.datasetName}
            datasetDescription={props.datasetDescription}
            datasetMetadata={props.datasetMetadata}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
