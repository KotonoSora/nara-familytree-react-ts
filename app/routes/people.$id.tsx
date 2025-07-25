import type { Route } from "./+types/people.$id";
import { Link, useLoaderData } from "react-router";
import { ArrowLeft, Edit, Calendar, MapPin, User, Heart } from "lucide-react";

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

export function meta({ data }: Route.MetaArgs) {
  const person = data?.person;
  const name = person ? `${person.firstName} ${person.lastName}` : "Person";
  return [
    { title: `${name} - Family Tree` },
    { name: "description", content: `View details for ${name}` },
  ];
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const personId = params.id;

  try {
    // Fetch person from the API
    const response = await fetch(`${context.env.API_URL || 'http://localhost:8787'}/api/people/${personId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Response("Person not found", { status: 404 });
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { person: data.data as Person };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error("Error loading person:", error);
    throw new Response("Failed to load person", { status: 500 });
  }
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString();
}

function getAge(birthDate?: string, deathDate?: string) {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  const age = end.getFullYear() - birth.getFullYear();
  
  return age;
}

export default function PersonDetailPage() {
  const { person } = useLoaderData<typeof loader>();

  const fullName = `${person.firstName} ${person.middleName ? `${person.middleName} ` : ''}${person.lastName}`;
  const age = getAge(person.birthDate, person.deathDate);

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/people">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to People
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <Avatar className="h-20 w-20">
                  {person.profileImage ? (
                    <AvatarImage src={person.profileImage} alt={fullName} />
                  ) : null}
                  <AvatarFallback className="text-xl">
                    {getInitials(person.firstName, person.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{fullName}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {person.gender && (
                      <Badge variant="secondary">
                        {person.gender}
                      </Badge>
                    )}
                    {age && (
                      <Badge variant="outline">
                        {age} years old
                      </Badge>
                    )}
                    {person.deathDate && (
                      <Badge variant="destructive">
                        Deceased
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button asChild>
                      <Link to={`/people/${person.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            {person.bio && (
              <CardContent>
                <h3 className="font-semibold mb-2">Biography</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {person.bio}
                </p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-6">
          {/* Life Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Life Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {person.birthDate && (
                <div className="flex items-start space-x-3">
                  <Heart className="h-4 w-4 text-green-600 mt-1" />
                  <div>
                    <div className="font-medium">Born</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(person.birthDate)}
                    </div>
                  </div>
                </div>
              )}
              {person.deathDate && (
                <div className="flex items-start space-x-3">
                  <Heart className="h-4 w-4 text-gray-600 mt-1" />
                  <div>
                    <div className="font-medium">Died</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(person.deathDate)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          {person.birthPlace && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium">Birth Place</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {person.birthPlace}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Relationships */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Relationships
              </CardTitle>
              <CardDescription>
                Family connections will be shown here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  No relationships added yet
                </div>
                <Button variant="outline" size="sm">
                  Add Relationship
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}