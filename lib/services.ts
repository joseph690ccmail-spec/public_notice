export interface PublishService {
  id: string;
  name: string;
  description: string;
  href?: string;
  available: boolean;
  keywords: string[];
}

export const PUBLISH_SERVICES: PublishService[] = [
  {
    id: "change-of-name",
    name: "Change of Name",
    description:
      "Publish a public notice for an individual legal name change. Includes official PNN and certificate.",
    href: "/publish/change-of-name",
    available: true,
    keywords: [
      "name",
      "change",
      "marriage",
      "deed poll",
      "affidavit",
      "individual",
      "rename",
    ],
  },
  {
    id: "loss-of-documents",
    name: "Loss of Documents",
    description: "Notify the public of lost passports, certificates, or other documents.",
    available: false,
    keywords: ["loss", "documents", "passport", "certificate", "stolen"],
  },
  {
    id: "company-name-change",
    name: "Company / NGO Name Change",
    description: "Corporate and registered entity name change notices.",
    available: false,
    keywords: ["company", "ngo", "cac", "corporate", "business"],
  },
];

export function filterPublishServices(query: string): PublishService[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return PUBLISH_SERVICES;

  return PUBLISH_SERVICES.filter((service) => {
    const haystack = [
      service.name,
      service.description,
      ...service.keywords,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}