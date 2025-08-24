import { getBlogPosts } from '../../lib/dayService';
import ClientGrid from '../_components/grid/client-grid';

export default async function TripGridPage() {
  const days = await getBlogPosts();

  // Convert dates to strings for client component
  const serializedDays = days.map(day => ({
    ...day,
    date: day.date.toISOString(),
    frontmatter: {
      ...day.frontmatter,
      // Ensure all frontmatter fields are serializable
    }
  }));


  return (
    <ClientGrid 
      days={serializedDays as any} 
    />
  );
}