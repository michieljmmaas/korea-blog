import { getBlogPosts } from '../../lib/blogData';
import ClientGrid from '../_components/client-grid';
import { TripDay } from '../types';

export default async function TripGridPage() {
  const { days, initialSettings } = await getBlogPosts();

  // Convert dates to strings for client component
  const serializedDays = days.map(day => ({
    ...day,
    date: day.date.toISOString(),
    frontmatter: {
      ...day.frontmatter,
      // Ensure all frontmatter fields are serializable
    }
  }));

  const serializedSettings = {
    ...initialSettings,
    startDate: initialSettings.startDate.toISOString()
  };

  return (
    <ClientGrid 
      days={serializedDays as any} 
      initialSettings={serializedSettings as any} 
    />
  );
}