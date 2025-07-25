import type { Route } from "./+types/_index";
import { Link } from "react-router";
import { Users, TreePine, Plus, Network } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Family Tree Manager" },
    { name: "description", content: "Manage and visualize your family genealogy" },
  ];
}

export default function Page({}: Route.ComponentProps) {
  const features = [
    {
      icon: Users,
      title: "Manage People",
      description: "Add, edit, and organize family members with detailed information.",
      link: "/people",
      linkText: "View People",
    },
    {
      icon: TreePine,
      title: "Family Tree",
      description: "Visualize family relationships in an interactive tree format.",
      link: "/tree",
      linkText: "View Tree",
    },
    {
      icon: Plus,
      title: "Add Family Member",
      description: "Quickly add new family members to your genealogy.",
      link: "/people/new",
      linkText: "Add Person",
    },
    {
      icon: Network,
      title: "Relationships",
      description: "Define and manage family relationships between members.",
      link: "/people",
      linkText: "Manage",
    },
  ];

  return (
    <div className="px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Family Tree Manager
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Create, manage, and visualize your family genealogy with an intuitive interface.
          Build comprehensive family trees and preserve your family history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <feature.icon className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to={feature.link}>{feature.linkText}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Get Started
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Begin building your family tree by adding your first family member.
          </p>
          <Button asChild size="lg">
            <Link to="/people/new">
              <Plus className="h-5 w-5 mr-2" />
              Add First Person
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
