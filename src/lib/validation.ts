import { z } from "zod";

// Report validation schema
export const reportSchema = z.object({
  type: z.enum(["traffic", "accident", "construction", "closure", "new-road", "hazard", "murram", "pothole", "flooded"], {
    required_error: "Report type is required",
  }),
  description: z
    .string()
    .trim()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type ReportInput = z.infer<typeof reportSchema>;

// Validate coordinates are within Kenya bounds (approximate)
export const isWithinKenyaBounds = (lat: number, lng: number): boolean => {
  const kenyaBounds = {
    minLat: -4.8,
    maxLat: 4.7,
    minLng: 33.9,
    maxLng: 41.9,
  };
  
  return (
    lat >= kenyaBounds.minLat &&
    lat <= kenyaBounds.maxLat &&
    lng >= kenyaBounds.minLng &&
    lng <= kenyaBounds.maxLng
  );
};

// Sanitize text input
export const sanitizeText = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>\"'&]/g, "") // Remove potentially dangerous characters
    .trim();
};
