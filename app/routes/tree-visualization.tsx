import type { Route } from "./+types/tree-visualization";
import { AppLayout } from "~/components/app-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Users, Plus } from "lucide-react";
import { familyMembers, familyRelationships } from "~/database/schema";
import { desc } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Family Tree Visualization" },
    { name: "description", content: "Visual family tree representation" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  try {
    const { db } = context;
    
    // Fetch family members and relationships from database using regular queries
    const membersResult = await db
      .select()
      .from(familyMembers)
      .orderBy(desc(familyMembers.createdAt));
    
    const relationshipsResult = await db
      .select()
      .from(familyRelationships)
      .orderBy(desc(familyRelationships.createdAt));
    
    return {
      familyMembers: membersResult,
      relationships: relationshipsResult,
    };
  } catch (error) {
    console.error("Error loading family tree data:", error);
    return {
      familyMembers: [],
      relationships: [],
    };
  }
}

interface FamilyMember {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  deathDate?: string;
  gender: 'male' | 'female' | 'other';
  photoUrl?: string;
}

interface TreeNode extends FamilyMember {
  children: TreeNode[];
  parents: FamilyMember[];
  spouse?: FamilyMember;
  level: number;
}

function buildFamilyTree(members: FamilyMember[], relationships: any[]): TreeNode[] {
  // Create a map of members for quick lookup
  const memberMap = new Map(members.map(m => [m.id, m]));
  
  // Find parent-child relationships
  const parentChildMap = new Map<number, number[]>(); // parent_id -> child_ids[]
  const childParentMap = new Map<number, number[]>(); // child_id -> parent_ids[]
  const spouseMap = new Map<number, number>(); // person_id -> spouse_id
  
  relationships.forEach(rel => {
    if (rel.relationshipType === 'parent') {
      // person1 is parent of person2
      if (!parentChildMap.has(rel.person1Id)) {
        parentChildMap.set(rel.person1Id, []);
      }
      parentChildMap.get(rel.person1Id)!.push(rel.person2Id);
      
      if (!childParentMap.has(rel.person2Id)) {
        childParentMap.set(rel.person2Id, []);
      }
      childParentMap.get(rel.person2Id)!.push(rel.person1Id);
    } else if (rel.relationshipType === 'spouse') {
      spouseMap.set(rel.person1Id, rel.person2Id);
      spouseMap.set(rel.person2Id, rel.person1Id);
    }
  });
  
  // Find root nodes (people without parents)
  const rootNodes: TreeNode[] = [];
  
  function createTreeNode(member: FamilyMember, level: number = 0): TreeNode {
    const children = (parentChildMap.get(member.id) || [])
      .map(childId => memberMap.get(childId))
      .filter(Boolean)
      .map(child => createTreeNode(child!, level + 1));
    
    const parents = (childParentMap.get(member.id) || [])
      .map(parentId => memberMap.get(parentId))
      .filter(Boolean) as FamilyMember[];
    
    const spouseId = spouseMap.get(member.id);
    const spouse = spouseId ? memberMap.get(spouseId) : undefined;
    
    return {
      ...member,
      children,
      parents,
      spouse,
      level,
    };
  }
  
  // Find people without parents (roots of the tree)
  members.forEach(member => {
    const hasParents = childParentMap.has(member.id);
    if (!hasParents) {
      rootNodes.push(createTreeNode(member));
    }
  });
  
  return rootNodes;
}

function PersonCard({ person, isSpouse = false }: { person: FamilyMember; isSpouse?: boolean }) {
  const getInitials = () => {
    return `${person.firstName[0]}${person.lastName[0]}`.toUpperCase();
  };
  
  const getAge = () => {
    if (!person.birthDate) return null;
    const birth = new Date(person.birthDate);
    const end = person.deathDate ? new Date(person.deathDate) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    return age;
  };
  
  return (
    <Card className={`w-48 ${isSpouse ? 'ml-4 border-purple-200 dark:border-purple-800' : 'border-blue-200 dark:border-blue-800'}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
            person.gender === 'male' 
              ? 'bg-blue-500' 
              : person.gender === 'female' 
                ? 'bg-pink-500' 
                : 'bg-purple-500'
          }`}>
            {person.photoUrl ? (
              <img 
                src={person.photoUrl} 
                alt={`${person.firstName} ${person.lastName}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {person.firstName} {person.lastName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {person.birthDate ? new Date(person.birthDate).getFullYear() : '?'}
              {person.deathDate ? ` - ${new Date(person.deathDate).getFullYear()}` : ''}
            </p>
            {getAge() && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Age: {getAge()}{person.deathDate ? ' (deceased)' : ''}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TreeNode({ node }: { node: TreeNode }) {
  return (
    <div className="flex flex-col items-center">
      {/* Person and Spouse */}
      <div className="flex items-center">
        <PersonCard person={node} />
        {node.spouse && (
          <>
            <div className="w-8 h-0.5 bg-purple-400 dark:bg-purple-600 mx-2" />
            <PersonCard person={node.spouse} isSpouse={true} />
          </>
        )}
      </div>
      
      {/* Children */}
      {node.children.length > 0 && (
        <div className="mt-8">
          {/* Connecting line */}
          <div className="w-0.5 h-8 bg-gray-400 dark:bg-gray-600 mx-auto mb-4" />
          
          <div className="flex space-x-8">
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                {/* Horizontal connecting line */}
                {node.children.length > 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full">
                    <div className="w-full h-0.5 bg-gray-400 dark:bg-gray-600" />
                  </div>
                )}
                <TreeNode node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FamilyTreeVisualization({ loaderData }: Route.ComponentProps) {
  const { familyMembers, relationships } = loaderData;
  
  const treeNodes = buildFamilyTree(familyMembers, relationships);
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <a href="/family-tree">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </a>
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                Family Tree Visualization
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Interactive family tree with relationships
              </p>
            </div>
          </div>
          <Button asChild>
            <a href="/add-member">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </a>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{familyMembers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Generations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {treeNodes.length > 0 ? Math.max(...treeNodes.map(node => node.level)) + 1 : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Relationships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{relationships.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Family Tree Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Family Tree
            </CardTitle>
          </CardHeader>
          <CardContent>
            {familyMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Family Members Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Start building your family tree by adding your first family member.
                </p>
                <Button asChild>
                  <a href="/add-member">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Family Member
                  </a>
                </Button>
              </div>
            ) : treeNodes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  Family members found, but no family relationships defined yet.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {familyMembers.map((member) => (
                    <PersonCard key={member.id} person={member} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto pb-8">
                <div className="flex space-x-16 justify-center min-w-max">
                  {treeNodes.map((rootNode) => (
                    <TreeNode key={rootNode.id} node={rootNode} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}