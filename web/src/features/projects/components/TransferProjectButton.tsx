import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { api } from "@/src/utils/api";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";
import {
  hasOrganizationAccess,
  useHasOrganizationAccess,
} from "@/src/features/rbac/utils/checkOrganizationAccess";
import { useQueryProject } from "@/src/features/projects/hooks";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { showSuccessToast } from "@/src/features/notifications/showSuccessToast";

export function TransferProjectButton() {
  const capture = usePostHogClientCapture();
  const session = useSession();
  const { project, organization } = useQueryProject();
  const hasAccess = useHasOrganizationAccess({
    organizationId: organization?.id,
    scope: "projects:transfer_org",
  });
  const allOrgs = session.data?.user?.organizations ?? [];
  const organizationsToTransferTo =
    allOrgs.filter((org) =>
      hasOrganizationAccess({
        session: session.data,
        organizationId: org.id,
        scope: "projects:transfer_org",
      }),
    ) ?? [];
  const confirmMessage = (organization?.name + "/" + project?.name)
    .replaceAll(" ", "-")
    .toLowerCase();

  const formSchema = z.object({
    name: z.string().includes(confirmMessage, {
      message: `Please confirm with "${confirmMessage}"`,
    }),
    projectId: z.string(),
  });

  const transferProject = api.projects.transfer.useMutation({
    onSuccess: async () => {
      showSuccessToast({
        title: "소유권 이전됨",
        description:
          "프로젝트가 새 조직으로 성공적으로 이전되었습니다. 리디렉션...",
      });
      await new Promise((resolve) => setTimeout(resolve, 5000));
      void session.update();
      window.location.href = "/";
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      projectId: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!project) return;
    capture("project_settings:project_delete");
    transferProject.mutate({
      projectId: project.id,
      targetOrgId: values.projectId,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive-secondary" disabled={!hasAccess}>
          소유권 이전
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            소유권 이전
          </DialogTitle>
        </DialogHeader>
        <Alert className="mt-2">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>경고</AlertTitle>
          <AlertDescription>
          프로젝트를 이전하면 다른 조직으로 이동합니다:
            <ul className="list-disc pl-4">
              <li>
              새 조직에 속하지 않은 회원은 액세스 권한을 잃게 됩니다.
              </li>
              <li>
              API 키, 설정 및 데이터는 변경되지 않으므로 프로젝트는 완전히 운영됩니다. 모든 기능(예: 추적, 프롬프트 관리)은 중단 없이 계속 작동합니다.
              </li>
            </ul>
          </AlertDescription>
        </Alert>
        <Form {...form}>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-8"
          >
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>조직 선택</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={transferProject.isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizationsToTransferTo
                          .filter((org) => org.id !== organization?.id)
                          .map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                  프로젝트를 작성할 수 있는 능력이 있는 다른 조직으로 이 프로젝트를 전송합니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>확인</FormLabel>
                  <FormControl>
                    <Input placeholder={confirmMessage} {...field} />
                  </FormControl>
                  <FormDescription>
                    {`확인하려면 입력 상자에 "${confirmMessage}"를 입력하십시오`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="destructive"
              loading={transferProject.isLoading}
              className="w-full"
            >
              소유권 이전
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
