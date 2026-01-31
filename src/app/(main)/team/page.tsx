import Image from 'next/image';
import { Linkedin, Mail } from 'lucide-react';

const team = [
  {
    name: 'Anthony Chege',
    role: 'Founder & CEO',
    image: '/images/anthony-chege.png',
    bio: 'I built Gems because the best places in Africa aren\'t on Google.',
    quote: 'Africa is full of extraordinary places that most travelers never find.',
    linkedin: '#',
    email: 'anthony@gems.africa',
  },
  {
    name: 'Stephen Kamau',
    role: 'Co-founder & COO',
    image: '/team/stephen-kamau.jpg',
    bio: 'Operations and growth lead, ensuring Gems reaches every corner of Africa.',
    quote: 'Every hidden gem deserves to be discovered.',
    linkedin: '#',
    email: 'stephen@gems.africa',
  },
];

export default function TeamPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header section */}
      <div className="bg-[#092327] pt-8 pb-12 relative">
        <div className="text-center">
          <h2 className="text-white/60 text-sm font-medium tracking-wider uppercase">Meet the Team</h2>
        </div>
        {/* Torn edge bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 bg-[#F7F7F7]"
          style={{
            clipPath: 'polygon(0% 65%, 2% 40%, 5% 70%, 8% 35%, 12% 60%, 15% 30%, 18% 55%, 22% 25%, 26% 50%, 30% 20%, 34% 45%, 38% 25%, 42% 55%, 46% 30%, 50% 60%, 54% 25%, 58% 50%, 62% 20%, 66% 45%, 70% 30%, 74% 55%, 78% 25%, 82% 50%, 86% 35%, 90% 60%, 94% 40%, 97% 65%, 100% 35%, 100% 100%, 0% 100%)'
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 bg-[#F7F7F7] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                {/* Circular Photo with border */}
                <div className="w-40 h-40 rounded-full overflow-hidden shadow-xl mx-auto mb-6 ring-4 ring-white">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>

                {/* Info */}
                <span className="inline-block px-3 py-1 bg-[#00AA6C]/10 text-[#00AA6C] text-sm font-medium rounded-full mb-2">
                  {member.role}
                </span>
                <h2 className="text-2xl font-bold text-[#092327] mb-2">{member.name}</h2>
                <p className="text-gray-600 max-w-sm mx-auto mb-3">
                  {member.bio}
                </p>
                <p className="text-[#092327] italic text-sm mb-5">
                  "{member.quote}"
                </p>

                {/* Social Links */}
                <div className="flex gap-3 justify-center">
                  <a
                    href={member.linkedin}
                    className="h-10 w-10 rounded-full bg-white text-gray-600 hover:bg-[#00AA6C] hover:text-white transition-colors shadow-sm flex items-center justify-center"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    className="h-10 w-10 rounded-full bg-white text-gray-600 hover:bg-[#00AA6C] hover:text-white transition-colors shadow-sm flex items-center justify-center"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Torn edge before footer */}
      <div className="bg-[#F7F7F7]">
        <div
          className="h-8 bg-white"
          style={{
            clipPath: 'polygon(0% 35%, 3% 60%, 6% 40%, 10% 70%, 14% 45%, 18% 65%, 22% 35%, 26% 55%, 30% 30%, 34% 50%, 38% 25%, 42% 55%, 46% 35%, 50% 60%, 54% 40%, 58% 70%, 62% 45%, 66% 65%, 70% 35%, 74% 55%, 78% 30%, 82% 50%, 86% 40%, 90% 65%, 94% 45%, 97% 70%, 100% 50%, 100% 100%, 0% 100%)'
          }}
        />
      </div>
    </div>
  );
}
