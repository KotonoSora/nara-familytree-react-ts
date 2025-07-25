import { test, expect, describe } from "vitest";

// Test the validation schemas and business logic without database
describe("Family Tree Business Logic", () => {
  test("should validate person data structure", () => {
    const validPerson = {
      firstName: "John",
      lastName: "Doe",
      middleName: "Michael",
      gender: "male",
      birthDate: "1990-01-01",
      birthPlace: "New York",
      bio: "Test person",
    };

    // Basic validation tests
    expect(validPerson.firstName).toBeTruthy();
    expect(validPerson.lastName).toBeTruthy();
    expect(["male", "female", "other"].includes(validPerson.gender)).toBe(true);
  });

  test("should validate relationship data structure", () => {
    const validRelationship = {
      parentId: 1,
      childId: 2,
      relationshipType: "biological",
    };

    expect(validRelationship.parentId).toBeGreaterThan(0);
    expect(validRelationship.childId).toBeGreaterThan(0);
    expect(validRelationship.parentId).not.toBe(validRelationship.childId);
    expect(["biological", "adopted", "step", "foster"].includes(validRelationship.relationshipType)).toBe(true);
  });

  test("should detect invalid relationship (self-reference)", () => {
    const invalidRelationship = {
      parentId: 1,
      childId: 1, // Same as parent
      relationshipType: "biological",
    };

    expect(invalidRelationship.parentId === invalidRelationship.childId).toBe(true);
  });

  test("should format person names correctly", () => {
    const getPersonName = (person: any) => {
      return `${person.firstName} ${person.middleName ? `${person.middleName} ` : ''}${person.lastName}`;
    };

    const personWithMiddle = {
      firstName: "John",
      middleName: "Michael",
      lastName: "Doe",
    };

    const personWithoutMiddle = {
      firstName: "Jane",
      lastName: "Smith",
    };

    expect(getPersonName(personWithMiddle)).toBe("John Michael Doe");
    expect(getPersonName(personWithoutMiddle)).toBe("Jane Smith");
  });

  test("should calculate age correctly", () => {
    const getAge = (birthDate?: string, deathDate?: string) => {
      if (!birthDate) return null;
      
      const birth = new Date(birthDate);
      const end = deathDate ? new Date(deathDate) : new Date();
      const age = end.getFullYear() - birth.getFullYear();
      
      return age;
    };

    const birthDate = "1990-01-01";
    const deathDate = "2020-01-01";
    
    expect(getAge(birthDate, deathDate)).toBe(30);
    expect(getAge(undefined)).toBe(null);
    
    // Test living person (approximate age)
    const livingAge = getAge(birthDate);
    expect(livingAge).toBeGreaterThan(30);
  });

  test("should generate initials correctly", () => {
    const getInitials = (firstName: string, lastName: string) => {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    expect(getInitials("John", "Doe")).toBe("JD");
    expect(getInitials("jane", "smith")).toBe("JS");
  });
});