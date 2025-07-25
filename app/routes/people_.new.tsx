import type { Route } from "./+types/people.new";
import { Form, Link, redirect, useActionData } from "react-router";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Add Person - Family Tree" },
    { name: "description", content: "Add a new family member" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  
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
    // In a real app, we'd call the API
    // For now, just simulate success
    console.log("Would create person:", personData);
    
    // Redirect to people list
    return redirect("/people");
  } catch (error) {
    console.error("Error creating person:", error);
    return {
      error: "Failed to create person. Please try again.",
      values: personData,
    };
  }
}

export default function NewPersonPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/people">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to People
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Add Family Member
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Add a new person to your family tree
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Enter the basic information for the new family member
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
                  defaultValue={actionData?.values?.firstName || ""}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  defaultValue={actionData?.values?.lastName || ""}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                name="middleName"
                defaultValue={actionData?.values?.middleName || ""}
                placeholder="Enter middle name (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender" defaultValue={actionData?.values?.gender || ""}>
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
                  defaultValue={actionData?.values?.birthDate || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deathDate">Death Date</Label>
                <Input
                  id="deathDate"
                  name="deathDate"
                  type="date"
                  defaultValue={actionData?.values?.deathDate || ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthPlace">Birth Place</Label>
              <Input
                id="birthPlace"
                name="birthPlace"
                defaultValue={actionData?.values?.birthPlace || ""}
                placeholder="Enter birth place (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={actionData?.values?.bio || ""}
                placeholder="Enter biographical information (optional)"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" asChild>
                <Link to="/people">Cancel</Link>
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Person
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}