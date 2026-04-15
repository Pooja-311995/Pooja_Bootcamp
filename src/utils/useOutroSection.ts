import { useState, useEffect } from 'react';
import { getOutroSection } from '../services/contentstackApi';
import { OutroSection } from '../types';

interface UseOutroSectionReturn {
  outroData: OutroSection | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOutroSection = (entryUid?: string): UseOutroSectionReturn => {
  const [outroData, setOutroData] = useState<OutroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOutroData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getOutroSection(entryUid);
      
      if (data) {
        // Parse HTML formatted strings and extract information
        const parseContactDetails = (contactStr: string) => {
          const phoneMatch = contactStr.match(/📞\s*([^<\n]+)/);
          const emailMatch = contactStr.match(/href="[^"]*">([^<]+)</) || contactStr.match(/✉️\s*([^\n<]+)/);
          
          const phone = phoneMatch ? phoneMatch[1].trim() : undefined;
          const email = emailMatch ? emailMatch[1]?.trim() : undefined;
          
          return {
            phone,
            email,
            website: undefined
          };
        };

        const parseLocationDetails = (locationStr: string) => {
          // Remove HTML tags and split by line breaks
          const cleanLocation = locationStr.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
          const lines = cleanLocation.split('\n').map(line => line.trim()).filter(Boolean);
          
          const address = lines.length > 1 ? lines.slice(1).join(', ') : lines.join(', ');
          
          return {
            address,
            city: undefined,
            state: undefined,
            postal_code: undefined,
            country: undefined
          };
        };

        const parseWorkingHours = (hoursStr: string) => {
          // Remove emoji and extract hours
          const cleanHours = hoursStr.replace(/🕒\s*/, '').trim();
          
          return {
            general_hours: cleanHours,
            monday: undefined,
            tuesday: undefined,
            wednesday: undefined,
            thursday: undefined,
            friday: undefined,
            saturday: undefined,
            sunday: undefined
          };
        };

        // Transform the raw API response to OutroSection format
        const transformedData: OutroSection = {
          title: data.title || "Visit GRABO Today",
          description: "Ready to experience the perfect cup of coffee? Visit us today and discover why GRABO is the preferred choice for coffee lovers.",
          location_details: data.location_details ? parseLocationDetails(data.location_details) : undefined,
          contact_details: data.contact_details ? parseContactDetails(data.contact_details) : undefined,
          working_hours: data.working_hours ? parseWorkingHours(data.working_hours) : undefined,
          background_image: data.image || data.background_image,
          call_to_action: {
            title: "Contact Us",
            href: "/contact"
          }
        };
        
        setOutroData(transformedData);
      } else {
        // Fallback data if API fails
        setOutroData({
          title: "Visit GRABO Today",
          description: "Ready to experience the perfect cup of coffee? Visit us today and discover why GRABO is the preferred choice for coffee lovers.",
          location_details: {
            address: "123 Brew Street",
            city: "Downtown",
            state: "Pune",
            postal_code: "12345",
            country: "India"
          },
          contact_details: {
            phone: "+1 (555) 987-6543",
            email: "support@grabo.coffee",
            website: "www.grabo.coffee"
          },
          working_hours: {
            general_hours: "Mon-Fri: 7:00 AM - 9:00 PM | Sat-Sun: 8:00 AM - 10:00 PM"
          },
          call_to_action: {
            title: "Contact Us",
            href: "/contact"
          }
        });
      }
    } catch (err) {
      console.error('Error fetching outro section:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch outro section');
      
      // Fallback data on error
      setOutroData({
        title: "Visit GRABO Today",
        description: "Ready to experience the perfect cup of coffee? Visit us today and discover why GRABO is the preferred choice for coffee lovers.",
        location_details: {
          address: "123 Brew Street",
          city: "Downtown", 
          state: "Pune",
          postal_code: "12345",
          country: "India"
        },
        contact_details: {
          phone: "+1 (555) 987-6543",
          email: "support@grabo.coffee",
          website: "www.grabo.coffee"
        },
        working_hours: {
          general_hours: "Mon-Fri: 7:00 AM - 9:00 PM | Sat-Sun: 8:00 AM - 10:00 PM"
        },
        call_to_action: {
          title: "Contact Us",
          href: "/contact"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchOutroData();
  };

  useEffect(() => {
    fetchOutroData();
  }, [entryUid]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    outroData,
    loading,
    error,
    refetch
  };
};
