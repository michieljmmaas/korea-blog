"use client"

import React, { useState, useEffect } from 'react';

// Type definitions
interface Photo {
  id: number;
  thumb: string;
  medium: string;
  alt: string;
}

interface PhotoWithDayInfo extends Photo {
  dayInfo: string;
}

interface TravelDay {
  day: number;
  date: string;
  location: string;
  kimbapCount: number;
  description: string;
  photos: Photo[];
}

interface IconProps {
  className?: string;
}

// SVG Icons as components
const X: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronLeft: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const MapPin: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Utensils: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 2l1.578 8.545L9 10l-1.578-8.545L3 2zM3 2v18h2V10M21 2l-1.578 8.545L15 10l1.578-8.545L21 2zM21 2v18h-2V10" />
  </svg>
);

// Sample data structure for your blog
const travelData: TravelDay[] = [
  {
    day: 1,
    date: "2024-03-15",
    location: "Seoul - Myeongdong",
    kimbapCount: 2,
    description: "Arrived in Seoul! Explored Myeongdong shopping district and tried my first Korean street food.",
    photos: [
      {
        id: 1,
        thumb: "https://picsum.photos/200/150?random=1",
        medium: "https://picsum.photos/800/600?random=1",
        alt: "Myeongdong street scene"
      },
      {
        id: 2,
        thumb: "https://picsum.photos/200/150?random=2", 
        medium: "https://picsum.photos/800/600?random=2",
        alt: "First kimbap lunch"
      },
      {
        id: 3,
        thumb: "https://picsum.photos/200/150?random=3",
        medium: "https://picsum.photos/800/600?random=3", 
        alt: "Night lights in Myeongdong"
      }
    ]
  },
  {
    day: 2,
    date: "2024-03-16", 
    location: "Seoul - Gyeongbokgung Palace",
    kimbapCount: 3,
    description: "Visited the beautiful Gyeongbokgung Palace and watched the changing of the guards ceremony.",
    photos: [
      {
        id: 4,
        thumb: "https://picsum.photos/200/150?random=4",
        medium: "https://picsum.photos/800/600?random=4",
        alt: "Gyeongbokgung Palace entrance"
      },
      {
        id: 5,
        thumb: "https://picsum.photos/200/150?random=5",
        medium: "https://picsum.photos/800/600?random=5", 
        alt: "Guard ceremony"
      },
      {
        id: 6,
        thumb: "https://picsum.photos/200/150?random=6",
        medium: "https://picsum.photos/800/600?random=6",
        alt: "Traditional Korean lunch"
      }
    ]
  },
  {
    day: 3,
    date: "2024-03-17",
    location: "Seoul - Bukchon Hanok Village", 
    kimbapCount: 1,
    description: "Wandered through traditional hanok houses and got lost in the narrow alleys (in a good way!).",
    photos: [
      {
        id: 7,
        thumb: "https://picsum.photos/200/150?random=7",
        medium: "https://picsum.photos/800/600?random=7",
        alt: "Traditional hanok architecture"
      },
      {
        id: 8,
        thumb: "https://picsum.photos/200/150?random=8",
        medium: "https://picsum.photos/800/600?random=8",
        alt: "Narrow alley with hanok houses"
      },
      {
        id: 9,
        thumb: "https://picsum.photos/200/150?random=9", 
        medium: "https://picsum.photos/800/600?random=9",
        alt: "View over Seoul from Bukchon"
      }
    ]
  },
  {
    day: 4,
    date: "2024-03-18",
    location: "Seoul - Hongdae District",
    kimbapCount: 4,
    description: "Experienced Seoul's nightlife in Hongdae. So much energy and amazing street performances!",
    photos: [
      {
        id: 10,
        thumb: "https://picsum.photos/200/150?random=10",
        medium: "https://picsum.photos/800/600?random=10", 
        alt: "Hongdae street performance"
      },
      {
        id: 11,
        thumb: "https://picsum.photos/200/150?random=11",
        medium: "https://picsum.photos/800/600?random=11",
        alt: "Korean BBQ dinner"
      },
      {
        id: 12,
        thumb: "https://picsum.photos/200/150?random=12",
        medium: "https://picsum.photos/800/600?random=12",
        alt: "Neon lights at night"
      }
    ]
  }
];

const KoreaTravelGrid: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithDayInfo | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [allPhotos, setAllPhotos] = useState<PhotoWithDayInfo[]>([]);

  // Flatten all photos for lightbox navigation
  useEffect(() => {
    const photos: PhotoWithDayInfo[] = travelData.flatMap(day => 
      day.photos.map(photo => ({
        ...photo,
        dayInfo: `Day ${day.day} - ${day.location}`
      }))
    );
    setAllPhotos(photos);
  }, []);

  const openLightbox = (photo: Photo): void => {
    const photoWithDayInfo = allPhotos.find(p => p.id === photo.id);
    if (!photoWithDayInfo) return;
    
    const photoIndex = allPhotos.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(photoIndex);
    setSelectedPhoto(photoWithDayInfo);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeLightbox = (): void => {
    setSelectedPhoto(null);
    document.body.style.overflow = 'unset';
  };

  const navigatePhoto = (direction: 'next' | 'prev'): void => {
    const newIndex = direction === 'next' 
      ? (currentPhotoIndex + 1) % allPhotos.length
      : (currentPhotoIndex - 1 + allPhotos.length) % allPhotos.length;
    
    setCurrentPhotoIndex(newIndex);
    setSelectedPhoto(allPhotos[newIndex]);
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') navigatePhoto('next');
    if (e.key === 'ArrowLeft') navigatePhoto('prev');
  };

  useEffect(() => {
    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPhoto, currentPhotoIndex]);

  interface LazyImageProps {
    src: string;
    alt: string;
    onClick: () => void;
    className?: string;
  }

  const LazyImage: React.FC<LazyImageProps> = ({ src, alt, onClick, className }) => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isInView, setIsInView] = useState<boolean>(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      const element = document.getElementById(alt);
      if (element) observer.observe(element);

      return () => observer.disconnect();
    }, [alt]);

    return (
      <div 
        id={alt}
        className={`${className} bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200`}
        onClick={onClick}
      >
        {isInView && (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
          />
        )}
        {!isLoaded && isInView && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🇰🇷 My South Korea Adventure
          </h1>
          <p className="text-gray-600">
            70 days exploring the Land of the Morning Calm
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {travelData.map((day) => (
            <div key={day.day} className="bg-white rounded-xl shadow-sm border p-6">
              {/* Day Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Day {day.day}
                  </h2>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {day.location}
                    <span className="mx-2">•</span>
                    {day.date}
                  </div>
                </div>
                <div className="flex items-center bg-orange-100 px-3 py-1 rounded-full">
                  <Utensils className="w-4 h-4 mr-1 text-orange-600" />
                  <span className="text-orange-700 font-medium">
                    {day.kimbapCount} Kimbap
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4">{day.description}</p>

              {/* Photo Grid */}
              <div className="grid grid-cols-3 gap-4">
                {day.photos.map((photo) => (
                  <LazyImage
                    key={photo.id}
                    src={photo.thumb}
                    alt={photo.alt}
                    onClick={() => openLightbox(photo)}
                    className="aspect-[4/3]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-5xl max-h-full p-4">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={() => navigatePhoto('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => navigatePhoto('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image */}
            <img
              src={selectedPhoto.medium}
              alt={selectedPhoto.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <p className="font-medium">{selectedPhoto.alt}</p>
              <p className="text-sm text-gray-300 mt-1">{selectedPhoto.dayInfo}</p>
              <p className="text-xs text-gray-400 mt-1">
                {currentPhotoIndex + 1} of {allPhotos.length}
              </p>
            </div>
          </div>

          {/* Background Click to Close */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={closeLightbox}
          />
        </div>
      )}

      {/* Stats Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{travelData.length}</div>
              <div className="text-gray-600">Days Documented</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {travelData.reduce((sum, day) => sum + day.photos.length, 0)}
              </div>
              <div className="text-gray-600">Photos Taken</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {travelData.reduce((sum, day) => sum + day.kimbapCount, 0)}
              </div>
              <div className="text-gray-600">Kimbap Consumed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KoreaTravelGrid;