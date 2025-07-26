import type { Route } from "./+types/family-tree";
import { AppLayout } from "~/components/app-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Family Tree" },
    { name: "description", content: "Manage your family tree" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  try {
    const { db } = context;
    
    // For now, return empty data structure
    // In a real app, we'd fetch from the database
    return {
      familyMembers: [],
      relationships: [],
    };
  } catch (error) {
    console.error("Error loading family tree data:", error);
    return {
      familyMembers: [],
      relationships: [],
    };
  }
}

export default function FamilyTreePage({ loaderData }: Route.ComponentProps) {
  const { familyMembers, relationships } = loaderData;

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Family Tree
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage and visualize your family genealogy
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Quick Stats
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Family Members:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {familyMembers.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Relationships:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {relationships.length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <a
                href="/add-member"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                Add Family Member
              </a>
              <a
                href="/family-tree/members"
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                View All Members
              </a>
              <a
                href="/family-tree/visualization"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                View Tree Visualization
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Recent Activity
            </h2>
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No recent activity
            </div>
          </div>
        </div>

        {/* Recent Members Preview */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Recent Family Members
          </h2>
          {familyMembers.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p className="text-lg mb-4">No family members added yet</p>
              <p className="mb-6">Start building your family tree by adding your first family member.</p>
              <a
                href="/add-member"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors"
              >
                Add Your First Family Member
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.slice(0, 6).map((member: any) => (
                <div
                  key={member.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 font-semibold text-lg">
                        {member.firstName[0]}{member.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.birthDate ? new Date(member.birthDate).getFullYear() : 'Unknown year'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}