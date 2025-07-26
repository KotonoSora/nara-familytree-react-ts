import { useState } from "react";
import type { Route } from "./+types/add-member";
import { AppLayout } from "~/components/app-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Add Family Member" },
    { name: "description", content: "Add a new family member to your tree" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  
  const memberData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    middleName: formData.get("middleName") as string || undefined,
    maidenName: formData.get("maidenName") as string || undefined,
    birthDate: formData.get("birthDate") as string || undefined,
    deathDate: formData.get("deathDate") as string || undefined,
    gender: formData.get("gender") as "male" | "female" | "other",
    birthPlace: formData.get("birthPlace") as string || undefined,
    deathPlace: formData.get("deathPlace") as string || undefined,
    occupation: formData.get("occupation") as string || undefined,
    biography: formData.get("biography") as string || undefined,
    photoUrl: formData.get("photoUrl") as string || undefined,
  };

  // In a real implementation, this would call the API
  // For now, we'll just simulate success
  console.log("Creating family member:", memberData);
  
  return { success: true, data: memberData };
}

export default function NewFamilyMemberPage({}: Route.ComponentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <AppLayout>
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Add Family Member
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Add a new person to your family tree
          </p>
        </div>

        <form 
          method="post" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6"
          onSubmit={() => setIsSubmitting(true)}
        >
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="maidenName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maiden Name
                </label>
                <input
                  type="text"
                  id="maidenName"
                  name="maidenName"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Birth Date
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="deathDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Death Date
                </label>
                <input
                  type="date"
                  id="deathDate"
                  name="deathDate"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Birth Place
                </label>
                <input
                  type="text"
                  id="birthPlace"
                  name="birthPlace"
                  placeholder="City, State, Country"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="deathPlace" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Death Place
                </label>
                <input
                  type="text"
                  id="deathPlace"
                  name="deathPlace"
                  placeholder="City, State, Country"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  id="photoUrl"
                  name="photoUrl"
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="biography" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Biography
                </label>
                <textarea
                  id="biography"
                  name="biography"
                  rows={4}
                  placeholder="Share any additional information about this person..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <a
              href="/family-tree"
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
            >
              {isSubmitting ? "Adding..." : "Add Family Member"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}