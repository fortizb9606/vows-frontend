'use client';

import { Star, Check, MessageSquare } from 'lucide-react';

const reviews = [
  {
    name: 'María & Juan',
    date: '2026-03-20',
    rating: 5,
    text: 'Increíble experiencia. Todo salió perfecto, el equipo fue maravilloso.',
    replied: true,
  },
  {
    name: 'Camila & Tomás',
    date: '2026-02-15',
    rating: 5,
    text: 'Superó todas nuestras expectativas. 100% recomendado.',
    replied: true,
  },
  {
    name: 'Isidora & Matías',
    date: '2026-01-28',
    rating: 4,
    text: 'Muy buen servicio en general. Solo un pequeño retraso al inicio.',
    replied: false,
  },
  {
    name: 'Francisca & Andrés',
    date: '2025-12-10',
    rating: 5,
    text: 'La mejor decisión para nuestra boda. El lugar es mágico.',
    replied: true,
  },
];

// Calculate rating distribution
const ratingDistribution = {
  5: 3,
  4: 1,
  3: 0,
  2: 0,
  1: 0,
};

const totalReviews = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
const averageRating = (
  (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
).toFixed(1);

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reseñas</h1>

        <div className="flex gap-8">
          {/* Left Column - Rating Summary Card */}
          <div className="w-[280px] flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              {/* Average Rating */}
              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {averageRating}
                </div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Basado en {totalReviews} reseña{
                    totalReviews !== 1 ? 's' : ''
                  }
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((starCount) => (
                  <div key={starCount} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-8">{starCount}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{
                          width: `${
                            (ratingDistribution[starCount as keyof typeof ratingDistribution] /
                              totalReviews) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-6 text-right">
                      {ratingDistribution[starCount as keyof typeof ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Reviews List */}
          <div className="flex-1">
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header with Avatar, Name, Date, and Badge/Button */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-semibold text-blue-700">
                          {review.name.charAt(0)}
                        </span>
                      </div>

                      {/* Name and Date */}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.name}
                        </p>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                    </div>

                    {/* Respondida Badge or Responder Button */}
                    {review.replied ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <Check size={16} />
                        <span>Respondida</span>
                      </div>
                    ) : (
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm transition-colors">
                        <MessageSquare size={16} />
                        <span>Responder</span>
                      </button>
                    )}
                  </div>

                  {/* Star Rating */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
