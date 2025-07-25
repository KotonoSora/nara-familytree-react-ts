export const mockPeople = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    middleName: 'Michael',
    gender: 'male',
    birthDate: '1950-01-15',
    birthPlace: 'New York, NY',
    occupation: 'Engineer',
    bio: 'A dedicated engineer and family man.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    middleName: 'Elizabeth',
    gender: 'female',
    birthDate: '1952-06-22',
    birthPlace: 'Boston, MA',
    occupation: 'Teacher',
    bio: 'Passionate educator with 30+ years experience.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    firstName: 'Alice',
    lastName: 'Doe',
    gender: 'female',
    birthDate: '1975-03-10',
    birthPlace: 'Chicago, IL',
    occupation: 'Doctor',
    bio: 'Pediatrician specializing in child development.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    firstName: 'Bob',
    lastName: 'Doe',
    gender: 'male',
    birthDate: '1978-09-05',
    birthPlace: 'Seattle, WA',
    occupation: 'Software Developer',
    bio: 'Full-stack developer with a passion for open source.',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockRelationships = [
  {
    id: 1,
    personId: 3,
    relatedPersonId: 1,
    relationshipType: 'child',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    personId: 3,
    relatedPersonId: 2,
    relationshipType: 'child',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    personId: 4,
    relatedPersonId: 1,
    relationshipType: 'child',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    personId: 4,
    relatedPersonId: 2,
    relationshipType: 'child',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    personId: 1,
    relatedPersonId: 2,
    relationshipType: 'spouse',
    createdAt: '2024-01-01T00:00:00Z'
  }
];