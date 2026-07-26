import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { mediaUrl, type Service } from '@/services/public-api';

interface ServiceCardProps {
  service: Service;
  index: number;
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const imageUrl = mediaUrl(service.image || service.hero_images?.[0]?.image) || '';

  return (
    <Link href={`/services/${service.slug}`} className="" aria-label={`Read more about ${service.title}`}>
      <div>
        {/* Visual Header / Thumbnail */}
        {imageUrl ? (
          <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt={service.image_alt || service.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
              loading="lazy"
            />
            {service.price && parseFloat(service.price) > 0 && (
              <div className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-orange-600 shadow-sm backdrop-blur-xs">
                From ${parseFloat(service.price).toFixed(2)}
              </div>
            )}
          </div>
        ) : (
          <div className="relative mb-6 flex h-48 w-full items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
            {service.icon ? (
              <span className="text-6xl select-none" dangerouslySetInnerHTML={{ __html: service.icon }} />
            ) : (
              <span className="text-4xl text-gray-300">PicPixels</span>
            )}
            {service.price && parseFloat(service.price) > 0 && (
              <div className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-orange-600 shadow-sm backdrop-blur-xs">
                From ${parseFloat(service.price).toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Icon Badge */}
        {service.icon && imageUrl && (
          <div className="absolute top-44 left-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md border border-gray-50 transition-all duration-300 group-hover:bg-orange-500 group-hover:border-orange-500 motion-reduce:transition-none">
            <span
              className="text-2xl transition-transform duration-300 group-hover:scale-110"
              dangerouslySetInnerHTML={{ __html: service.icon }}
            />
          </div>
        )}

        {/* Content */}
        <div className={imageUrl ? "mt-4" : ""}>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors duration-300">
            {service.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-2">
            {service.short_description || service.description}
          </p>

          {/* Features Checklist */}
          {service.features && service.features.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-gray-50 pt-4">
              {service.features.slice(0, 3).map((feature, fi) => (
                <li key={fi} className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <span className="truncate">{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-500">
          Learn More
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transition-none" />
        </span>
      </div>
    </Link>
  );
}
