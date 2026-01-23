import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Star,
  ChevronRight,
  UtensilsCrossed,
  Trees,
  Bed,
  Landmark,
  Mountain,
  Music,
  CircleDot,
  Users,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { GEM_CATEGORIES, ROUTES, AFRICAN_COUNTRIES } from '@/constants';

const categoryIcons: Record<string, React.ElementType> = {
  eat_drink: UtensilsCrossed,
  nature: Trees,
  stay: Bed,
  culture: Landmark,
  adventure: Mountain,
  entertainment: Music,
};

// Featured gems for showcase
const featuredGems = [
  {
    id: '1',
    name: 'The Secret Garden',
    location: 'Nairobi, Kenya',
    category: 'Eat & Drink',
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  },
  {
    id: '2',
    name: 'Ol Pejeta Bush Camp',
    location: 'Nanyuki, Kenya',
    category: 'Stay',
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',
  },
  {
    id: '3',
    name: 'Cape Point Trail',
    location: 'Cape Town, South Africa',
    category: 'Adventure',
    rating: 4.9,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
  },
  {
    id: '4',
    name: 'Lamu Old Town',
    location: 'Lamu, Kenya',
    category: 'Culture',
    rating: 4.8,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80',
  },
];

export default function HomePage() {
  const categories = Object.entries(GEM_CATEGORIES);
  const featuredCountries = AFRICAN_COUNTRIES.slice(0, 6);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="pt-16 md:pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6">
            Find your next gem...
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex-1 flex items-center px-6 py-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Places to go, things to do, gems to discover..."
                  className="w-full text-lg outline-none placeholder:text-gray-400"
                />
              </div>
              <button className="m-2 px-8 py-3 bg-[#34E0A1] hover:bg-[#2BC88E] text-[#092327] font-semibold rounded-full transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-nowrap justify-center gap-1 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide">
            <Link
              href={ROUTES.explore}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm text-gray-600 hover:text-[#00AA6C] border-b-2 border-transparent hover:border-[#00AA6C] transition-all whitespace-nowrap"
            >
              <CircleDot className="h-4 w-4" />
              <span className="font-medium">Search All</span>
            </Link>
            {categories.slice(0, 5).map(([key, category]) => {
              const Icon = categoryIcons[key] || CircleDot;
              return (
                <Link
                  key={key}
                  href={`${ROUTES.explore}?category=${key}`}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm text-gray-600 hover:text-[#00AA6C] border-b-2 border-transparent hover:border-[#00AA6C] transition-all whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{category.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Promo Section */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#34E0A1] rounded-3xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex-1 p-8 md:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-8 bg-[#092327] rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-[#34E0A1]" />
                    </div>
                    <span className="font-bold text-[#092327] text-lg">Hidden Gems</span>
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#092327] mb-4">
                  Discover Africa&apos;s<br />Best Kept Secrets
                </h2>
                <p className="text-[#11292E] text-lg mb-6">
                  From secret rooftop restaurants to breathtaking viewpoints.
                  Find extraordinary places curated by locals who know.
                </p>
                <Link
                  href={ROUTES.explore}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#092327] text-white font-semibold rounded-full hover:bg-[#11292E] transition-colors"
                >
                  Start Exploring
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="flex-1 p-8 hidden md:block">
                <div className="relative h-64">
                  <Image
                    src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80"
                    alt="African landscape"
                    fill
                    className="object-cover rounded-2xl"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Gems */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
              Featured Gems
            </h2>
            <Link
              href={ROUTES.explore}
              className="flex items-center gap-1 text-[#00AA6C] font-medium hover:underline"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGems.map((gem) => (
              <Link
                key={gem.id}
                href={`/gem/${gem.id}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={gem.image}
                    alt={gem.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-4 w-4 fill-[#00AA6C] text-[#00AA6C]" />
                    <span className="font-semibold text-[#1A1A1A]">{gem.rating}</span>
                    <span className="text-gray-500 text-sm">({gem.reviews})</span>
                  </div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-1 group-hover:text-[#00AA6C] transition-colors">
                    {gem.name}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {gem.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - For Owners */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#00AA6C] font-semibold uppercase tracking-wide text-sm">
              For Gem Owners
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mt-2">
              List Your Gem in 3 Steps
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Own a hidden gem? Get discovered by thousands of explorers across Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: TrendingUp,
                title: 'Submit Your Gem',
                description: 'Create an account and share details about your unique place. Upload stunning photos.',
              },
              {
                step: '2',
                icon: Shield,
                title: 'Get Verified',
                description: 'Our team reviews your submission to ensure quality and authenticity.',
              },
              {
                step: '3',
                icon: Users,
                title: 'Attract Visitors',
                description: 'Once approved, your gem becomes visible to thousands of explorers.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-[#34E0A1] rounded-full mb-4">
                  <item.icon className="h-8 w-8 text-[#092327]" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-[#092327] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 p-6 bg-[#F7F7F7] rounded-xl">
              <div>
                <p className="text-gray-600">Starting at just</p>
                <p className="text-3xl font-bold text-[#1A1A1A]">Ksh 500<span className="text-lg font-normal text-gray-500">/term</span></p>
              </div>
              <Link
                href={ROUTES.register}
                className="px-6 py-3 bg-[#092327] text-white font-semibold rounded-full hover:bg-[#11292E] transition-colors"
              >
                List Your Gem
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by Country */}
      <section className="py-12 px-4 bg-[#F7F7F7]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] text-center mb-8">
            Explore Gems Across Africa
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCountries.map((country) => (
              <Link
                key={country.code}
                href={`${ROUTES.explore}?country=${country.code}`}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#00AA6C] hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-[#F7F7F7] group-hover:bg-[#34E0A1]/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-[#11292E] group-hover:text-[#00AA6C]" />
                </div>
                <div>
                  <p className="font-medium text-[#1A1A1A] group-hover:text-[#00AA6C]">{country.name}</p>
                  <p className="text-sm text-gray-500">Explore</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={ROUTES.explore}
              className="inline-flex items-center gap-2 text-[#00AA6C] font-medium hover:underline"
            >
              View all countries
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-[#00AA6C] text-[#00AA6C]" />
            ))}
          </div>
          <blockquote className="text-xl md:text-2xl text-[#1A1A1A] mb-6">
            &quot;Hidden Gems helped us discover the most amazing rooftop restaurant in Nairobi
            that we would have never found on our own. The verification process means we can
            trust every recommendation.&quot;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-[#11292E] rounded-full flex items-center justify-center text-white font-bold">
              JK
            </div>
            <div className="text-left">
              <p className="font-semibold text-[#1A1A1A]">Jane Kamau</p>
              <p className="text-sm text-gray-500">Travel Blogger, Kenya</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-[#092327]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Discover?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of explorers finding extraordinary hidden gems across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={ROUTES.explore}
              className="px-8 py-4 bg-[#34E0A1] text-[#092327] font-semibold rounded-full hover:bg-[#2BC88E] transition-colors"
            >
              Start Exploring
            </Link>
            <Link
              href={ROUTES.register}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              List Your Gem
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
