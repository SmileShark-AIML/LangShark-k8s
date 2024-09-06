import { Card } from "@/src/components/ui/card";
import { CodeView } from "@/src/components/ui/CodeJsonViewer";
import Header from "@/src/components/layouts/header";
import { useUiCustomization } from "@/src/ee/features/ui-customization/useUiCustomization";

export function HostNameProject() {
  const uiCustomization = useUiCustomization();
  return (
    <div>
      <Header title="호스트 네임" level="h3" />
      <Card className="mb-4 p-3">
        <div className="">
          <div className="mb-2 text-sm">
            LangShark에 연결할때 이 호스트 네임을 베이스URL로 사용하세요.
          </div>
          <CodeView content={uiCustomization?.hostname ?? window.origin} />
        </div>
      </Card>
    </div>
  );
}
