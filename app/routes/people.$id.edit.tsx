import type { Route } from "./+types/people.$id.edit";
import { Form, Link, redirect, useActionData, useLoaderData } from "react-router";
import { ArrowLeft, Save, Trash } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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

export function meta({ data }: Route.MetaArgs) {
  const person = data?.person;
  const name = person ? `${person.firstName} ${person.lastName}` : "Person";
  return [
    { title: `Edit ${name} - Family Tree` },
    { name: "description", content: `Edit details for ${name}` },
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

export async function action({ request, params, context }: Route.ActionArgs) {
  const personId = params.id;
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete") {
    try {
      // Delete the person
      const response = await fetch(`${context.env.API_URL || 'http://localhost:8787'}/api/people/${personId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Redirect to people list
      return redirect("/people");
    } catch (error) {
      console.error("Error deleting person:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to delete person. Please try again.",
      };
    }
  }

  // Update person
  const personData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    middleName: formData.get("middleName") as string || undefined,
    gender: formData.get("gender") as string || undefined,
    birthDate: formData.get("birthDate") as string || undefined,
    deathDate: formData.get("deathDate") as string || undefined,
    birthPlace: formData.get("birthPlace") as string || undefined,
    bio: formData.get("bio") as string || undefined,
  };

  // Validate required fields
  if (!personData.firstName || !personData.lastName) {
    return {
      error: "First name and last name are required",
      values: personData,
    };
  }

  try {
    // Call the API to update the person
    const response = await fetch(`${context.env.API_URL || 'http://localhost:8787'}/api/people/${personId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Person updated successfully:", result.data);
    
    // Redirect to person detail page
    return redirect(`/people/${personId}`);
  } catch (error) {
    console.error("Error updating person:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to update person. Please try again.",
      values: personData,
    };
  }
}

export default function EditPersonPage() {
  const { person } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const fullName = `${person.firstName} ${person.middleName ? `${person.middleName} ` : ''}${person.lastName}`;

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link to={`/people/${person.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {fullName}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Family Member
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Update information for {fullName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update the information for this family member
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  defaultValue={actionData?.values?.firstName || person.firstName}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  defaultValue={actionData?.values?.lastName || person.lastName}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                name="middleName"
                defaultValue={actionData?.values?.middleName || person.middleName || ""}
                placeholder="Enter middle name (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender" defaultValue={actionData?.values?.gender || person.gender || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  defaultValue={actionData?.values?.birthDate || person.birthDate || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deathDate">Death Date</Label>
                <Input
                  id="deathDate"
                  name="deathDate"
                  type="date"
                  defaultValue={actionData?.values?.deathDate || person.deathDate || ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthPlace">Birth Place</Label>
              <Input
                id="birthPlace"
                name="birthPlace"
                defaultValue={actionData?.values?.birthPlace || person.birthPlace || ""}
                placeholder="Enter birth place (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={actionData?.values?.bio || person.bio || ""}
                placeholder="Enter biographical information (optional)"
                rows={4}
              />
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              <Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <Button 
                  type="submit" 
                  variant="destructive" 
                  size="sm"
                  onClick={(e) => {
                    if (!confirm("Are you sure you want to delete this person? This action cannot be undone.")) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Person
                </Button>
              </Form>

              <div className="flex space-x-3">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/people/${person.id}`}>Cancel</Link>
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}