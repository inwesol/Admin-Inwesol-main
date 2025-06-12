import CoachDetailsPage from "@/app/PersonDetailsPage-coach/page";

interface PageProps {
  params: Promise<{
    id: string; 
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CoachPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <CoachDetailsPage params={resolvedParams} />;
}