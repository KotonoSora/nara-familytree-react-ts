import type { Route } from "./+types/people";
import { Link, useLoaderData } from "react-router";
import { Users, Plus, Eye, Edit, Calendar } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

type Person = {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: "male" | "female" | "other";
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  bio?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "People - Family Tree" },
    { name: "description", content: "Manage family members" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  try {
    // Fetch people from the API
    const response = await fetch(`${context.env.API_URL || 'http://localhost:8787'}/api/people`);
    
    if (!response.ok) {
      console.error("Failed to fetch people:", response.status, response.statusText);
      return { people: [] as Person[], error: "Failed to load people" };
    }
    
    const data = await response.json();
    return { people: data.data as Person[] };
  } catch (error) {
    console.error("Error loading people:", error);
    return { people: [] as Person[], error: "Failed to load people" };
  }
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString();
}

export default function PeoplePage() {
  const { people, error } = useLoaderData<typeof loader>();

  return (
    <div className="px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Family Members
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and view all family members in your tree
          </p>
        </div>
        <Button asChild>
          <Link to="/people/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {people.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No family members yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start building your family tree by adding your first family member.
          </p>
          <Button asChild>
            <Link to="/people/new">
              <Plus className="h-4 w-4 mr-2" />
              Add First Person
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person) => (
            <Card key={person.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    {person.profileImage ? (
                      <AvatarImage src={person.profileImage} alt={`${person.firstName} ${person.lastName}`} />
                    ) : null}
                    <AvatarFallback>
                      {getInitials(person.firstName, person.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {person.firstName} {person.middleName && `${person.middleName} `}{person.lastName}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {person.gender && (
                        <Badge variant="secondary" className="text-xs">
                          {person.gender}
                        </Badge>
                      )}
                      {person.birthDate && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(person.birthDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {person.birthPlace && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    📍 {person.birthPlace}
                  </p>
                )}
                {person.bio && (
                  <CardDescription className="line-clamp-2 mb-4">
                    {person.bio}
                  </CardDescription>
                )}
                <div className="flex space-x-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/people/${person.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/people/${person.id}/edit`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}