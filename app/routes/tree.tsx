import type { Route } from "./+types/tree";
import { Link } from "react-router";
import { TreePine, Users, Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Family Tree - Family Tree Manager" },
    { name: "description", content: "Visualize your family tree" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  try {
    // In a real app, we'd fetch tree data from the API
    return { treeData: null };
  } catch (error) {
    console.error("Error loading tree data:", error);
    return { treeData: null };
  }
}

export default function TreePage() {
  return (
    <div className="px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Family Tree Visualization
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explore your family relationships in an interactive tree format
        </p>
      </div>

      {/* Placeholder for tree visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center py-16">
          <TreePine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Family Tree Coming Soon
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            The interactive family tree visualization is being developed. 
            For now, you can manage family members and their relationships.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild variant="outline">
              <Link to="/people">
                <Users className="h-4 w-4 mr-2" />
                View People
              </Link>
            </Button>
            <Button asChild>
              <Link to="/people/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Interactive Nodes
            </CardTitle>
            <CardDescription>
              Click on family members to view details and navigate relationships
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TreePine className="h-5 w-5 mr-2 text-green-600" />
              Dynamic Layout
            </CardTitle>
            <CardDescription>
              Automatically organized tree structure that adapts to your family size
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-purple-600" />
              Easy Editing
            </CardTitle>
            <CardDescription>
              Add new relationships and family members directly from the tree view
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}