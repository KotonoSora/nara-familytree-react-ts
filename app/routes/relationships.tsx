import type { Route } from "./+types/relationships";
import { Link, useLoaderData } from "react-router";
import { Users, Plus, Eye, Trash, Heart } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

type Person = {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
};

type Relationship = {
  id: number;
  parentId: number;
  childId: number;
  relationshipType: "biological" | "adopted" | "step" | "foster";
  parent: Person;
  child: Person;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Relationships - Family Tree" },
    { name: "description", content: "Manage family relationships" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  try {
    // For now, fetch all people to get relationships
    // In a real app, we'd have a specific endpoint for all relationships
    const peopleResponse = await fetch(`${context.env.API_URL || 'http://localhost:8787'}/api/people`);
    
    if (!peopleResponse.ok) {
      console.error("Failed to fetch people:", peopleResponse.status, peopleResponse.statusText);
      return { relationships: [] as Relationship[], error: "Failed to load relationships" };
    }
    
    const peopleData = await peopleResponse.json();
    const people = peopleData.data;

    // Get relationships for all people
    const allRelationships: Relationship[] = [];
    
    for (const person of people) {
      try {
        const relationshipsResponse = await fetch(
          `${context.env.API_URL || 'http://localhost:8787'}/api/relationships/person/${person.id}`
        );
        
        if (relationshipsResponse.ok) {
          const relationshipsData = await relationshipsResponse.json();
          allRelationships.push(...relationshipsData.data);
        }
      } catch (error) {
        console.error(`Error fetching relationships for person ${person.id}:`, error);
      }
    }

    // Remove duplicates (since each relationship appears for both parent and child)
    const uniqueRelationships = allRelationships.filter((rel, index, arr) => 
      arr.findIndex(r => r.id === rel.id) === index
    );

    return { relationships: uniqueRelationships, people };
  } catch (error) {
    console.error("Error loading relationships:", error);
    return { relationships: [] as Relationship[], people: [], error: "Failed to load relationships" };
  }
}

function getPersonName(person: Person) {
  return `${person.firstName} ${person.lastName}`;
}

function getRelationshipTypeLabel(type: string) {
  switch (type) {
    case "biological":
      return "Biological";
    case "adopted":
      return "Adopted";
    case "step":
      return "Step";
    case "foster":
      return "Foster";
    default:
      return type;
  }
}

function getRelationshipTypeColor(type: string) {
  switch (type) {
    case "biological":
      return "bg-blue-100 text-blue-800";
    case "adopted":
      return "bg-green-100 text-green-800";
    case "step":
      return "bg-purple-100 text-purple-800";
    case "foster":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function RelationshipsPage() {
  const { relationships, people, error } = useLoaderData<typeof loader>();

  return (
    <div className="px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Family Relationships
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage parent-child relationships in your family tree
          </p>
        </div>
        <Button asChild>
          <Link to="/relationships/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Relationship
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {relationships.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No relationships yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start connecting your family members by adding parent-child relationships.
          </p>
          <Button asChild>
            <Link to="/relationships/new">
              <Plus className="h-4 w-4 mr-2" />
              Add First Relationship
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relationships.map((relationship) => (
            <Card key={relationship.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    Parent-Child
                  </CardTitle>
                  <Badge 
                    className={`text-xs ${getRelationshipTypeColor(relationship.relationshipType)}`}
                  >
                    {getRelationshipTypeLabel(relationship.relationshipType)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Parent
                    </div>
                    <Link 
                      to={`/people/${relationship.parentId}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {getPersonName(relationship.parent)}
                    </Link>
                  </div>
                  
                  <div className="text-center text-gray-400">
                    ↓
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Child
                    </div>
                    <Link 
                      to={`/people/${relationship.childId}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {getPersonName(relationship.child)}
                    </Link>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4 pt-4 border-t">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/relationships/${relationship.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this relationship?")) {
                        // TODO: Implement delete functionality
                        console.log("Delete relationship:", relationship.id);
                      }
                    }}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {relationships.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Family Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {people?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Biological Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {relationships.filter(r => r.relationshipType === "biological").length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}