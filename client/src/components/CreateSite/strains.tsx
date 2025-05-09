export const storageOptions = {
    banked: "banked",
    unbanked: "unbanked",
  } as const;
  
  export const projects = {
    project_zero: "Project Zero",
    super_project: "Super Project",
    gen_revolution: "Gen Revolution",
    quantum_flora: "Quantum Flora",
    biopioneer: "BioPioneer",
    future_brew: "Future Brew",
  } as const;
  
  type StorageOptionsKey = keyof typeof storageOptions;
  type StorageOptions = (typeof storageOptions)[StorageOptionsKey];
  type ProjectsKey = keyof typeof projects;
  type Projects = (typeof projects)[ProjectsKey];
  
  export interface Strain extends Record<string, unknown> {
    id: string;
    name: string;
    parent: string | null;
    storage: StorageOptions;
    description: string;
    project: Projects;
    createdBy: string;
    createdOn: string;
  }
  
  export const strains: Strain[] = [
    {
      id: "1",
      name: "Y00000",
      parent: null,
      storage: storageOptions.banked,
      description: "The first-ever engineered strain.",
      project: projects.project_zero,
      createdBy: "John Doe",
      createdOn: "2000-01-01",
    },
    {
      id: "2",
      name: "Y00001",
      parent: "Y00001",
      storage: storageOptions.banked,
      description: "A super version of the first strain.",
      project: projects.super_project,
      createdBy: "Mary Jane",
      createdOn: "2000-03-31",
    },
    {
      id: "3",
      name: "Y00002",
      parent: null,
      storage: storageOptions.unbanked,
      description: "A newly engineered yeast strain.",
      project: projects.gen_revolution,
      createdBy: "Casey Kim",
      createdOn: "2000-06-29",
    },
    {
      id: "4",
      name: "Y00003",
      parent: "Y00002",
      storage: storageOptions.unbanked,
      description: "Strain derived from Y00002 with enhanced properties.",
      project: projects.quantum_flora,
      createdBy: "Jamie Rivera",
      createdOn: "2000-09-27",
    },
    {
      id: "5",
      name: "Y00004",
      parent: null,
      storage: storageOptions.banked,
      description: "A newly engineered yeast strain.",
      project: projects.gen_revolution,
      createdBy: "Pat Morgan",
      createdOn: "2000-12-26",
    },
    {
      id: "6",
      name: "Y00005",
      parent: "Y00004",
      storage: storageOptions.unbanked,
      description: "Strain derived from Y00004 with enhanced properties.",
      project: projects.quantum_flora,
      createdBy: "Casey Kim",
      createdOn: "2001-03-26",
    },
    {
      id: "7",
      name: "Y00006",
      parent: null,
      storage: storageOptions.banked,
      description: "A newly engineered yeast strain.",
      project: projects.biopioneer,
      createdBy: "Casey Kim",
      createdOn: "2001-06-24",
    },
    {
      id: "8",
      name: "Y00007",
      parent: null,
      storage: storageOptions.banked,
      description: "A newly engineered yeast strain.",
      project: projects.quantum_flora,
      createdBy: "Pat Morgan",
      createdOn: "2001-09-22",
    },
    {
      id: "9",
      name: "Y00008",
      parent: null,
      storage: storageOptions.banked,
      description: "A newly engineered yeast strain.",
      project: projects.gen_revolution,
      createdBy: "Casey Kim",
      createdOn: "2001-12-21",
    },
    {
      id: "10",
      name: "Y00009",
      parent: null,
      storage: storageOptions.unbanked,
      description: "A newly engineered yeast strain.",
      project: projects.future_brew,
      createdBy: "Sam Taylor",
      createdOn: "2002-03-21",
    },
  ];
  