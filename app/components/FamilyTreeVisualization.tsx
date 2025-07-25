import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  ConnectionMode,
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

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

interface FamilyTreeVisualizationProps {
  treeData: TreeData | null;
  onPersonClick?: (personId: number) => void;
}

// Custom node component for family members
function PersonNode({ data, selected }: NodeProps) {
  const person = data.person as Person;
  
  function getInitials(firstName: string, lastName: string) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  function getAge(birthDate?: string, deathDate?: string) {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    
    return age;
  }

  const fullName = `${person.firstName} ${person.lastName}`;
  const age = getAge(person.birthDate, person.deathDate);

  return (
    <Card className={`min-w-[200px] cursor-pointer transition-all ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            {person.profileImage ? (
              <AvatarImage src={person.profileImage} alt={fullName} />
            ) : null}
            <AvatarFallback className="text-sm">
              {getInitials(person.firstName, person.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{fullName}</div>
            <div className="flex items-center space-x-1 mt-1">
              {person.gender && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {person.gender}
                </Badge>
              )}
              {age && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {age}
                </Badge>
              )}
              {person.deathDate && (
                <Badge variant="destructive" className="text-xs px-1 py-0">
                  †
                </Badge>
              )}
            </div>
          </div>
        </div>
        {person.birthDate && (
          <div className="text-xs text-gray-500 mt-2">
            Born: {new Date(person.birthDate).getFullYear()}
          </div>
        )}
      </CardContent>
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </Card>
  );
}

const nodeTypes = {
  person: PersonNode,
};

export function FamilyTreeVisualization({ treeData, onPersonClick }: FamilyTreeVisualizationProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!treeData) {
      return { nodes: [], edges: [] };
    }

    const { person: rootPerson, relationships, relatedPeople } = treeData;
    const allPeople = [rootPerson, ...relatedPeople];
    
    // Create nodes for each person
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Position the root person in the center
    const centerX = 400;
    const centerY = 300;
    
    // Add root person
    nodes.push({
      id: rootPerson.id.toString(),
      type: 'person',
      position: { x: centerX, y: centerY },
      data: { 
        person: rootPerson,
        onClick: () => onPersonClick?.(rootPerson.id)
      },
    });

    // Track positioned people to avoid duplicates
    const positionedPeople = new Set([rootPerson.id]);
    
    // Position parents above root
    const parents = relationships
      .filter(rel => rel.childId === rootPerson.id)
      .map(rel => relatedPeople.find(p => p.id === rel.parentId))
      .filter(Boolean) as Person[];
    
    parents.forEach((parent, index) => {
      if (!positionedPeople.has(parent.id)) {
        nodes.push({
          id: parent.id.toString(),
          type: 'person',
          position: { 
            x: centerX + (index - parents.length / 2) * 250, 
            y: centerY - 200 
          },
          data: { 
            person: parent,
            onClick: () => onPersonClick?.(parent.id)
          },
        });
        positionedPeople.add(parent.id);
        
        // Add edge from parent to root
        edges.push({
          id: `${parent.id}-${rootPerson.id}`,
          source: parent.id.toString(),
          target: rootPerson.id.toString(),
          type: 'straight',
          animated: false,
        });
      }
    });

    // Position children below root
    const children = relationships
      .filter(rel => rel.parentId === rootPerson.id)
      .map(rel => relatedPeople.find(p => p.id === rel.childId))
      .filter(Boolean) as Person[];
    
    children.forEach((child, index) => {
      if (!positionedPeople.has(child.id)) {
        nodes.push({
          id: child.id.toString(),
          type: 'person',
          position: { 
            x: centerX + (index - children.length / 2) * 250, 
            y: centerY + 200 
          },
          data: { 
            person: child,
            onClick: () => onPersonClick?.(child.id)
          },
        });
        positionedPeople.add(child.id);
        
        // Add edge from root to child
        edges.push({
          id: `${rootPerson.id}-${child.id}`,
          source: rootPerson.id.toString(),
          target: child.id.toString(),
          type: 'straight',
          animated: false,
        });
      }
    });

    // Position siblings next to root
    const siblings = relationships
      .filter(rel => rel.childId !== rootPerson.id && 
        relationships.some(r => r.childId === rootPerson.id && r.parentId === rel.parentId))
      .map(rel => relatedPeople.find(p => p.id === rel.childId))
      .filter(Boolean) as Person[];
    
    siblings.forEach((sibling, index) => {
      if (!positionedPeople.has(sibling.id)) {
        nodes.push({
          id: sibling.id.toString(),
          type: 'person',
          position: { 
            x: centerX + (index + 1) * 300, 
            y: centerY 
          },
          data: { 
            person: sibling,
            onClick: () => onPersonClick?.(sibling.id)
          },
        });
        positionedPeople.add(sibling.id);
      }
    });

    return { nodes, edges };
  }, [treeData, onPersonClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.data.onClick) {
      node.data.onClick();
    }
  }, []);

  if (!treeData) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 mb-2">No family tree data available</div>
          <div className="text-sm text-gray-400">Add people and relationships to see the tree</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const person = node.data.person as Person;
            switch (person.gender) {
              case 'male': return '#3b82f6';
              case 'female': return '#ec4899';
              default: return '#6b7280';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}