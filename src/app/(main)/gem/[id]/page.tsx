'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button, Badge, StarRating, Avatar, AvatarImage, AvatarFallback, Card, CardContent, Textarea } from '@/components/ui';
import { GEM_CATEGORIES, ROUTES } from '@/constants';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import type { Gem, Rating } from '@/types';

// Mock data - will be replaced with actual data fetching
const mockGem: Gem = {
  id: '1',
  owner_id: '1',
  name: 'The Secret Garden Restaurant',
  slug: 'secret-garden-restaurant',
  description:
    'A hidden culinary paradise nestled in the heart of Nairobi. The Secret Garden Restaurant offers an unforgettable dining experience with locally sourced ingredients, creative fusion cuisine, and an enchanting garden atmosphere. Perfect for romantic dinners, special occasions, or simply escaping the city bustle.\n\nOur chef brings over 15 years of experience from top restaurants across Africa and Europe, creating a unique menu that celebrates Kenyan flavors with international techniques.',
  category: 'eat_drink',
  country: 'KE',
  city: 'Nairobi',
  address: '123 Garden Lane, Westlands, Nairobi',
  latitude: -1.2641,
  longitude: 36.8034,
  phone: '+254 700 123 456',
  email: 'info@secretgarden.co.ke',
  website: 'https://secretgarden.co.ke',
  opening_hours: 'Mon-Sun: 11:00 AM - 11:00 PM',
  price_range: 'KES 1,500 - 4,000',
  status: 'approved',
  tier: 'featured',
  views_count: 1250,
  average_rating: 4.8,
  ratings_count: 89,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  media: [
    {
      id: '1',
      gem_id: '1',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
      type: 'image',
      is_cover: true,
      order: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      gem_id: '1',
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
      type: 'image',
      is_cover: false,
      order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      gem_id: '1',
      url: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200',
      type: 'image',
      is_cover: false,
      order: 2,
      created_at: new Date().toISOString(),
    },
  ],
  owner: {
    id: '1',
    email: 'owner@example.com',
    full_name: 'John Kamau',
    role: 'owner',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const mockRatings: Rating[] = [
  {
    id: '1',
    gem_id: '1',
    user_id: '2',
    score: 5,
    comment:
      'Absolutely amazing experience! The food was incredible and the ambiance was perfect. Highly recommend the grilled tilapia.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    user: {
      id: '2',
      email: 'jane@example.com',
      full_name: 'Jane Wanjiku',
      role: 'visitor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    gem_id: '1',
    user_id: '3',
    score: 4,
    comment:
      'Great food and lovely setting. Service was a bit slow during peak hours but overall a wonderful experience.',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    user: {
      id: '3',
      email: 'peter@example.com',
      full_name: 'Peter Ochieng',
      role: 'visitor',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export default function GemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  // In real app, fetch gem data based on id
  const gem = mockGem;
  const ratings = mockRatings;
  const category = GEM_CATEGORIES[gem.category];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (gem.media?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (gem.media?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleSubmitRating = () => {
    if (!user) {
      // Redirect to login
      return;
    }
    // Submit rating logic
    console.log('Submitting rating:', { score: newRating, comment: newComment });
  };

  return (
    <div className="pb-8">
      {/* Back button - mobile */}
      <div className="sticky top-16 z-40 bg-[var(--background)] border-b border-[var(--card-border)] px-4 py-3 md:hidden">
        <Link
          href={ROUTES.explore}
          className="inline-flex items-center text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to explore
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] bg-[var(--card-border)]">
        {gem.media && gem.media.length > 0 ? (
          <>
            <Image
              src={gem.media[currentImageIndex].url}
              alt={gem.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            {gem.media.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {gem.media.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex
                          ? 'bg-white'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--foreground-muted)]">
            No images available
          </div>
        )}

        {/* Featured badge */}
        {gem.tier === 'featured' && (
          <Badge variant="default" className="absolute top-4 left-4">
            Featured Gem
          </Badge>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {category.label}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
                    {gem.name}
                  </h1>
                  <div className="flex items-center gap-1 mt-2 text-[var(--foreground-muted)]">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {gem.city}, {gem.country}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavorite
                          ? 'fill-[var(--error)] text-[var(--error)]'
                          : ''
                      }`}
                    />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Rating summary */}
              <div className="flex items-center gap-4 mt-4">
                <StarRating rating={gem.average_rating} showValue size="md" />
                <span className="text-[var(--foreground-muted)]">
                  ({gem.ratings_count} reviews)
                </span>
                <span className="text-[var(--foreground-muted)]">
                  {gem.views_count.toLocaleString()} views
                </span>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <p className="text-[var(--foreground-muted)] whitespace-pre-line">
                  {gem.description}
                </p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">
                  Reviews ({ratings.length})
                </h2>

                {/* Add review */}
                {user ? (
                  <div className="mb-6 p-4 bg-[var(--background)] rounded-[var(--radius-lg)]">
                    <h3 className="font-medium mb-3">Leave a review</h3>
                    <div className="mb-3">
                      <StarRating
                        rating={newRating}
                        interactive
                        onRatingChange={setNewRating}
                        size="lg"
                      />
                    </div>
                    <Textarea
                      placeholder="Share your experience..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-3"
                    />
                    <Button
                      onClick={handleSubmitRating}
                      disabled={newRating === 0}
                    >
                      Submit Review
                    </Button>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-[var(--background)] rounded-[var(--radius-lg)] text-center">
                    <p className="text-[var(--foreground-muted)] mb-3">
                      Sign in to leave a review
                    </p>
                    <Link href={ROUTES.login}>
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Reviews list */}
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div
                      key={rating.id}
                      className="border-b border-[var(--card-border)] pb-4 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={rating.user?.avatar_url} alt={rating.user?.full_name || ''} />
                          <AvatarFallback>{rating.user?.full_name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {rating.user?.full_name}
                            </span>
                            <StarRating rating={rating.score} size="sm" />
                          </div>
                          <p className="text-xs text-[var(--foreground-muted)] mb-2">
                            {formatDate(rating.created_at)}
                          </p>
                          {rating.comment && (
                            <p className="text-[var(--foreground-muted)]">
                              {rating.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact Info */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Contact & Info</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[var(--primary)] mt-0.5" />
                    <span className="text-sm">{gem.address}</span>
                  </div>
                  {gem.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-[var(--primary)]" />
                      <a
                        href={`tel:${gem.phone}`}
                        className="text-sm hover:text-[var(--primary)]"
                      >
                        {gem.phone}
                      </a>
                    </div>
                  )}
                  {gem.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-[var(--primary)]" />
                      <a
                        href={`mailto:${gem.email}`}
                        className="text-sm hover:text-[var(--primary)]"
                      >
                        {gem.email}
                      </a>
                    </div>
                  )}
                  {gem.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-[var(--primary)]" />
                      <a
                        href={gem.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-[var(--primary)]"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  {gem.opening_hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-[var(--primary)] mt-0.5" />
                      <span className="text-sm">{gem.opening_hours}</span>
                    </div>
                  )}
                  {gem.price_range && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-[var(--primary)]" />
                      <span className="text-sm">{gem.price_range}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Location</h2>
                <div className="aspect-square bg-[var(--background)] rounded-[var(--radius)] flex items-center justify-center text-[var(--foreground-muted)]">
                  Map coming soon
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
