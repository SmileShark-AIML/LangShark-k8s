import { Badge } from "@/src/components/ui/badge";

export const PromptDescription = ({
  currentExtractedVariables,
}: {
  currentExtractedVariables: string[];
}) => {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        <code className="text-xs">{"{variable}"}</code>를 사용하여 프롬프트에 변수를 삽입할 수 있습니다.
        <b className="font-semibold"> 참고: </b> 변수는 알파벳 문자 또는 밑줄이어야 합니다.
        {currentExtractedVariables.length > 0
          ? " The following variables are available:"
          : ""}
      </p>
      <div className="flex min-h-6 flex-wrap gap-2">
        {currentExtractedVariables.map((variable) => (
          <Badge key={variable} variant="outline">
            {variable}
          </Badge>
        ))}
      </div>
    </>
  );
};
