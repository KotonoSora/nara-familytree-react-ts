import type { Route } from "./+types/relationships.new";
import { Form, Link, redirect, useActionData, useLoaderData } from "react-router";
import { ArrowLeft, Save, Users } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

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
    { title: "Add Relationship - Family Tree" },
    { name: "description", content: "Add a new family relationship" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  try {
    // Fetch all people to populate the select options
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

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  
  const relationshipData = {
    parentId: parseInt(formData.get("parentId") as string),
    childId: parseInt(formData.get("childId") as string),
    relationshipType: formData.get("relationshipType") as string || "biological",
  };

  // Validate required fields
  if (!relationshipData.parentId || !relationshipData.childId) {
    return {
      error: "Both parent and child must be selected",
      values: relationshipData,
    };
  }

  if (relationshipData.parentId === relationshipData.childId) {
    return {
      error: "Parent and child cannot be the same person",
      values: relationshipData,
    };
  }

  try {
    // Call the API to create the relationship
    const response = await fetch(`${context.env.API_URL || 'http://localhost:8787'}/api/relationships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(relationshipData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Relationship created successfully:", result.data);
    
    // Redirect to relationships list
    return redirect("/relationships");
  } catch (error) {
    console.error("Error creating relationship:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create relationship. Please try again.",
      values: relationshipData,
    };
  }
}

function getPersonName(person: Person) {
  return `${person.firstName} ${person.middleName ? `${person.middleName} ` : ''}${person.lastName}`;
}

function getPersonAge(person: Person) {
  if (!person.birthDate) return "";
  
  const birth = new Date(person.birthDate);
  const end = person.deathDate ? new Date(person.deathDate) : new Date();
  const age = end.getFullYear() - birth.getFullYear();
  
  return ` (${age} years old)`;
}

export default function NewRelationshipPage() {
  const { people, error: loadError } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/relationships">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Relationships
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Add Family Relationship
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create a parent-child relationship between family members
        </p>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {loadError}
        </div>
      )}

      {people.length < 2 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Not Enough Family Members
            </CardTitle>
            <CardDescription>
              You need at least 2 family members to create a relationship.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You currently have {people.length} family member{people.length !== 1 ? 's' : ''} in your tree. 
              Add more family members first to create relationships between them.
            </p>
            <Button asChild>
              <Link to="/people/new">
                <Users className="h-4 w-4 mr-2" />
                Add Family Member
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Relationship Information</CardTitle>
            <CardDescription>
              Select the parent and child, and specify the type of relationship
            </CardDescription>
          </CardHeader>
          <CardContent>
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {actionData.error}
              </div>
            )}

            <Form method="post" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="parentId">Parent *</Label>
                <Select 
                  name="parentId" 
                  defaultValue={actionData?.values?.parentId?.toString() || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select the parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        {getPersonName(person)}{getPersonAge(person)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="childId">Child *</Label>
                <Select 
                  name="childId" 
                  defaultValue={actionData?.values?.childId?.toString() || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select the child" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        {getPersonName(person)}{getPersonAge(person)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationshipType">Relationship Type</Label>
                <Select 
                  name="relationshipType" 
                  defaultValue={actionData?.values?.relationshipType || "biological"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biological">Biological</SelectItem>
                    <SelectItem value="adopted">Adopted</SelectItem>
                    <SelectItem value="step">Step</SelectItem>
                    <SelectItem value="foster">Foster</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                <div className="text-sm">
                  <strong>Note:</strong> This will create a parent-child relationship. 
                  Make sure you've selected the correct parent and child before saving.
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" asChild>
                  <Link to="/relationships">Cancel</Link>
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Create Relationship
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}