import type { Route } from "./+types/tree";
import { Link, useLoaderData, useNavigate, useSearchParams } from "react-router";
import { TreePine, Users, Plus, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { FamilyTreeVisualization } from "~/components/FamilyTreeVisualization";

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

type Relationship = {
  id: number;
  parentId: number;
  childId: number;
  relationshipType: "biological" | "adopted" | "step" | "foster";
};

type TreeData = {
  person: Person;
  relationships: Relationship[];
  relatedPeople: Person[];
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Family Tree - Family Tree Manager" },
    { name: "description", content: "Visualize your family tree" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const rootPersonId = url.searchParams.get("person");

  try {
    // Fetch all people to populate the selector
    const peopleResponse = await fetch(`${context.env.API_URL || 'http://localhost:8787'}/api/people`);
    
    if (!peopleResponse.ok) {
      console.error("Failed to fetch people:", peopleResponse.status, peopleResponse.statusText);
      return { people: [] as Person[], treeData: null, error: "Failed to load people" };
    }
    
    const peopleData = await peopleResponse.json();
    const people = peopleData.data as Person[];

    let treeData = null;
    
    // If a specific person is selected, fetch their tree data
    if (rootPersonId && !isNaN(parseInt(rootPersonId))) {
      try {
        const treeResponse = await fetch(
          `${context.env.API_URL || 'http://localhost:8787'}/api/relationships/tree/${rootPersonId}`
        );
        
        if (treeResponse.ok) {
          const treeResponseData = await treeResponse.json();
          treeData = treeResponseData.data as TreeData;
        }
      } catch (error) {
        console.error("Error fetching tree data:", error);
      }
    }
    
    return { people, treeData };
  } catch (error) {
    console.error("Error loading tree data:", error);
    return { people: [] as Person[], treeData: null, error: "Failed to load tree data" };
  }
}

function getPersonName(person: Person) {
  return `${person.firstName} ${person.middleName ? `${person.middleName} ` : ''}${person.lastName}`;
}

export default function TreePage() {
  const { people, treeData, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPersonId, setSelectedPersonId] = useState(
    searchParams.get("person") || ""
  );

  const handlePersonSelect = (personId: string) => {
    setSelectedPersonId(personId);
    if (personId) {
      navigate(`/tree?person=${personId}`);
    } else {
      navigate("/tree");
    }
  };

  const handlePersonClick = (personId: number) => {
    navigate(`/people/${personId}`);
  };

  return (
    <div className="px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Family Tree Visualization
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explore your family relationships in an interactive tree format
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Person Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Select Root Person
          </CardTitle>
          <CardDescription>
            Choose a family member to center the tree view around
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedPersonId} onValueChange={handlePersonSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a person to view their family tree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select a person...</SelectItem>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id.toString()}>
                      {getPersonName(person)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {people.length === 0 && (
              <Button asChild>
                <Link to="/people/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Person
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tree Visualization */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TreePine className="h-5 w-5 mr-2" />
            Interactive Family Tree
          </CardTitle>
          <CardDescription>
            Click on family members to view their details. Use the controls to zoom and pan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FamilyTreeVisualization
            treeData={treeData}
            onPersonClick={handlePersonClick}
          />
        </CardContent>
      </Card>

      {!selectedPersonId && people.length > 0 && (
        <div className="text-center py-8">
          <TreePine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select a Person to View Tree
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Choose a family member from the dropdown above to see their family relationships visualized.
          </p>
        </div>
      )}

      {people.length === 0 && (
        <div className="text-center py-12">
          <TreePine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Family Members Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Add family members and create relationships to see your family tree visualization.
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
      )}

      {/* Feature Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Interactive Nodes
            </CardTitle>
            <CardDescription>
              Click on family members to view their detailed profiles and information
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
              Automatically organized tree structure with parents, children, and siblings
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-purple-600" />
              Easy Navigation
            </CardTitle>
            <CardDescription>
              Zoom, pan, and use the minimap to navigate large family trees
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}