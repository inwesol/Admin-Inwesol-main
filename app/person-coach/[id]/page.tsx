import CoachDetailsPage from "@/app/PersonDetailsPage-coach/page";

interface PageProps {
  params: {
   
    id: string; 
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}


export default function CoachPage({ params }: PageProps) {
  return <CoachDetailsPage params={params} />;
}