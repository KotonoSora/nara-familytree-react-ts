import {
  Command,
  Download,
  Edit,
  Link,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { FC } from "react";
import type { CanvasConnection, CanvasNode } from "./FamilyTreeCanvas";
import type { ActionMenuItem } from "./NotebookActions";
import type { Person } from "./PersonNode";
import type { Relationship } from "./RelationshipEditorModal";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

import { FamilyTreeCanvas } from "./FamilyTreeCanvas";
import {
  ActionToolbar,
  CommandPalette,
  ContextActionMenu,
  FloatingActionButton,
  getCanvasActions,
  getPersonActions,
  useNotebookActions,
} from "./NotebookActions";
import { PersonEditorModal } from "./PersonEditorModal";
import { PersonNode } from "./PersonNode";
import { RelationshipEditorModal } from "./RelationshipEditorModal";
import { sampleFamilyData } from "./sampleData";

interface FamilyTreeEditorProps {
  className?: string;
  people?: Person[];
  relationships?: Relationship[];
  onPeopleChange?: (people: Person[]) => void;
  onRelationshipsChange?: (relationships: Relationship[]) => void;
}

export const FamilyTreeEditor: FC<FamilyTreeEditorProps> = ({
  className,
  people = [],
  relationships = [],
  onPeopleChange,
  onRelationshipsChange,
}) => {
  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showGridCoordinates, setShowGridCoordinates] = useState(false);

  // Modal state
  const [personModal, setPersonModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    person?: Person;
  }>({ isOpen: false, mode: "create" });

  const [relationshipModal, setRelationshipModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    relationship?: Relationship;
    preselectedPersonId?: string;
  }>({ isOpen: false, mode: "create" });

  // Notebook actions
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
  } = useNotebookActions();

  // Sample data for testing (remove when connecting to real data)
  const [samplePeople, setSamplePeople] = useState<Person[]>(
    sampleFamilyData.people,
  );
  const [sampleRelationships, setSampleRelationships] = useState<
    Relationship[]
  >(sampleFamilyData.relationships);

  // Use provided data or sample data
  const activePeople = people.length > 0 ? people : samplePeople;
  const activeRelationships =
    relationships.length > 0 ? relationships : sampleRelationships;

  // Modal handlers
  const handleSavePerson = useCallback(
    (person: Person) => {
      setSamplePeople((prev) => {
        const existing = prev.find((p) => p.id === person.id);
        if (existing) {
          return prev.map((p) => (p.id === person.id ? person : p));
        } else {
          return [...prev, person];
        }
      });
      onPeopleChange?.(activePeople);
    },
    [activePeople, onPeopleChange],
  );

  const handleSaveRelationship = useCallback(
    (relationship: Relationship) => {
      setSampleRelationships((prev) => {
        const existing = prev.find((r) => r.id === relationship.id);
        if (existing) {
          return prev.map((r) => (r.id === relationship.id ? relationship : r));
        } else {
          return [...prev, relationship];
        }
      });
      onRelationshipsChange?.(activeRelationships);
    },
    [activeRelationships, onRelationshipsChange],
  );

  // Handle node movement on canvas
  const handleNodeMove = useCallback(
    (nodeId: string, x: number, y: number) => {
      setSamplePeople((prev) =>
        prev.map((person) =>
          person.id === nodeId ? { ...person, canvasX: x, canvasY: y } : person,
        ),
      );
      onPeopleChange?.(activePeople);
    },
    [activePeople, onPeopleChange],
  );

  // Action handler
  const handleAction = useCallback(
    (actionId: string, personId?: string) => {
      switch (actionId) {
        case "add-person":
          setPersonModal({
            isOpen: true,
            mode: "create",
          });
          break;
        case "edit-person":
          if (personId) {
            const person = activePeople.find((p) => p.id === personId);
            if (person) {
              setPersonModal({
                isOpen: true,
                mode: "edit",
                person,
              });
            }
          }
          break;
        case "delete-person":
          if (personId) {
            setSamplePeople((prev) => prev.filter((p) => p.id !== personId));
            setSampleRelationships((prev) =>
              prev.filter(
                (r) => r.person1Id !== personId && r.person2Id !== personId,
              ),
            );
          }
          break;
        case "add-relationship":
          setRelationshipModal({
            isOpen: true,
            mode: "create",
            preselectedPersonId: personId,
          });
          break;
        case "pan-mode":
          // Toggle pan mode
          break;
        case "zoom-in":
          setZoom((prev) => Math.min(3, prev * 1.2));
          break;
        case "zoom-out":
          setZoom((prev) => Math.max(0.1, prev * 0.8));
          break;
        case "fit-canvas":
          setZoom(1);
          setPanX(0);
          setPanY(0);
          break;
        case "canvas-settings":
          // Open canvas settings
          break;
        case "toggle-grid-coordinates":
          setShowGridCoordinates((prev) => !prev);
          break;
        case "center-nodes":
          // Center all nodes in the visible viewport area
          setSamplePeople((prev) =>
            prev.map((person, index) => {
              const startX = 400;
              const startY = 300;
              return {
                ...person,
                canvasX: startX + (index % 5) * 250,
                canvasY: startY + Math.floor(index / 5) * 200,
              };
            }),
          );
          // Reset zoom and pan to show the centered nodes
          setZoom(1);
          setPanX(0);
          setPanY(0);
          break;
        case "theme-settings":
          // Open theme settings
          break;
        default:
          console.log("Unhandled action:", actionId);
      }
    },
    [activePeople],
  );

  // Add keyboard event listeners for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when canvas is focused or no input is focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "g":
            e.preventDefault();
            setShowGridCoordinates((prev) => !prev);
            break;
          case "c":
            if (e.shiftKey) {
              e.preventDefault();
              handleAction("center-nodes");
            }
            break;
          case "n":
            e.preventDefault();
            handleAction("add-person");
            break;
          case "r":
            e.preventDefault();
            handleAction("add-relationship");
            break;
          case "k":
            e.preventDefault();
            openCommandPalette();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleAction, openCommandPalette]);

  // Convert people to canvas nodes with better positioning
  const canvasNodes: CanvasNode[] = useMemo(() => {
    return activePeople.map((person, index) => {
      // Use stored canvas position if available, otherwise use generated layout
      let x = person.canvasX;
      let y = person.canvasY;
      let width = person.canvasWidth || 280;
      let height = person.canvasHeight || 160;

      // If no stored position, generate layout position (only once)
      if (x === undefined || y === undefined) {
        // Position nodes closer to the default view (0,0) but with some offset
        // This ensures they're visible when zoom=1 and pan=(0,0)
        const baseOffsetX = 400; // Start at 400px from left edge
        const baseOffsetY = 300; // Start at 300px from top edge

        // Simple layout algorithm - arrange by generation
        const birthYear = person.birthDate
          ? parseInt(person.birthDate.split("-")[0])
          : 1980;

        if (birthYear < 1940) {
          // Great-grandparents generation
          y = baseOffsetY;
          x = baseOffsetX + (index % 4) * 300;
        } else if (birthYear < 1960) {
          // Grandparents generation
          y = baseOffsetY + 200;
          x = baseOffsetX + (index % 4) * 300;
        } else if (birthYear < 1985) {
          // Parents generation
          y = baseOffsetY + 400;
          x = baseOffsetX + (index % 4) * 300;
        } else if (birthYear < 2005) {
          // Current adult generation
          y = baseOffsetY + 600;
          x = baseOffsetX + (index % 5) * 250;
        } else {
          // Children generation
          y = baseOffsetY + 800;
          x = baseOffsetX + (index % 6) * 200;
        }

        // Add consistent offset based on person ID for stable positioning
        const hashCode = person.id.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
        x = x + (Math.abs(hashCode) % 50);
        y = y + (Math.abs(hashCode >> 5) % 50);
      }
      return {
        id: person.id,
        x: x || 400, // Default to visible area
        y: y || 300, // Default to visible area
        width,
        height,
        content: (
          <ContextActionMenu
            items={getPersonActions(person.id).map((action) => ({
              ...action,
              action: () => handleAction(action.id, person.id),
            }))}
            onAction={(actionId) => handleAction(actionId, person.id)}
          >
            <PersonNode
              person={person}
              isSelected={selectedNodeId === person.id}
              onClick={() => setSelectedNodeId(person.id)}
              onDoubleClick={() => {
                setPersonModal({
                  isOpen: true,
                  mode: "edit",
                  person,
                });
              }}
              compact={true}
              containerWidth={width}
              containerHeight={height}
            />
          </ContextActionMenu>
        ),
      };
    });
  }, [
    activePeople,
    selectedNodeId,
    handleAction,
    setSelectedNodeId,
    setPersonModal,
  ]);

  // Convert relationships to canvas connections
  const canvasConnections: CanvasConnection[] = useMemo(() => {
    return activeRelationships.map((relationship) => ({
      id: relationship.id,
      fromNodeId: relationship.person1Id,
      toNodeId: relationship.person2Id,
      style: relationship.connectionStyle || "curved",
      color: relationship.connectionColor || "#333333",
      width: relationship.connectionWidth || 2,
    }));
  }, [activeRelationships]);

  // Generate all available actions
  const allActions: ActionMenuItem[] = [
    ...getPersonActions(selectedNodeId || undefined).map((action) => ({
      ...action,
      action: () => handleAction(action.id, selectedNodeId || undefined),
    })),
    ...getCanvasActions().map((action) => ({
      ...action,
      action: () => handleAction(action.id),
    })),
  ];

  // Toolbar actions (most common ones)
  const toolbarActions: ActionMenuItem[] = [
    {
      id: "add-person",
      label: "Add Person",
      icon: <Users className="h-4 w-4" />,
      action: () => handleAction("add-person"),
      shortcut: "Ctrl+N",
      category: "Create",
    },
    {
      id: "add-relationship",
      label: "Add Relationship",
      icon: <Link className="h-4 w-4" />,
      action: () => handleAction("add-relationship"),
      shortcut: "Ctrl+R",
      category: "Create",
    },
    {
      id: "command-palette",
      label: "Command Palette",
      icon: <Command className="h-4 w-4" />,
      action: () => openCommandPalette(),
      shortcut: "Ctrl+K",
      category: "Navigation",
    },
  ];

  return (
    <div className={cn("relative w-full h-full bg-background", className)}>
      {/* Main Canvas */}
      <FamilyTreeCanvas
        nodes={canvasNodes}
        connections={canvasConnections}
        onNodeMove={handleNodeMove}
        onNodeSelect={setSelectedNodeId}
        selectedNodeId={selectedNodeId || undefined}
        zoom={zoom}
        panX={panX}
        panY={panY}
        onZoomChange={setZoom}
        onPanChange={(x, y) => {
          setPanX(x);
          setPanY(y);
        }}
        canvasWidth={10000}
        canvasHeight={8000}
        backgroundColor="var(--background)"
        showGridCoordinates={showGridCoordinates}
      />

      {/* Top Toolbar */}
      <div className="absolute top-4 left-4">
        <ActionToolbar
          actions={toolbarActions}
          onAction={handleAction}
          orientation="horizontal"
        />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => handleAction("add-person")}
        icon={<Plus className="h-5 w-5" />}
        tooltip="Add New Person (Ctrl+N)"
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={closeCommandPalette}
        onAction={handleAction}
        actions={allActions}
      />

      {/* Person Editor Modal */}
      <PersonEditorModal
        isOpen={personModal.isOpen}
        onClose={() => setPersonModal({ isOpen: false, mode: "create" })}
        onSave={handleSavePerson}
        person={personModal.person}
        mode={personModal.mode}
      />

      {/* Relationship Editor Modal */}
      <RelationshipEditorModal
        isOpen={relationshipModal.isOpen}
        onClose={() => setRelationshipModal({ isOpen: false, mode: "create" })}
        onSave={handleSaveRelationship}
        people={activePeople}
        relationship={relationshipModal.relationship}
        mode={relationshipModal.mode}
        preselectedPersonId={relationshipModal.preselectedPersonId}
      />

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4">
        <Card className="px-3 py-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {activePeople.length} people
            </div>
            <div className="flex items-center gap-1">
              <Link className="h-4 w-4" />
              {activeRelationships.length} relationships
            </div>
            {selectedNodeId && (
              <div className="flex items-center gap-1 text-primary">
                <Edit className="h-4 w-4" />
                Selected:{" "}
                {activePeople.find((p) => p.id === selectedNodeId)?.firstName}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
