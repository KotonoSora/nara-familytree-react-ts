import type { Route } from "./+types/_index";

import { ClientOnly } from "~/components/client-only";
import { FamilyTreeEditor } from "~/components/family-tree/FamilyTreeEditor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Family Tree - Interactive Canvas" },
    {
      name: "description",
      content:
        "Create and explore your family tree with an interactive canvas interface",
    },
  ];
}

export default function Page({}: Route.ComponentProps) {
  return (
    <div className="h-screen w-full">
      <ClientOnly
        fallback={
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
              </div>
              <p className="text-gray-600 mt-2">Loading family tree...</p>
            </div>
          </div>
        }
      >
        <FamilyTreeEditor />
      </ClientOnly>
    </div>
  );
}
