import { PagedSettingsContainer } from "@/src/components/PagedSettingsContainer";
import Header from "@/src/components/layouts/header";
import { MembershipInvitesPage } from "@/src/features/rbac/components/MembershipInvitesPage";
import { MembersTable } from "@/src/features/rbac/components/MembersTable";
import { JSONView } from "@/src/components/ui/CodeJsonViewer";
import RenameOrganization from "@/src/features/organizations/components/RenameOrganization";
import { useQueryOrganization } from "@/src/features/organizations/hooks";
import { useRouter } from "next/router";
import { SettingsDangerZone } from "@/src/components/SettingsDangerZone";
import { DeleteOrganizationButton } from "@/src/features/organizations/components/DeleteOrganizationButton";
import { BillingSettings } from "@/src/ee/features/billing/components/BillingSettings";
import { useHasOrgEntitlement } from "@/src/features/entitlements/hooks";

const OrgSettingsPage = () => {
  const organization = useQueryOrganization();
  const router = useRouter();
  const { page } = router.query;
  const showBillingSettings = useHasOrgEntitlement("cloud-billing");

  if (!organization) return null;

  return (
    <div className="lg:container">
      <Header title="조직 설정" />
      <PagedSettingsContainer
        activeSlug={page as string | undefined}
        pages={[
          {
            title: "일반",
            slug: "index",
            content: (
              <div className="flex flex-col gap-6">
                <RenameOrganization />
                <div>
                  <Header title="디버깅 정보" level="h3" />
                  <JSONView
                    title="Metadata"
                    json={{ name: organization.name, id: organization.id }}
                  />
                </div>
                <SettingsDangerZone
                  items={[
                    {
                      title: "이 조직 삭제",
                      description:
                        "조직을 삭제한 후에는 되돌릴 수 없습니다.",
                      button: <DeleteOrganizationButton />,
                    },
                  ]}
                />
              </div>
            ),
          },
          {
            title: "멤버",
            slug: "members",
            content: (
              <div className="flex flex-col gap-6">
                <div>
                  <Header title="조직 멤버" level="h3" />
                  <MembersTable orgId={organization.id} />
                </div>
                <div>
                  <MembershipInvitesPage orgId={organization.id} />
                </div>
              </div>
            ),
          },
          // {
          //   title: "빌링",
          //   slug: "billing",
          //   content: <BillingSettings />,
          //   show: showBillingSettings,
          // },
          {
            title: "프로젝트",
            slug: "projects",
            href: `/organization/${organization.id}`,
          },
        ]}
      />
    </div>
  );
};

export default OrgSettingsPage;
