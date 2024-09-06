import { type Flag } from "@/src/features/feature-flags/types";
import { type ProjectScope } from "@/src/features/rbac/constants/projectAccessRights";
import {
  Database,
  LayoutDashboard,
  LifeBuoy,
  ListTree,
  Brain,
  ListCheck,
  type LucideIcon,
  Settings,
  UsersIcon,
  PenSquareIcon,
  LibraryBig,
  TerminalIcon,
  Lightbulb,
  Grid2X2,
} from "lucide-react";
import { LangfuseIcon, SharkIcon } from "@/src/components/LangfuseLogo";
import { type ReactNode } from "react";
import { VersionLabel } from "@/src/components/VersionLabel";
import { type Entitlement } from "@/src/features/entitlements/constants/entitlements";
import { type UiCustomizationOption } from "@/src/ee/features/ui-customization/useUiCustomization";

export type Route = {
  name: string;
  featureFlag?: Flag;
  label?: string | ReactNode;
  projectRbacScope?: ProjectScope;
  icon?: LucideIcon | typeof LangfuseIcon | typeof SharkIcon; // ignored for nested routes
  pathname?: string; // link, ignored if children
  children?: Array<Route>; // folder
  bottom?: boolean; // bottom of the sidebar, only for first level routes
  newTab?: boolean; // open in new tab
  entitlement?: Entitlement; // entitlement required
  customizableHref?: UiCustomizationOption; // key of useUiCustomization object to use to replace the href
};

export const ROUTES: Route[] = [
  {
    name: "LangShark",
    pathname: "/",
    icon: SharkIcon,
    // label: <VersionLabel />,
  },
  {
    name: "프로젝트",
    pathname: "/organization/[organizationId]",
    icon: Grid2X2,
  },
  {
    name: "대시보드",
    pathname: `/project/[projectId]`,
    icon: LayoutDashboard,
  },
  {
    name: "트레이싱",
    icon: ListTree,
    children: [
      {
        name: "트레이스",
        pathname: `/project/[projectId]/traces`,
      },
      {
        name: "세션",
        pathname: `/project/[projectId]/sessions`,
      },
      // {
      //   name: "결과물",
      //   pathname: `/project/[projectId]/generations`,
      // },
      // {
      //   name: "평가",
      //   pathname: `/project/[projectId]/scores`,
      // },
      // {
      //   name: "모델",
      //   pathname: `/project/[projectId]/models`,
      // },
      {
        name: "생성",
        pathname: `/project/[projectId]/generations`,
      },
    ],
  },
  // {
  //   name: "생성",
  //   pathname: `/project/[projectId]/generations`,
  //   icon: Brain
  // },
  {
    name: "평가",
    pathname: `/project/[projectId]/scores`,
    icon: ListCheck
  },
  // {
  //   name: "Evaluation",
  //   icon: Lightbulb,
  //   entitlement: "model-based-evaluations",
  //   label: "Beta",
  //   children: [
  //     {
  //       name: "Templates",
  //       pathname: `/project/[projectId]/evals/templates`,
  //       entitlement: "model-based-evaluations",
  //       projectRbacScope: "evalTemplate:read",
  //     },
  //     {
  //       name: "Configs",
  //       pathname: `/project/[projectId]/evals/configs`,
  //       entitlement: "model-based-evaluations",
  //       projectRbacScope: "evalJob:read",
  //     },
  //     {
  //       name: "Log",
  //       pathname: `/project/[projectId]/evals/log`,
  //       entitlement: "model-based-evaluations",
  //       projectRbacScope: "evalJobExecution:read",
  //     },
  //   ],
  // },
  {
    name: "유저",
    pathname: `/project/[projectId]/users`,
    icon: UsersIcon,
  },
  {
    name: "프롬프트",
    pathname: "/project/[projectId]/prompts",
    icon: PenSquareIcon,
    projectRbacScope: "prompts:read",
  },
  // {
  //   name: "Playground",
  //   pathname: "/project/[projectId]/playground",
  //   icon: TerminalIcon,
  //   entitlement: "playground",
  // },
  {
    name: "데이터셋",
    pathname: `/project/[projectId]/datasets`,
    icon: Database,
  },
  {
    name: "모델 설정",
    pathname: `/project/[projectId]/models`,
    icon: Brain
  },
  {
    name: "프로젝트 설정",
    pathname: "/project/[projectId]/settings",
    icon: Settings,
    bottom: true,
  },
  {
    name: "조직 설정",
    pathname: "/organization/[organizationId]/settings",
    icon: Settings,
    bottom: true,
  },
  // {
  //   name: "Docs",
  //   pathname: "https://langfuse.com/docs",
  //   icon: LibraryBig,
  //   bottom: true,
  //   newTab: true,
  //   customizableHref: "documentationHref",
  // },
  // {
  //   name: "Support",
  //   pathname: "/support",
  //   icon: LifeBuoy,
  //   bottom: true,
  //   customizableHref: "supportHref",
  // },
];
