'use client';

import { useState, useEffect, use, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isCloudinaryUrl } from '@/lib/cloudinary';
import { CloudinaryImage } from '@/components/ui';
import {
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
  Star,
  Eye,
  Navigation,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Button, StarRating, Avatar, AvatarImage, AvatarFallback, Textarea } from '@/components/ui';
import { GEM_CATEGORIES, ROUTES } from '@/constants';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import type { Gem, Rating, MenuItem } from '@/types';

type TabType = 'overview' | 'menu' | 'reviews';

export default function GemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [gem, setGem] = useState<Gem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Rating | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Track if ratings have been fetched to prevent re-fetching
  const ratingsLoadedForGemRef = useRef<string | null>(null);

  // Fetch gem data
  useEffect(() => {
    async function fetchGem() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/gems/${id}`);
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Gem not found');
          return;
        }

        setGem(result.data);
      } catch (err) {
        console.error('Error fetching gem:', err);
        setError('Failed to load gem');
      } finally {
        setIsLoading(false);
      }
    }

    fetchGem();
  }, [id]);

  // Fetch ratings - only when gem changes, not when user changes
  useEffect(() => {
    async function fetchRatings() {
      if (!gem) return;

      // Prevent re-fetching if already loaded for this gem
      if (ratingsLoadedForGemRef.current === gem.id) return;

      setRatingsLoading(true);
      try {
        const response = await fetch(`/api/ratings/${gem.id}`);
        const result = await response.json();
        if (result.data) {
          setRatings(result.data);
          ratingsLoadedForGemRef.current = gem.id;
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setRatingsLoading(false);
      }
    }

    fetchRatings();
  }, [gem]);

  // Find user's review when ratings or user changes
  useEffect(() => {
    if (user && ratings.length > 0) {
      const existingReview = ratings.find((r) => r.user_id === user.id);
      setUserReview(existingReview || null);
    } else {
      setUserReview(null);
    }
  }, [ratings, user]);

  // Calculate display stats from ratings (immediate feedback)
  const displayRatingsCount = ratings.length;
  const displayAverageRating = ratings.length > 0
    ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 10) / 10
    : 0;

  // Background refresh gem stats after review submission
  const refreshGemStats = useCallback(async () => {
    if (!gem) return;
    try {
      const response = await fetch(`/api/gems/${gem.id}`);
      const result = await response.json();
      if (result.data) {
        // Update only the stats, preserve other gem data
        setGem((prev) => prev ? {
          ...prev,
          average_rating: result.data.average_rating,
          ratings_count: result.data.ratings_count,
          views_count: result.data.views_count,
        } : null);
      }
    } catch (error) {
      console.error('Error refreshing gem stats:', error);
    }
  }, [gem]);

  // Fetch menu items for eat_drink gems
  useEffect(() => {
    async function fetchMenu() {
      if (!gem || gem.category !== 'eat_drink') return;

      setMenuLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('gem_id', gem.id)
        .eq('is_available', true)
        .order('category')
        .order('order');

      setMenuItems(data || []);
      setMenuLoading(false);
    }

    fetchMenu();
  }, [gem]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00AA6C]" />
      </div>
    );
  }

  // Error state
  if (error || !gem) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gem not found</h1>
          <p className="text-gray-600 mb-6">{error || 'This gem does not exist or is not available.'}</p>
          <Link href={ROUTES.explore}>
            <Button className="bg-[#00AA6C] hover:bg-[#008855]">
              Explore Gems
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = GEM_CATEGORIES[gem.category];
  const showMenuTab = gem.category === 'eat_drink';

  // Group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

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

  const handleSubmitRating = async () => {
    if (!user || newRating === 0 || !gem) return;

    setSubmitting(true);
    setSubmitError(null);

    // Create optimistic review with user data
    const optimisticReview: Rating = {
      id: `temp-${Date.now()}`,
      gem_id: gem.id,
      user_id: user.id,
      score: newRating,
      comment: newComment || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };

    // Store values before clearing form
    const submittedRating = newRating;
    const submittedComment = newComment;

    // Optimistic updates - immediate feedback
    setRatings((prev) => [optimisticReview, ...prev]);
    setUserReview(optimisticReview);
    setNewRating(0);
    setNewComment('');

    try {
      const response = await fetch(`/api/ratings/${gem.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: submittedRating,
          comment: submittedComment || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit review');
      }

      // Replace optimistic review with real data from server
      const serverReview = result.data;
      setRatings((prev) =>
        prev.map((r) => (r.id === optimisticReview.id ? serverReview : r))
      );
      setUserReview(serverReview);

      // Background refresh gem stats from database (non-blocking)
      refreshGemStats();

    } catch (error) {
      // Rollback on error
      setRatings((prev) => prev.filter((r) => r.id !== optimisticReview.id));
      setUserReview(null);
      setNewRating(submittedRating);
      setNewComment(submittedComment);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <div className="mx-auto max-w-6xl px-4 lg:px-8 pt-6">
        <div className="relative aspect-[16/9] md:aspect-[2/1] bg-gray-100 rounded-2xl overflow-hidden">
        {gem.media && gem.media.length > 0 ? (
          <>
            {isCloudinaryUrl(gem.media[currentImageIndex].url) ? (
              <CloudinaryImage
                src={gem.media[currentImageIndex].url}
                alt={gem.name}
                fill
                className="object-cover"
                priority
                preset="cover"
              />
            ) : (
              <Image
                src={gem.media[currentImageIndex].url}
                alt={gem.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            )}
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
          <div className="flex h-full items-center justify-center text-gray-500">
            No images available
          </div>
        )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3 py-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-[#00AA6C] bg-[#00AA6C]/10 px-2.5 py-1 rounded-full">
                      {category.label}
                    </span>
                    {gem.tier === 'featured' && (
                      <span className="text-sm font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {gem.name}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{gem.city}, {gem.country}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavorite
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                  <button className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Rating & Stats - Use computed values for immediate feedback */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(displayAverageRating)
                            ? 'fill-[#00AA6C] text-[#00AA6C]'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">{displayAverageRating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({displayRatingsCount} {displayRatingsCount === 1 ? 'review' : 'reviews'})</span>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Eye className="h-4 w-4" />
                  <span>{gem.views_count.toLocaleString()} views</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-[#00AA6C] text-[#00AA6C]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                {showMenuTab && (
                  <button
                    onClick={() => setActiveTab('menu')}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'menu'
                        ? 'border-[#00AA6C] text-[#00AA6C]'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Menu
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-[#00AA6C] text-[#00AA6C]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Reviews {ratingsLoading ? '' : `(${ratings.length})`}
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  {/* About Section */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {gem.description}
                    </p>
                  </div>

                  {/* Preview Reviews */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Recent Reviews
                      </h2>
                      {ratings.length > 0 && (
                        <button
                          onClick={() => setActiveTab('reviews')}
                          className="text-sm font-medium text-[#00AA6C] hover:underline"
                        >
                          See all reviews
                        </button>
                      )}
                    </div>
                    {ratingsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#00AA6C]" />
                      </div>
                    ) : ratings.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        <p>No reviews yet.</p>
                        {user && (
                          <button
                            onClick={() => setActiveTab('reviews')}
                            className="mt-2 text-sm font-medium text-[#00AA6C] hover:underline"
                          >
                            Be the first to review
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {ratings.slice(0, 3).map((rating, index) => (
                          <div
                            key={rating.id}
                            className={`py-4 ${index !== Math.min(ratings.length, 3) - 1 ? 'border-b border-gray-100' : ''}`}
                          >
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={rating.user?.avatar_url ?? undefined} alt={rating.user?.full_name ?? ''} />
                                <AvatarFallback className="bg-gray-900 text-white text-sm">
                                  {rating.user?.full_name?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {rating.user?.full_name}
                                  </span>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < rating.score
                                            ? 'fill-[#00AA6C] text-[#00AA6C]'
                                            : 'fill-gray-200 text-gray-200'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">
                                  {formatDate(rating.created_at)}
                                </p>
                                {rating.comment && (
                                  <p className="text-gray-700 leading-relaxed line-clamp-2">
                                    {rating.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Menu Tab */}
              {activeTab === 'menu' && showMenuTab && (
                <div>
                  {menuLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-[#00AA6C]" />
                    </div>
                  ) : menuItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No menu items available yet.</p>
                    </div>
                  ) : (
                    Object.entries(menuByCategory).map(([categoryName, items]) => (
                      <div key={categoryName} className="mb-8 last:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{categoryName}</h3>
                        <div className="space-y-4">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 py-3 border-b border-gray-100 last:border-0"
                            >
                              {item.image_url && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={item.image_url}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                      {item.name}
                                      {item.is_featured && (
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                      )}
                                    </h4>
                                    {item.description && (
                                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                    )}
                                  </div>
                                  <span className="font-medium text-[#00AA6C] whitespace-nowrap">
                                    {formatCurrency(item.price, item.currency)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  {/* Add review form or show user's existing review */}
                  {user ? (
                    userReview ? (
                      // Show user's own review - highlighted
                      <div className="mb-8 p-6 bg-[#00AA6C]/5 border border-[#00AA6C]/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-[#00AA6C]" />
                          <span className="font-medium text-[#00AA6C]">Your Review</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={userReview.user?.avatar_url ?? undefined} alt={userReview.user?.full_name ?? ''} />
                            <AvatarFallback className="bg-[#00AA6C] text-white text-sm">
                              {userReview.user?.full_name?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-gray-900">
                                {userReview.user?.full_name}
                              </span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < userReview.score
                                        ? 'fill-[#00AA6C] text-[#00AA6C]'
                                        : 'fill-gray-200 text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                              {formatDate(userReview.created_at)}
                            </p>
                            {userReview.comment && (
                              <p className="text-gray-700 leading-relaxed">
                                {userReview.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Show review form
                      <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                        <h3 className="font-medium text-gray-900 mb-3">Leave a review</h3>
                        {submitError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {submitError}
                          </div>
                        )}
                        <div className="mb-4">
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
                          className="mb-4 bg-white border-gray-200"
                          rows={4}
                          disabled={submitting}
                        />
                        <Button
                          onClick={handleSubmitRating}
                          disabled={newRating === 0 || submitting}
                          className="bg-[#00AA6C] hover:bg-[#008855]"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Review'
                          )}
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="mb-8 py-6 text-center bg-gray-50 rounded-xl">
                      <p className="text-gray-600 mb-3">
                        Sign in to leave a review
                      </p>
                      <Link href={ROUTES.login}>
                        <Button variant="outline" size="sm">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Other Reviews (exclude user's review since shown above) */}
                  {(() => {
                    const otherReviews = user
                      ? ratings.filter((r) => r.user_id !== user.id)
                      : ratings;

                    if (ratingsLoading) {
                      return (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-[#00AA6C]" />
                        </div>
                      );
                    }

                    if (otherReviews.length === 0 && !userReview) {
                      return (
                        <div className="text-center py-12 text-gray-500">
                          <p>No reviews yet. Be the first to review!</p>
                        </div>
                      );
                    }

                    if (otherReviews.length === 0) {
                      return null; // User's review is shown above, no other reviews
                    }

                    return (
                      <div className="space-y-0">
                        {otherReviews.map((rating, index) => (
                          <div
                            key={rating.id}
                            className={`py-5 ${index !== otherReviews.length - 1 ? 'border-b border-gray-100' : ''}`}
                          >
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={rating.user?.avatar_url ?? undefined} alt={rating.user?.full_name ?? ''} />
                                <AvatarFallback className="bg-gray-900 text-white text-sm">
                                  {rating.user?.full_name?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {rating.user?.full_name}
                                  </span>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < rating.score
                                            ? 'fill-[#00AA6C] text-[#00AA6C]'
                                            : 'fill-gray-200 text-gray-200'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">
                                  {formatDate(rating.created_at)}
                                </p>
                                {rating.comment && (
                                  <p className="text-gray-700 leading-relaxed">
                                    {rating.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact & Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Contact & Info</h2>
                <div className="space-y-4">
                  {gem.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(gem.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00AA6C]/10 transition-colors">
                        <MapPin className="h-4 w-4 text-gray-600 group-hover:text-[#00AA6C] transition-colors" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-[#00AA6C] transition-colors pt-1.5">
                        {gem.address}
                      </span>
                    </a>
                  )}
                  {gem.phone && (
                    <a
                      href={`tel:${gem.phone}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00AA6C]/10 transition-colors">
                        <Phone className="h-4 w-4 text-gray-600 group-hover:text-[#00AA6C] transition-colors" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-[#00AA6C] transition-colors">
                        {gem.phone}
                      </span>
                    </a>
                  )}
                  {gem.email && (
                    <a
                      href={`mailto:${gem.email}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00AA6C]/10 transition-colors">
                        <Mail className="h-4 w-4 text-gray-600 group-hover:text-[#00AA6C] transition-colors" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-[#00AA6C] transition-colors">
                        {gem.email}
                      </span>
                    </a>
                  )}
                  {gem.website && (
                    <a
                      href={gem.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00AA6C]/10 transition-colors">
                        <Globe className="h-4 w-4 text-gray-600 group-hover:text-[#00AA6C] transition-colors" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-[#00AA6C] transition-colors">
                        Visit Website
                      </span>
                    </a>
                  )}
                  {gem.opening_hours && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4 text-gray-600" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm text-gray-700 pt-1.5">{gem.opening_hours}</span>
                    </div>
                  )}
                  {gem.price_range && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-gray-600" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm text-gray-700">{gem.price_range}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              {gem.address && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
                  <div className="aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm mb-4">
                    Map coming soon
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(gem.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <Navigation className="h-4 w-4" strokeWidth={1.5} />
                    Get Directions
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
