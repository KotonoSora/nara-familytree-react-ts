import { Baby, Heart, Link, Save, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { FC } from "react";
import type { Person } from "./PersonNode";

import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Slider } from "~/components/ui/slider";
import { cn } from "~/lib/utils";

export interface Relationship {
  id: string;
  person1Id: string;
  person2Id: string;
  relationshipType:
    | "parent-child"
    | "spouse"
    | "sibling"
    | "divorced"
    | "partner"
    | "step-parent"
    | "step-child"
    | "step-sibling"
    | "adopted-parent"
    | "adopted-child"
    | "guardian"
    | "ward"
    | "other";
  startDate?: string;
  endDate?: string;
  notes?: string;
  connectionStyle?: "straight" | "curved" | "stepped";
  connectionColor?: string;
  connectionWidth?: number;
}

interface RelationshipEditorModalProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (relationship: Relationship) => void;
  people: Person[];
  relationship?: Relationship;
  mode?: "create" | "edit";
  preselectedPersonId?: string;
}

export const RelationshipEditorModal: FC<RelationshipEditorModalProps> = ({
  className,
  isOpen,
  onClose,
  onSave,
  people,
  relationship,
  mode = "create",
  preselectedPersonId,
}) => {
  const [formData, setFormData] = useState<Partial<Relationship>>({
    person1Id: "",
    person2Id: "",
    relationshipType: "parent-child",
    startDate: "",
    endDate: "",
    notes: "",
    connectionStyle: "curved",
    connectionColor: "#333333",
    connectionWidth: 2,
  });

  const [activeTab, setActiveTab] = useState<"basic" | "visual">("basic");

  useEffect(() => {
    if (relationship) {
      setFormData(relationship);
    } else {
      setFormData({
        person1Id: preselectedPersonId || "",
        person2Id: "",
        relationshipType: "parent-child",
        startDate: "",
        endDate: "",
        notes: "",
        connectionStyle: "curved",
        connectionColor: "#333333",
        connectionWidth: 2,
      });
    }
  }, [relationship, isOpen, preselectedPersonId]);

  const handleSave = () => {
    if (!formData.person1Id || !formData.person2Id) {
      alert("Please select both people for the relationship");
      return;
    }

    if (formData.person1Id === formData.person2Id) {
      alert("A person cannot have a relationship with themselves");
      return;
    }

    const savedRelationship: Relationship = {
      id: relationship?.id || `rel-${Date.now()}`,
      person1Id: formData.person1Id!,
      person2Id: formData.person2Id!,
      relationshipType: formData.relationshipType!,
      startDate: formData.startDate?.trim() || undefined,
      endDate: formData.endDate?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      connectionStyle: formData.connectionStyle || "curved",
      connectionColor: formData.connectionColor || "#333333",
      connectionWidth: formData.connectionWidth || 2,
    };

    onSave(savedRelationship);
    onClose();
  };

  const updateField = (field: keyof Relationship, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getPersonName = (personId: string) => {
    const person = people.find((p) => p.id === personId);
    if (!person) return "Unknown";
    return [person.firstName, person.lastName].filter(Boolean).join(" ");
  };

  const getRelationshipIcon = (type: Relationship["relationshipType"]) => {
    switch (type) {
      case "parent-child":
      case "step-parent":
      case "step-child":
      case "adopted-parent":
      case "adopted-child":
        return <Baby className="h-4 w-4" />;
      case "spouse":
      case "partner":
        return <Heart className="h-4 w-4" />;
      case "sibling":
      case "step-sibling":
        return <Users className="h-4 w-4" />;
      default:
        return <Link className="h-4 w-4" />;
    }
  };

  const getRelationshipVariant = (type: Relationship["relationshipType"]) => {
    switch (type) {
      case "spouse":
      case "partner":
        return "destructive" as const;
      case "parent-child":
      case "step-parent":
      case "step-child":
      case "adopted-parent":
      case "adopted-child":
        return "default" as const;
      case "sibling":
      case "step-sibling":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const relationshipTypes = [
    { value: "parent-child", label: "Parent-Child", category: "Family" },
    { value: "spouse", label: "Spouse", category: "Partnership" },
    { value: "partner", label: "Partner", category: "Partnership" },
    { value: "sibling", label: "Sibling", category: "Family" },
    { value: "divorced", label: "Divorced", category: "Partnership" },
    { value: "step-parent", label: "Step-Parent", category: "Family" },
    { value: "step-child", label: "Step-Child", category: "Family" },
    { value: "step-sibling", label: "Step-Sibling", category: "Family" },
    { value: "adopted-parent", label: "Adopted Parent", category: "Family" },
    { value: "adopted-child", label: "Adopted Child", category: "Family" },
    { value: "guardian", label: "Guardian", category: "Legal" },
    { value: "ward", label: "Ward", category: "Legal" },
    { value: "other", label: "Other", category: "Other" },
  ];

  const availablePeople = people.filter(p => p.id !== formData.person1Id && p.id !== formData.person2Id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            {mode === "create" ? "Create Relationship" : "Edit Relationship"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Visual Style
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-96 pt-4">
            <TabsContent value="basic" className="space-y-4 mt-0">
              {/* People Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="person1">First Person</Label>
                  <Select
                    value={formData.person1Id || ""}
                    onValueChange={(value) => updateField("person1Id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select first person" />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {getPersonName(person.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="person2">Second Person</Label>
                  <Select
                    value={formData.person2Id || ""}
                    onValueChange={(value) => updateField("person2Id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select second person" />
                    </SelectTrigger>
                    <SelectContent>
                      {people.filter(p => p.id !== formData.person1Id).map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {getPersonName(person.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Relationship Preview */}
              {formData.person1Id && formData.person2Id && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Relationship Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Badge variant="outline">{getPersonName(formData.person1Id)}</Badge>
                      <div className="flex items-center gap-1">
                        {getRelationshipIcon(formData.relationshipType!)}
                        <Badge variant={getRelationshipVariant(formData.relationshipType!)}>
                          {relationshipTypes.find(r => r.value === formData.relationshipType)?.label}
                        </Badge>
                      </div>
                      <Badge variant="outline">{getPersonName(formData.person2Id)}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Relationship Type */}
              <div className="space-y-2">
                <Label htmlFor="relationshipType">Relationship Type</Label>
                <Select
                  value={formData.relationshipType || "parent-child"}
                  onValueChange={(value) => updateField("relationshipType", value as Relationship["relationshipType"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Family", "Partnership", "Legal", "Other"].map((category) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                          {category}
                        </div>
                        {relationshipTypes
                          .filter((type) => type.category === category)
                          .map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                {getRelationshipIcon(type.value as Relationship["relationshipType"])}
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => updateField("startDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) => updateField("endDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Additional information about this relationship..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="visual" className="space-y-4 mt-0">
              {/* Connection Style */}
              <div className="space-y-2">
                <Label htmlFor="connectionStyle">Connection Style</Label>
                <Select
                  value={formData.connectionStyle || "curved"}
                  onValueChange={(value) => updateField("connectionStyle", value as Relationship["connectionStyle"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select connection style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight">Straight Line</SelectItem>
                    <SelectItem value="curved">Curved Line</SelectItem>
                    <SelectItem value="stepped">Stepped Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Connection Color */}
              <div className="space-y-2">
                <Label htmlFor="connectionColor">Connection Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="connectionColor"
                    type="color"
                    value={formData.connectionColor || "#333333"}
                    onChange={(e) => updateField("connectionColor", e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={formData.connectionColor || "#333333"}
                    onChange={(e) => updateField("connectionColor", e.target.value)}
                    placeholder="#333333"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Connection Width */}
              <div className="space-y-2">
                <Label htmlFor="connectionWidth">
                  Connection Width: {formData.connectionWidth || 2}px
                </Label>
                <Slider
                  value={[formData.connectionWidth || 2]}
                  onValueChange={(value) => updateField("connectionWidth", value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Visual Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Connection Preview</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-20 bg-gray-50 rounded border flex items-center justify-center">
                    <svg width="200" height="60" viewBox="0 0 200 60">
                      <line
                        x1="20"
                        y1="30"
                        x2="180"
                        y2="30"
                        stroke={formData.connectionColor || "#333333"}
                        strokeWidth={formData.connectionWidth || 2}
                        strokeDasharray={formData.connectionStyle === "stepped" ? "5,5" : "none"}
                      />
                      <circle cx="20" cy="30" r="4" fill="#cbd5e1" />
                      <circle cx="180" cy="30" r="4" fill="#cbd5e1" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {mode === "create" ? "Create Relationship" : "Save Changes"}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
