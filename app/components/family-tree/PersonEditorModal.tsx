import {
  Calendar,
  FileText,
  MapPin,
  Palette,
  Save,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { FC } from "react";
import type { Person } from "./PersonNode";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

interface PersonEditorModalProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Person) => void;
  person?: Person;
  mode?: "create" | "edit";
}

export const PersonEditorModal: FC<PersonEditorModalProps> = ({
  className,
  isOpen,
  onClose,
  onSave,
  person,
  mode = "create",
}) => {
  const [formData, setFormData] = useState<Partial<Person>>({
    firstName: "",
    lastName: "",
    middleName: "",
    nickname: "",
    birthDate: "",
    birthPlace: "",
    deathDate: "",
    deathPlace: "",
    gender: "unknown",
    photo: "",
    notes: "",
  });

  const [activeTab, setActiveTab] = useState<
    "basic" | "life" | "appearance" | "notes"
  >("basic");

  useEffect(() => {
    if (person) {
      setFormData(person);
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        middleName: "",
        nickname: "",
        birthDate: "",
        birthPlace: "",
        deathDate: "",
        deathPlace: "",
        gender: "unknown",
        photo: "",
        notes: "",
      });
    }
  }, [person, isOpen]);

  const handleSave = () => {
    if (!formData.firstName?.trim()) {
      alert("First name is required");
      return;
    }

    const savedPerson: Person = {
      id: person?.id || `person-${Date.now()}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName?.trim() || undefined,
      middleName: formData.middleName?.trim() || undefined,
      nickname: formData.nickname?.trim() || undefined,
      birthDate: formData.birthDate?.trim() || undefined,
      birthPlace: formData.birthPlace?.trim() || undefined,
      deathDate: formData.deathDate?.trim() || undefined,
      deathPlace: formData.deathPlace?.trim() || undefined,
      gender: formData.gender || "unknown",
      photo: formData.photo?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    onSave(savedPerson);
    onClose();
  };

  const updateField = (field: keyof Person, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <User size={16} /> },
    { id: "life", label: "Life Events", icon: <Calendar size={16} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
    { id: "notes", label: "Notes", icon: <FileText size={16} /> },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[90vh] overflow-hidden",
          "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
          "shadow-2xl backdrop-blur-sm",
          className,
        )}
      >
        {/* Enhanced Header */}
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary dark:text-primary-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {mode === "create" ? "Add New Person" : "Edit Person"}
            </DialogTitle>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 mt-2">
            <div className="px-2 py-1 bg-secondary dark:bg-gray-700 rounded-full text-xs text-muted-foreground dark:text-gray-400">
              {mode === "create"
                ? "Creating new family member"
                : "Editing existing member"}
            </div>
          </div>
        </DialogHeader>

        {/* Enhanced Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="w-full flex-1 flex flex-col"
        >
          <TabsList
            className={cn(
              "grid w-full grid-cols-4 mb-4",
              "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            )}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-2 text-xs transition-all duration-200",
                  "data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900",
                  "data-[state=active]:text-primary dark:data-[state=active]:text-primary-400",
                  "data-[state=active]:shadow-sm",
                  "hover:bg-white/50 dark:hover:bg-gray-700/50",
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Enhanced Content Container */}
          <div className="overflow-y-auto max-h-96 flex-1 bg-gray-50/30 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <TabsContent value="basic" className="space-y-4 mt-0">
              {/* Enhanced Basic Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName || ""}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      placeholder="Enter first name"
                      required
                      className={cn(
                        "border-gray-300 dark:border-gray-600",
                        "bg-white dark:bg-gray-800",
                        "focus:ring-primary/20 dark:focus:ring-primary/30",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName || ""}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      placeholder="Enter last name"
                      className={cn(
                        "border-gray-300 dark:border-gray-600",
                        "bg-white dark:bg-gray-800",
                        "focus:ring-primary/20 dark:focus:ring-primary/30",
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="middleName"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Middle Name
                    </Label>
                    <Input
                      id="middleName"
                      value={formData.middleName || ""}
                      onChange={(e) =>
                        updateField("middleName", e.target.value)
                      }
                      placeholder="Enter middle name"
                      className={cn(
                        "border-gray-300 dark:border-gray-600",
                        "bg-white dark:bg-gray-800",
                        "focus:ring-primary/20 dark:focus:ring-primary/30",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="nickname"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Nickname
                    </Label>
                    <Input
                      id="nickname"
                      value={formData.nickname || ""}
                      onChange={(e) => updateField("nickname", e.target.value)}
                      placeholder="Enter nickname"
                      className={cn(
                        "border-gray-300 dark:border-gray-600",
                        "bg-white dark:bg-gray-800",
                        "focus:ring-primary/20 dark:focus:ring-primary/30",
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Gender
                  </Label>
                  <Select
                    value={formData.gender || "unknown"}
                    onValueChange={(value) =>
                      updateField("gender", value as Person["gender"])
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "border-gray-300 dark:border-gray-600",
                        "bg-white dark:bg-gray-800",
                      )}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unknown">Unknown</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="life" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate || ""}
                    onChange={(e) => updateField("birthDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deathDate">Death Date</Label>
                  <Input
                    id="deathDate"
                    type="date"
                    value={formData.deathDate || ""}
                    onChange={(e) => updateField("deathDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Birth Place</Label>
                  <Input
                    id="birthPlace"
                    value={formData.birthPlace || ""}
                    onChange={(e) => updateField("birthPlace", e.target.value)}
                    placeholder="Enter birth place"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deathPlace">Death Place</Label>
                  <Input
                    id="deathPlace"
                    value={formData.deathPlace || ""}
                    onChange={(e) => updateField("deathPlace", e.target.value)}
                    placeholder="Enter death place"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="photo">Photo URL</Label>
                <Input
                  id="photo"
                  type="url"
                  value={formData.photo || ""}
                  onChange={(e) => updateField("photo", e.target.value)}
                  placeholder="Enter photo URL"
                />
              </div>

              {formData.photo && (
                <div className="mt-4">
                  <Label>Photo Preview</Label>
                  <div className="mt-2 w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Enter any additional notes or information..."
                  rows={6}
                />
              </div>
            </TabsContent>
          </div>

          {/* Enhanced Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>All changes are saved automatically</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className={cn(
                  "border-gray-300 dark:border-gray-600",
                  "hover:bg-gray-50 dark:hover:bg-gray-700",
                  "text-gray-700 dark:text-gray-300",
                )}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className={cn(
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground",
                  "shadow-sm hover:shadow-md transition-all duration-200",
                )}
              >
                <Save className="h-4 w-4 mr-2" />
                {mode === "create" ? "Add Person" : "Save Changes"}
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
