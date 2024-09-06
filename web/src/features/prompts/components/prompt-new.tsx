import { StringParam, useQueryParam } from "use-query-params";

import Header from "@/src/components/layouts/header";
import { NewPromptForm } from "@/src/features/prompts/components/NewPromptForm";
import useProjectIdFromURL from "@/src/hooks/useProjectIdFromURL";
import { api } from "@/src/utils/api";

export const NewPrompt = () => {
  const projectId = useProjectIdFromURL();
  const [initialPromptId] = useQueryParam("promptId", StringParam);

  const { data: initialPrompt, isInitialLoading } = api.prompts.byId.useQuery(
    {
      projectId: projectId as string, // Typecast as query is enabled only when projectId is present
      id: initialPromptId ?? "",
    },
    { enabled: Boolean(initialPromptId && projectId) },
  );

  if (isInitialLoading) {
    return <div>Loading...</div>;
  }

  const breadcrumb: { name: string; href?: string }[] = [
    {
      name: "Prompts",
      href: `/project/${projectId}/prompts/`,
    },
    {
      name: "New prompt",
    },
  ];

  if (initialPrompt) {
    breadcrumb.pop(); // Remove "New prompt"
    breadcrumb.push(
      {
        name: initialPrompt.name,
        href: `/project/${projectId}/prompts/${encodeURIComponent(initialPrompt.name)}`,
      },
      { name: "새 버전" },
    );
  }

  return (
    <div className="xl:container">
      <Header
        title={
          initialPrompt
            ? `${initialPrompt.name} \u2014 새 버전`
            : "새 프롬프트 생성"
        }
        // help={{
        //   description:
        //     "Manage and version your prompts in Langfuse. Edit and update them via the UI and SDK. Retrieve the production version via the SDKs. Learn more in the docs.",
        //   href: "https://langfuse.com/docs/prompts",
        // }}
        breadcrumb={breadcrumb}
      />
      {initialPrompt ? (
        <p className="text-sm text-muted-foreground">
          프롬프트는 LangShark에서 변경할 수 없습니다. 프롬프트를 업데이트하려면 새 버전을 만듭니다.
        </p>
      ) : null}
      <div className="my-8 max-w-screen-md">
        <NewPromptForm {...{ initialPrompt }} />
      </div>
    </div>
  );
};
