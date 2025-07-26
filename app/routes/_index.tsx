import type { Route } from "./+types/_index";
import { AppLayout } from "~/components/app-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nara Family Tree" },
    { name: "description", content: "Manage and visualize your family genealogy with Nara Family Tree" },
  ];
}

export default function Page({}: Route.ComponentProps) {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Nara Family Tree
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Discover, preserve, and share your family's story. Build a comprehensive family tree 
              with rich genealogical data and beautiful visualizations.
            </p>
            <a
              href="/family-tree"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start Building Your Tree
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Family Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add, edit, and organize family members with detailed biographical information, photos, and relationships.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Interactive Visualization
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Explore your family tree with beautiful, interactive charts and diagrams that bring your genealogy to life.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Rich Documentation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Preserve family stories, historical events, and personal memories with comprehensive biographical records.
              </p>
            </div>
          </div>

          {/* Quick Start Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
              Begin your genealogical journey today. Add your first family member and start building 
              connections that span generations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/add-member"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Add First Family Member
              </a>
              <a
                href="/family-tree"
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Explore Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
