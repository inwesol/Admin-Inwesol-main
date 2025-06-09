import PersonDetailsPage from "@/app/PersonDetailsPage/page";


interface PageProps {
  params: {
   
    id: string; 
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}


export default function PersonPage({ params }: PageProps) {
  return <PersonDetailsPage params={params} />;
}